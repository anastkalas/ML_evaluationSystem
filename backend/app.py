from flask import Flask, request, jsonify, send_file, after_this_request
from config import UPLOAD_FOLDER, MAX_CONTENT_LENGTH
from utils.file_utils import save_uploaded_file
from services.pipeline_service import *
from services import config_service, outputAverages
from flask_cors import CORS
from ml_pipeline import *
from ml_pipeline.create_matrix import get_matrix_plots_base64
from ml_pipeline.conclusion import drawing_conclusion
import uuid
from services.pipeline_service import TASK_RESULTS
import io
import zipfile
from pathlib import Path
import threading

app = Flask(__name__) # creates flask application instance
CORS(app, resources={
    r"/*": {"origins": "http://localhost:5173"}
}, supports_credentials=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER # specify where uploaded files should be stored
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH # sets the maximum payload
ACTIVE_HYPERPARAMETERS = {}

@app.route("/downloadResults", methods=['GET'])
def download_result_files():

    try:
        # Resolve the directory where your result files are stored
        # Typically one level up from your backend script
        base_dir = Path(__file__).resolve().parent
        print(base_dir)
        # Define the specific files we want to include in the ZIP
        # 1. The CSV containing metrics and matrix data
        # 2. The high-resolution PNG with all 26 classes
        files_to_include = [
            base_dir / "classificationOutput.csv",
            base_dir / "full_model_report.png"
        ]

        # Use an in-memory byte stream to avoid creating a temporary .zip file on disk
        memory_file = io.BytesIO()

        # Create the ZIP archive within the memory stream
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            for file_path in files_to_include:
                if file_path.exists():
                    # arcname sets the name of the file inside the ZIP archive
                    zf.write(file_path, arcname=file_path.name)
                else:
                    # Log if a file is missing, but continue with the others
                    print(f"File not found for zipping: {file_path}")

        # Reset the stream pointer to the beginning so Flask can read it
        memory_file.seek(0)
        # Send the file to the frontend with correct headers
        return send_file(
            memory_file,
            mimetype='application/zip',
            as_attachment=True,
            download_name='ML_Classification_Results.zip'
        )
    except Exception as e:
        # Return the error message to help with debugging
        return jsonify({"error": str(e)}), 500

   

@app.route("/bestAlgorithm", methods=['GET'])
def conclusion():
    try:
        bestAlg = drawing_conclusion()
        # Use a single-word key like 'best_model'
        return jsonify({"best_model": bestAlg})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/confusion-matrix', methods=['POST'])
def confusion_matrix():
    try:
        img_data = get_matrix_plots_base64()
        return jsonify({"image": img_data})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/getMetrics', methods=['POST'])
def sent_metrics():
    metrics = outputAverages.metricsAvg()
    return jsonify(metrics)



@app.route('/upload', methods=['POST'])
def upload_file():
    # check if request contains file part
    if 'file' not in request.files:
        return jsonify({"error ": "No file part"}), 400

    # retrive the uploaded file from object
    file = request.files['file']

    try:
        filepath = save_uploaded_file(file)
        return jsonify({"message": "File uploaded successfully", "path": filepath}), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# 1. Update the background worker to use actual training functions

import pandas as pd
from sklearn.preprocessing import LabelEncoder

def background_training(tid, df, t_col, n_cols, folds):

    try:
        # 1. Clean the Target
        df = df.dropna(subset=[t_col])
        y = df[t_col]
        X = df.drop(columns=[t_col])
        # 2. Dynamic Feature Selection
        for col in X.columns:
            # If the column is text (object)
            if X[col].dtype == 'object':
                num_unique = X[col].nunique()
                total_rows = len(X)
                # RULE: If a text column has too many unique values (e.g., > 50% unique)
                # it is likely a Name, ID, or Address and will confuse the model.
                if num_unique > (total_rows * 0.5) and num_unique > 20:
                    print(f"Dropping high-cardinality column: {col}")
                    X = X.drop(columns=[col])
                else:
                    # RULE: Low-cardinality text (Gender, Color, Rank) -> Encode to numbers
                    print(f"Encoding categorical column: {col}")
                    X[col] = X[col].fillna('Missing')
                    le = LabelEncoder()
                    X[col] = le.fit_transform(X[col].astype(str))
        # 3. Handle Remaining Numeric Missing Values
        num_cols = X.select_dtypes(include=['number']).columns
        # Fill missing numbers with the average (mean)
        X[num_cols] = X[num_cols].fillna(X[num_cols].mean())
        # 4. Final Safety Check
        # Drop any columns that are still non-numeric (just in case)
        X = X.select_dtypes(include=['number'])
        # 5. Normalization
        # Only normalize columns that still exist after the drop
        existing_norm_cols = [c for c in n_cols if c in X.columns]
        if existing_norm_cols:
            # Replace this with your specific normalization function
            X = normalize_columns(X, existing_norm_cols)

        # 6. Run Training (assuming your existing functions)
        X_train, X_test, y_train, y_test = split_df(X, y)
        metrics_df = evaluate_model(X_train, X_test, y_train, y_test, folds)
        conclusion = drawing_conclusion()

        # Save result
        TASK_RESULTS[tid] = {
            "status": "completed",
            "metrics": metrics_df.to_dict(),
            "conclusion": conclusion
        }
    except Exception as e:
        print(f"General Pipeline Error: {e}")
        TASK_RESULTS[tid] = {"status": "failed", "error": str(e)}



@app.route('/classification', methods=['POST', 'OPTIONS']) # Added OPTIONS explicitly

def classification():

    # Handle preflight manually if CORS() fails to catch it

    if request.method == "OPTIONS":
        return "", 200
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        incoming_task_id = data.get("task_id")
        # 1. Check if we are just polling for an existing task
        if incoming_task_id and incoming_task_id in TASK_RESULTS:
            task_info = TASK_RESULTS[incoming_task_id]
            return jsonify({
                "status": task_info["status"],
                "task_id": incoming_task_id,
                "results": task_info if task_info["status"] == "completed" else None,
                "error": task_info.get("error")
            }), 200

        # 2. If it's a NEW task, validate and start
        target_col = data.get("target_column")
        if not target_col:
            return jsonify({"error": "Missing target_column"}), 400

        # Define variables for the thread
        new_id = str(uuid.uuid4())
        norm_cols = data.get("norm_cols", [])
        num_folds = int(data.get("num_folds", 4))
        # Initial loading
        X, y, target, data_df = load_dataset(target_col)
        TASK_RESULTS[new_id] = {"status": "running"}

        thread = threading.Thread(
            target=background_training,
            args=(new_id, data_df, target_col, norm_cols, num_folds)
        )
        thread.start()
        return jsonify({"status": "running", "task_id": new_id}), 202

    except Exception as e:
        print(f"CORS/Route Error: {e}") # This will show in your terminal
        return jsonify({"error": str(e), "status": "failed"}), 500



@app.route('/save_hyperparameters', methods=['POST', "OPTIONS"])
def set_parameters():

    if request.method == "OPTIONS":
        return "", 200
    data = request.get_json()

    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    if "hyperparameters" not in data:
        return jsonify({"error": "Missing hyperparameters"}), 400

    parameters = data["hyperparameters"]
    # checks if schema is a dictionary
    if not isinstance(parameters, dict):
        return jsonify({"error": "hyperparameters must be an object"}),400

    # Store validated schema
    global ACTIVE_HYPERPARAMETERS
    ACTIVE_HYPERPARAMETERS = parameters
    config_service.set_hyperparameters(parameters)
    algs_parameters = config_service.get_hyperparameters()
    return jsonify({
        "message": "Hyperparameters configuration stored successfully",
        "configured_algorithms": list(parameters.keys())
    }),200



""" Clustering endpoints and logic are seprate from classification"""

from clustering.dataLoader import download_kaggle_dataset
from clustering.stackedAutoEncoder import build_autoencoder
from clustering.pipeline import run_clustering
from clustering.dataLoader import load_images_from_folder
from clustering.preprocessing import prepare_clustering_dataset
from clustering.visualization import plot_clusters
import os
import base64
import matplotlib.pyplot as plt
import matplotlib
import numpy as np
import tensorflow as tf
import ast
from clustering.clusteringOutput import clusteringOutput
import shutil

# Use the 'Agg' backend to avoid the "non-interactive" warning and crashes in Flask threads
matplotlib.use('Agg')

def background_clustering(tid, dataset_path, raw_dims, r_state, t_size, img_size=(28, 28)):
    
    if os.path.exists("clustering_results"):
        shutil.rmtree("clustering_results")
    os.makedirs("clustering_results")

    tf.keras.backend.clear_session()
    try:

        try:
            if isinstance(raw_dims, str):
                encoding_dim = ast.literal_eval(raw_dims)
            else:
                encoding_dim = raw_dims
        except Exception:
            encoding_dim = [128, 64, 32]

        # Data loading & Autoencoder training (Condensed for brevity)
        x_raw, y_raw, _ = load_images_from_folder(dataset_path, target_size=img_size)
        x_train, x_test, y_train, y_test, meta = prepare_clustering_dataset(x_raw, y_raw)

        sae_full, encoder = build_autoencoder(meta['flat_dim'], encoding_dim=encoding_dim)
        sae_full.compile(optimizer='adam', loss='mse')
        sae_full.fit(x_train, x_train, epochs=10, batch_size=32, verbose=0)
        
        reduced_test_data = encoder.predict(x_test)

        # Scale Data(to interpret the eps correctly)
        # from sklearn.preprocessing import StandardScaler
        # reduced_test_data = StandardScaler().fit_transform(reduced_test_data)

        saved_params = config_service.get_hyperparameters()

        final_results = {}

    #    Execute both models with saved settings
        for method in ['KMeans', 'DBSCAN']:
            try:
                # use lowercase to match the React state keys
                lookup_key = method.lower()
                current_params = saved_params.get(lookup_key, {})
                
                labels, metrics = run_clustering(reduced_test_data, method, current_params)

                output_dir = os.path.join(os.getcwd(), "clustering_results")
                
                # DEBUG PRINT: Check how many clusters were actually found
                print(f"DEBUG: {method} found {metrics['n_clusters_found']} clusters.")

                if metrics['n_clusters_found'] > 0 or method == 'KMeans':
                    save_path = os.path.join(output_dir, f"plot_{tid[:8]}_{method.lower()}.png")
                    visual_data = plot_clusters(x_test, labels, meta['original_shape'], save_path=save_path)
                    
                    final_results[method.lower()] = {
                        "labels": labels.tolist(),
                        "metrics": metrics,
                        "plot": visual_data
                    }
                else:
                    print(f"WARNING: Skipping plot for {method} because 0 clusters were found.")
                    final_results[method.lower()] = {"error": "No clusters found. Try increasing EPS."}
                
            except Exception as inner_e:
                print(f"Error running {method}: {inner_e}")

        clusteringOutput(final_results, output_dir)

        if os.path.exists(dataset_path):
            try:
                shutil.rmtree(dataset_path)
                os.makedirs(dataset_path)
                print(f"DEBUG: Cleaned up {dataset_path} after processing.")
            except Exception as e:
                print(f"Cleanup Warning: {e}")

        print("----------------Final Results------------------")
        print(final_results)
        print(metrics)
        TASK_RESULTS[tid] = {
            "status": "completed",
            "results": final_results
        }

    except Exception as e:
        print(f"Global Pipeline Error: {e}")
        TASK_RESULTS[tid] = {"status": "failed", "error": str(e)}

@app.route('/downloadClusteringDataset', methods=['POST', 'OPTIONS'])
def download_clustering_dataset():
    if request.method == "OPTIONS":
        return "", 200
    data = request.get_json()
    dataset_slug = data.get("url")
    if not dataset_slug:
        return jsonify({"error": "Missing dataset_slug"}), 400
    try:
        download_kaggle_dataset(dataset_slug)
        return jsonify({"message": f"Dataset {dataset_slug} downloaded successfully."})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/save_clustering_hyperparameters', methods=['POST', "OPTIONS"])
def set_clustering_hyperparameters():
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json()
    if data is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    if "hyperparameters" not in data:
        return jsonify({"error": "Missing hyperparameters"}), 400

    parameters = data["hyperparameters"]
    # checks if schema is a dictionary
    if not isinstance(parameters, dict):
        return jsonify({"error": "hyperparameters must be an object"}),400
    # Store validated schema
    global ACTIVE_HYPERPARAMETERS
    ACTIVE_HYPERPARAMETERS = parameters
    config_service.set_hyperparameters(parameters)
    algs_parameters = config_service.get_hyperparameters()
    return jsonify({
        "message": "Hyperparameters configuration stored successfully",
        "configured_algorithms": list(parameters.keys())
    }),200

@app.route('/execute_clustering', methods=['POST', 'OPTIONS'])
def clustering():
    if request.method == "OPTIONS":
        return "", 200
    try:
        data = request.get_json()

        r_state = int(data.get("random state", 42))
        t_size = float(data.get("test_size", 0.2))

        raw_dims = data.get("encoding_dimensions", "[128, 64, 32]")
        incoming_task_id = data.get("task_id")

        # Polling Logic
        if incoming_task_id and incoming_task_id in TASK_RESULTS:
            task_data = TASK_RESULTS[incoming_task_id]
            
            response = {
                "status": task_data["status"],
                "task_id": incoming_task_id
            }
            
            if task_data["status"] == "completed":
                response["results"] = task_data
            elif task_data["status"] == "failed":
                response["error"] = task_data.get("error")
                
            return jsonify(response), 200

        # Start New Task Logic
        new_id = str(uuid.uuid4())
        dataset_path = os.path.join("downloads")

        # capture parameteres from frontend

        TASK_RESULTS[new_id] = {"status": "running"}

        thread = threading.Thread(
            target=background_clustering,
            args=(new_id, dataset_path, raw_dims, r_state, t_size))
        thread.start()
        
        return jsonify({"status": "running", "task_id": new_id}), 202
    
    except Exception as e:
        print(f"CORS/Clustering Route Error: {e}")
        return jsonify({"error": str(e), "status": "failed"}), 500

@app.route('/get_latest_metrics', methods=['GET', 'OPTIONS'])
def get_latest_metrics():
    if request.method == "OPTIONS":
        return "", 200
    
    if not TASK_RESULTS:
        return jsonify({"status": "idle", "message": "No tasks found"}), 200
    
    # get he last key inserted into the dictionary(the most recent task)
    latest_tid = list(TASK_RESULTS.keys())[-1]
    latest_data = TASK_RESULTS[latest_tid]

    return jsonify({
        "task_id": latest_tid,
        "status": latest_data["status"],
        "results": latest_data.get("results"),
        "error": latest_data.get("error")
    }), 200

@app.route("/download_all_results", methods=['GET'])
def download_all_results():
    directory = os.path.join(os.getcwd(), "clustering_results")
    zip_path = os.path.join(os.getcwd(), "clustering_report")

    if not os.path.exists(directory):
        return jsonify({"error": "No results found. Run clustering first."}), 404
    
    try:
        shutil.make_archive(zip_path, 'zip', directory)

        final_zip_name = f"{zip_path}.zip"

        # delete the zip file after
        @after_this_request
        def remove_file(response):
            try:
                if os.path.exists(final_zip_name):
                    os.remove(final_zip_name)
            except Exception as e:
                app.logger.error(f"Error deleting temporary zip: {e}")
            return response
        
        return send_file(
            final_zip_name,
            mimetype='application/zip',
            as_attachment=True,
            download_name='clustering_results_package.zip'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)