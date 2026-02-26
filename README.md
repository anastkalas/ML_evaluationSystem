# Classifiaction-Clustering Evaluation System

**A Full-Stack End-to-End Machine Learning Evaluation Platform**

---

## 📝 Overview
This system is a comprehensive analytical tool designed to automate the lifecycle of Machine Learning models. It bridges the gap between raw data and actionable insights by providing a structured environment for **Classification benchmarking**, **Unsupervised Clustering**, and **Deep Learning-based feature engineering**.

The platform is designed for reproducibility, allowing users to upload datasets, tune hyperparameters via a React interface, and receive detailed statistical evaluations and automated conclusions.

---

## 🚀 Key Features

### 1. Classification & Statistical Benchmarking
* **Automated Evaluation:** Trains multiple models including `Random Forest`, `SVM`, `Logistic Regression`, `LDA`, and `Naive Bayes`.
* **Validation Rigor:** Utilizes **Stratified K-Fold Cross-Validation** to ensure metrics like ROC-AUC and F1-Score are statistically sound.
* **Intelligent Conclusion:** Analyzes results to automatically identify and recommend the optimal model for the specific dataset based on Mean and STD of performance.

### 2. Clustering & Representation Learning
* **Stacked Autoencoders (SAE):** A Deep Learning pipeline built with **Keras** that compresses high-dimensional data (including image datasets) into a latent feature space.
* **Advanced Clustering:** Executes `K-Means` and `DBSCAN` on the optimized feature set.
* **Performance Metrics:** Computes **Silhouette** and **Davies-Bouldin** scores for internal validation.

### 3. Dynamic User Interface
* **Live Hyperparameter Tuning:** Dedicated forms to adjust algorithm parameters (C, eps, n_clusters, etc.) on-the-fly.
* **Visual Reports:** Automatically generates **Confusion Matrices** and performance heatmaps using Seaborn and Matplotlib.
* **Result Export:** Packages all metrics and visualizations into a downloadable `.zip` file.

---

## 📁 Project Structure
```text
├── backend/                        # Python Flask Backend
│   ├── clustering/                 # Unsupervised Learning Modules
│   │   ├── clusteringOutput.py     # Results generation logic
│   │   ├── dataLoader.py           # Dataset ingestion for clustering
│   │   ├── evaluation.py           # Clustering metrics (Silhouette, etc.)
│   │   ├── pipeline.py             # Execution orchestration
│   │   ├── preprocessing.py        # Data cleaning & scaling
│   │   ├── stackedAutoEncoder.py   # SAE for dimensionality reduction
│   │   └── visualization.py        # Cluster plotting & charts
│   ├── ml_pipeline/                # Classification Modules
│   │   ├── conclusion.py           # Model comparison & best-fit selection
│   │   ├── create_matrix.py        # Confusion Matrix generation
│   │   ├── data_loader.py          # Dataset ingestion for classification
│   │   ├── evaluation.py           # Stratified K-Fold cross-validation
│   │   ├── feature_selection.py    # Dimensionality reduction for classifiers
│   │   └── preprocessing.py        # Data cleaning & encoding
│   ├── services/                   # Orchestration Layer
│   │   ├── config_service.py       # Global parameter management
│   │   ├── outputAverages.py       # Multi-run metric averaging
│   │   └── pipeline_service.py     # Main service handler
│   ├── utils/                      # Helper Modules
│   │   └── file_utils.py           # File system & path management
│   ├── app.py                      # Flask API Entry Point
│   ├── config.py                   # Server & ML environment configuration
│   └── requirements.txt            # Python dependencies
│
├── frontend/                       # React Vite Application
│   ├── src/
│   │   ├── component/              # UI Components
│   │   │   ├── HomePage.jsx        # Landing page
│   │   │   ├── classification.jsx  # Classification dashboard
│   │   │   ├── clustering.jsx      # Clustering dashboard
│   │   │   ├── ClusteringTuning.jsx # Specialized clustering parameters
│   │   │   └── tuning.jsx          # General hyperparameter UI
│   │   ├── style/                  # Modular CSS Styling
│   │   │   ├── HomePage.css
│   │   │   ├── classification.css
│   │   │   ├── clustering.css
│   │   │   └── tuning.css
│   │   ├── App.jsx                 # Application Routing
│   │   ├── main.jsx                # React DOM entry point
│   │   └── index.css               # Global styles
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite build configuration
│
└── .gitignore                      # Global exclusion rules
```
## 🛠️ Installation & Setup

### 1. Prerequisites
Before you begin, ensure you have the following installed:
* **Python 3.8+**
* **Node.js & npm**
* **Virtual Environment** (Highly recommended to avoid dependency conflicts)

### 2. Backend Installation
Navigate to the project root directory and follow these steps to set up the Python environment:



```bash
# 1. Create a virtual environment
python -m venv venv

# 2. Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# 3. Install required Python dependencies
pip install -r requirements.txt

# 4. Start the Flask backend server
python app.py
```

### 3. Frontend Installation
Open a new terminal window, navigate to the `frontend` directory, and launch the React application:



```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install Node.js packages
npm install

# 3. Start the Vite development server
npm run dev
```
## 📊 Evaluation Metrics Computed

The platform performs a deep statistical analysis for every model executed. The following metrics are automatically calculated and presented in the final reports:

| Metric | Purpose |
| :--- | :--- |
| **Accuracy** | Measures the proportion of total correct predictions (both TP and TN) out of all instances. |
| **Precision** | Indicates the accuracy of positive predictions; the ratio of TP to the total predicted positives. |
| **Recall** | Measures the ability of the model to find all relevant cases (TP) within the actual positive class. |
| **ROC-AUC** | Measures the model's ability to distinguish between classes across all probability thresholds. |
| **F1-Score** | Provides the harmonic mean of Precision and Recall, ideal for evaluating imbalanced datasets. |
| **Confusion Matrix** | Provides a visual breakdown of True Positives (TP), False Positives (FP), True Negatives (TN), and False Negatives (FN). |
| **Silhouette Score** | Validates clustering quality by measuring how well-separated and cohesive the clusters are (higher is better). |
| **Davies-Bouldin Index** | Evaluates clustering by the average similarity between each cluster and its most similar one (lower is better). |

---


## 🛡️ Security & Best Practices

Data integrity and system security are core components of this pipeline:

* **Secure File Handling:** The backend utilizes `secure_filename` for all file uploads to prevent **Directory Traversal** attacks.
* **Credential Management:** Sensitive API keys (such as Kaggle credentials) are managed strictly via environment variables. 
    > **Note:** Ensure your `.env` file is included in your `.gitignore` to prevent accidental credential exposure.
* **Session Isolation:** Evaluation results and temporary plots are isolated using unique UUIDs to ensure multi-user stability.
