import "../style/classification.css";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Classification() {

    const [target, setTarget] = useState("");
    const [normCols, setNormCols] = useState("");
    const [numFolds, setNumFolds] = useState(4);
    const [taskId, setTaskId] = useState(null);
    const [results, setResults] = useState(null);
    
    const [matrix, setMatrix] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [bestAlg, setBestAlg] = useState("");
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        const bestAlgReq = async () => {
            try{
                const response = await axios.get("http://localhost:5000/bestAlgorithm");

                setBestAlg(response.data);
                console.log(response.data);
            }
            catch(error){
                console.error("Error fetching best Model: ", error);
            }
        };

        bestAlgReq();
    }, []);

    useEffect(() => {
        // 1. Define the function inside the effect
        const loadMetrics = async () => {
            try {
                const response = await axios.post("http://localhost:5000/getMetrics");
                // This setState is fine because it happens AFTER the await (asynchronously)
                setMetrics(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching metrics:", error);
            }
        };

        // 2. Call it immediately
        loadMetrics();

    }, []); // Empty array ensures it only runs once on mount

    useEffect(() => {
        // Define the function inside the effect
        const loadMatrix = async () => {
            try {
                const response = await axios.post("http://localhost:5000/confusion-matrix");
                if (response.data.image) {
                    setMatrix(response.data.image);
                }
                console.log(matrix);
            } catch (error) {
                console.error("Error fetching Matrix: ", error);
            }
        };

        loadMatrix();
        // Leaving this empty [] means "run once on mount"
        // The linter is happy because we aren't using 'matrix' inside the logic 
        // in a way that requires tracking.
    }, []);

    const onFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    }

    const onFileUpload = async () => {
        if (!selectedFile) {
            console.error("Please select a file first!");
            return;
        }
        const formData = new FormData();
        formData.append(
            "file",
            selectedFile,
            selectedFile.name
        );
        console.log(selectedFile);
        try {
            axios.post("http://localhost:5000/upload", formData);
        }catch (error){
            console.error("Upload Failed: ", error);
        }
    }

    const handleDownload = async () => {
        const response = await fetch('http://localhost:5000/downloadResults');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'results.zip');
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const execute_classification = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/classification",
                {
                    task_id: taskId,
                    target_column: target,
                    norm_cols: normCols.split(',').map(c => c.trim()),
                    num_folds: Number(numFolds)
                }
            );

            console.log("Server Response:", response.data);

            if (response.data.status === "completed") {
                setTaskId(response.data.task_id);
                // ΠΡΟΣΟΧΗ: Το response.data.results περιέχει τα metrics και το conclusion
                setResults(response.data.results); 
            } else if (response.data.status === "running") {
                setTaskId(response.data.task_id);
            }

        } catch (error) {
            // Αν το backend στείλει 500, θα το δεις εδώ
            if (error.response) {
                console.error("Backend Error Data:", error.response.data);
                alert("Error: " + error.response.data.error);
            } else {
                console.error("Network or CORS Error:", error.message);
            }
        }
    };
    // Add this effect to check status every 3 seconds if a task is running
    useEffect(() => {
    let interval;
        if (taskId && !results) {
            interval = setInterval(async () => {
                try {
                    const response = await axios.post("http://localhost:5000/classification", {
                        task_id: taskId,
                    });

                    if (response.data.status === "completed") {
                        setResults(response.data.results);
                        setTaskId(null); 
                        clearInterval(interval);
                        
                        // Update matrix
                        const matrixRes = await axios.post("http://localhost:5000/confusion-matrix");
                        setMatrix(matrixRes.data.image);
                    } else if (response.data.status === "failed") {
                        // STOP polling if the background thread crashed
                        console.error("Task failed:", response.data.error);
                        alert("Classification failed: " + response.data.error);
                        setTaskId(null);
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error("Polling error:", error);
                    clearInterval(interval);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [taskId, results]);


    return (
        <div className="classification">
            <h1 className="title"> Classification System </h1>
            <p>Upload a dataset, configure the experiment and compare multiple classification algorithms</p>
            <h2 className="section1">1.Upload Dataset & Configure and Execute Experiment</h2>
            <div className="sect1">
                <div className='upload-section'>
                    <input type="file" className="upload-dataset" onChange={onFileChange}/>
                    <button className="upload-button" onClick={onFileUpload}>Upload Dataset</button>
                </div>
                <br />
                <label>Target Column</label>
                <input type="text" placeholder="Enter the target column" onChange={(e) => {setTarget(e.target.value)}}/>
                <br/>
                <label>Columns to normalize</label>
                <input type="text" placeholder="Enter columns to normalize" onChange={(e) => {setNormCols(e.target.value)}}/>
                <br/>
                <label>Number of Folds</label>
                <input type="number" placeholder="Enter number of folds" onChange={(e) => {setNumFolds(e.target.value)}}/>
                <br/>
                <button className="hyperparameter-button"><a href="/tuning">Hyperparameter Tuning</a></button>
                <button onClick={execute_classification} className="Execute-classification">Execute Classification Process</button>
            </div>
            <h2 className="metrics">2. Results for Every Classifier</h2>
            <table className="results-table">
                <thead>
                    <tr>
                        <th>Classifier</th>
                        <th className="acc">Accuracy</th>
                        <th className="prec">Precision</th>
                        <th className="rec">Recall</th>
                        <th className="f1">F1-Score</th>
                        <th className="auc">AUC</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ fontWeight: 'bold' }}>LDA</td>
                        <td>{metrics?.["LDA"]?.[0] || "—"}</td> 
                        <td>{metrics?.["LDA"]?.[1] || "—"}</td>
                        <td>{metrics?.["LDA"]?.[2] || "—"}</td>
                        <td>{metrics?.["LDA"]?.[3] || "—"}</td>
                        <td>{metrics?.["LDA"]?.[4] || "—"}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold'}}>Logistic Regression</td>
                        <td>{metrics?.["Logistic Regression"]?.[0] || "—"}</td> 
                        <td>{metrics?.["Logistic Regression"]?.[1] || "—"}</td>
                        <td>{metrics?.["Logistic Regression"]?.[2] || "—"}</td>
                        <td>{metrics?.["Logistic Regression"]?.[3] || "—"}</td>
                        <td>{metrics?.["Logistic Regression"]?.[4] || "—"}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold'}}>Decision Tree</td>
                        <td>{metrics?.["Decision Tree"]?.[0] || "—"}</td> 
                        <td>{metrics?.["Decision Tree"]?.[1] || "—"}</td>
                        <td>{metrics?.["Decision Tree"]?.[2] || "—"}</td>
                        <td>{metrics?.["Decision Tree"]?.[3] || "—"}</td>
                        <td>{metrics?.["Decision Tree"]?.[4] || "—"}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold'}}>Random Forest</td>
                        <td>{metrics?.["Random Forest"]?.[0] || "—"}</td> 
                        <td>{metrics?.["Random Forest"]?.[1] || "—"}</td>
                        <td>{metrics?.["Random Forest"]?.[2] || "—"}</td>
                        <td>{metrics?.["Random Forest"]?.[3] || "—"}</td>
                        <td>{metrics?.["Random Forest"]?.[4] || "—"}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold'}}>KNN</td>
                        <td>{metrics?.["kNN"]?.[0] || "—"}</td> 
                        <td>{metrics?.["kNN"]?.[1] || "—"}</td>
                        <td>{metrics?.["kNN"]?.[2] || "—"}</td>
                        <td>{metrics?.["kNN"]?.[3] || "—"}</td>
                        <td>{metrics?.["kNN"]?.[4] || "—"}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold'}}>Naive Bayes</td>
                        <td>{metrics?.["Naive Bayes"]?.[0] || "—"}</td> 
                        <td>{metrics?.["Naive Bayes"]?.[1] || "—"}</td>
                        <td>{metrics?.["Naive Bayes"]?.[2] || "—"}</td>
                        <td>{metrics?.["Naive Bayes"]?.[3] || "—"}</td>
                        <td>{metrics?.["Naive Bayes"]?.[4] || "—"}</td>
                    </tr>
                    <tr>
                        <td style={{ fontWeight: 'bold'}}>SVM</td>
                        <td>{metrics?.["SVC"]?.[0] || "—"}</td> 
                        <td>{metrics?.["SVC"]?.[1] || "—"}</td>
                        <td>{metrics?.["SVC"]?.[2] || "—"}</td>
                        <td>{metrics?.["SVC"]?.[3] || "—"}</td>
                        <td>{metrics?.["SVC"]?.[4] || "—"}</td>
                    </tr>
                </tbody>
            </table>
            <h2 className="confusion-matrix">3.Confusion Matrices for the Test Set</h2>
            <div className="matrix">
                {matrix ? (
                    <img 
                        src={matrix} 
                        alt="Confusion Matrix Grid" 
                        style={{ maxWidth: '100%', height: 'auto', border: '1px solid #ddd' }} 
                    />
                ) : (
                    <p>No plots available.</p>
                )}
            </div>
            <div className="downloadFile">
                <h2 className="download-results">4.Best Performing Algorithm & Download Results</h2>
                    {bestAlg && bestAlg.best_model ? (
                        <p>
                            The Best Performing Algorithm is:&nbsp; 
                            <strong>
                                {/* The ?. ensures it won't crash if the data isn't ready yet */}
                                {bestAlg.best_model?.[0]}
                            </strong>
                        </p>
                    ) : (
                        <p>Loading Best Model...</p>
                    )}
                <h3>Click DOWNLOAD if you want to download the classificationOutput.csv and the all the confusion matrices.</h3>
                <button className="download-button" onClick={handleDownload}>Download Results</button>
            </div>
        </div>
    );
};
