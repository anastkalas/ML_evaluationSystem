import "../style/clustering.css";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Clustering() {

    const [datasetURL, setDatasetURL] = useState("");
    // const [metrics, setMetrics] = useState(null);
    const [randomState, setRandomState] = useState("");
    const [testSize, setTestSize] = useState("");
    const [encodingDimensions, setEncodingDimensions] = useState("");
    const [taskId, setTaskId] = useState(null);
    const [metrics, setMetrics] = useState(null);

    /*useEffect(() => {
        const loadMetrics = async () => {
            try{
                const response = await axios.get("http://localhost:5000/get_latest_metrics");
                setMetrics(response.data);
                console.log(response.data);                
            }catch (error){
                console.error("Error fetching metrics: ", error);
            }
        };
        loadMetrics();
    }, []);*/

    useEffect(() => {
        let interval;

        if (taskId){
            interval = setInterval(async () => {
                try{
                    const response = await axios.post(
                        "http://localhost:5000/execute_clustering",
                        { task_id: taskId },
                        { withCredentials: true }
                    );

                    if (response.data.status == "completed"){
                        // Extract the metrics specifically
                        const kmeansMetrics = response.data.results.results.kmeans?.metrics;
                        const dbscanMetrics = response.data.results.results.dbscan?.metrics;

                        // Only print the metrics
                        console.log("--- KMeans Metrics ---");
                        console.log(kmeansMetrics);

                        console.log("--- DBSCAN Metrics ---");
                        console.log(dbscanMetrics || "No clusters found for DBSCAN");

                        const combinedMetrics = {
                            kmeans: kmeansMetrics,
                            dbscan: dbscanMetrics
                        };
                        setMetrics(combinedMetrics);

                        setTaskId(null);
                        clearInterval(interval);
                    }
                }
                catch(error){
                    console.log("Polling error: ", error);
                    clearInterval(interval);
                }
            }, 3000);
        }

        return () => clearInterval(interval);
    }, [taskId]);

    const handleInputChange = (event) => {
        setDatasetURL(event.target.value);
    }

    const downloadDataset = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/downloadClusteringDataset",
                { url: datasetURL },
                { withCredentials: true } // Add this
            );
            console.log(response.data);
        }
        catch(error){
            console.error("Error downloading dataset:", error);
        }
    }
        
    const execute_clustering = async () => {
        try{
            const response = await axios.post(
                "http://localhost:5000/execute_clustering",
                {
                    task_id: taskId,
                    random_state: randomState,
                    test_size: testSize,
                    encoding_dimensions: encodingDimensions
                },
                { withCredentials: true }
            );

            if (response.data.status  === "completed"){
                setTaskId(null); // Reset task ID after completion
            }else if (response.data.status === "running"){
                setTaskId(response.data.task_id); // Store task ID to check status later
            }

            console.log(response.data);

        } catch (error){
            if (error.response) {
                console.error("Backend Error Data:", error.response.data);
                alert("Error: " + error.response.data.error);
            } else {
                console.error("Network or CORS Error:", error.message);
            }
        }
    }

    const downloadResults = () => {
        // You can add logic here to check task status first
        window.location.href = "http://127.0.0.1:5000/download_all_results";
    };
    return (
        <div className="clustering-page">
            <h1 className="title">Clustering System</h1>
            <p>Upload a dataset, configure the experiment and compare multiple clustering algorithms</p>
            <h2 className="section1">1.Download Dataset from kaggle, Dimensionality Reduction and Clustering</h2>
            <div className="sect1">
                <div className='download-section'>
                    <input type="text" className="download-dataset" placeholder="Enter Kaggle Dataset URL" value={datasetURL} onChange={handleInputChange}/>
                    <button className="download-button" onClick ={downloadDataset}>Download Dataset</button>
                </div>
                <div className="state-test">
                    <div className="randomstate">
                        <p>Random State</p>
                        <input type="number" className="randomstate-input" placeholder="Enter Random State" onChange={(e) => setRandomState(e.target.value)}/>
                    </div>
                    <div className="testsize">
                        <p>Test Size</p>
                        <input type="number" min="0" max="1" step="0.01" className="testsize-input" placeholder="Enter Test Size" onChange={(e) => setTestSize(e.target.value)}/>
                    </div>
                </div>
                <p>Encoding Dimensions</p>
                <input type="text" className="encoding-dimensions" placeholder="Enter encoding dimensions for SAE(e.g.[256,128, 50]" onChange={(e) => setEncodingDimensions(e.target.value)}/>
                <br/>
                <button className="hyperparameter-button"><a href="/clustTuning">Tuning</a></button>
                <button className="clustering-execute" onClick={execute_clustering} >Execute</button>
            </div>
            <table className="results-table">
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th className="silhouette">Silhouette Score</th>
                            <th className="davies-bouldin">Davies-Bouldin Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ fontWeight: 'bold' }}>KMeans</td>
                            <td>{metrics?.kmeans?.silhouette.toFixed(3) || "—"}</td> 
                            <td>{metrics?.kmeans?.davies_bouldin.toFixed(3) || "—"}</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 'bold' }}>DBSCAN</td>
                            <td>{metrics?.dbscan?.silhouette.toFixed(3) || "—"}</td> 
                            <td>{metrics?.dbscan?.davies_bouldin.toFixed(3) || "—"}</td>
                        </tr>
                    </tbody>
            </table>
            <h3>Click DOWNLOAD if you want to download the plots.</h3>
            <button className="download-button" onClick={downloadResults}>Download Results (.zip)</button>
        </div>
    );
}
