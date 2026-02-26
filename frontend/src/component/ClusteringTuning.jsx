import { useState } from "react";
import '../style/clustStyle.css';
import axios from "axios";

export default function ClusteringTuning() {

    const [kmeansOpen, setKmeansOpen] = useState(false);
    const [dbscanOpen, setDbscanOpen] = useState(false);

    const [hyperparameters, setHyperparameters] = useState({
        kmeans: {
            n_clusters: 3,
            random_state: 42,
            algorithm: "lloyd"
        },
        dbscan: {
            eps: 0.5,
            min_samples: 5,
            metric: "euclidean",
            algorithm: "auto"
        }

    });

    function handleParamsChange(algorithm, parameter, value){
            setHyperparameters(prev => ({
                ...prev,
                [algorithm]:{
                    ...prev[algorithm],
                    [parameter]: value
                }
            }));
        }

    const save_parameters = async () => {
        try{
            const response = await axios.post('http://localhost:5000/save_clustering_hyperparameters',
                { hyperparameters: hyperparameters }, { withCredentials: true                     
                }
            );
            console.log("Hyperparameters saved successfully:", response.data);
        } catch (error) {
            console.error("Error saving hyperparameters:", error);
        }
    }

    return (
    <div className="clustering-tuning-page">
        <h1 className="title">Clustering Hyperparameters</h1>
        <div className="container">
            <div className="params-dropdown">
                <button className="dropdown-toggle" onClick={() => setKmeansOpen(!kmeansOpen)}>
                    <span className={`arrow ${kmeansOpen ? 'open' : ''}`}>▼</span>
                    Kmeans
                </button>
                <div className={`dropdown-panel ${kmeansOpen ? "open" : ""}`}>
                    <ul className="param-list">
                        <li>
                            <label>
                                n_clusters:  
                                <input type="number"
                                    className="param-input"
                                    value={hyperparameters.kmeans.n_clusters}
                                    onChange={e => {
                                        const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                        handleParamsChange("kmeans", "n_clusters", val);
                                    }} />
                            </label>
                        </li>
                        <li>
                            <label>
                                random_state:&nbsp;&nbsp;
                                <input type="number"
                                    className="param-input"
                                    placeholder="Enter Random State"
                                    onChange={e =>
                                        handleParamsChange("kmeans", "random_state", e.target.value === "" ? null: e.target.value)
                                }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                Algorithm:&nbsp;&nbsp;
                                <select className="param-select"
                                    value = {hyperparameters.kmeans.algorithm ?? "lloyd"}
                                    onChange={(e) => 
                                        handleParamsChange("kmeans", "algorithm", e.target.value)
                                    }>
                                    <option value="lloyd">Lloyd</option>
                                    <option value="elkan">Elkan</option>
                                </select>
                            </label>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="params-dropdown">
                <button className="dropdown-toggle" onClick={() => setDbscanOpen(!dbscanOpen)}>
                    <span className={`arrow ${dbscanOpen ? 'open' : ''}`}>▼</span>
                    DBSCAN
                </button>
                <div className={`dropdown-panel ${dbscanOpen ? "open" : ""}`}>
                    <ul className="param-list">
                        <li>
                            <label>
                                eps:&nbsp;&nbsp;
                                <input type="number"
                                className="eps"
                                placeholder="Enter Eps"
                                onChange={e => {
                                    const val = e.target.value === "" ? "" : parseFloat(e.target.value);
                                    handleParamsChange("dbscan", "eps", val);
                                }}/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                min_samples:&nbsp;&nbsp;
                                <input type="number"
                                className="min_samples"
                                placeholder="Enter Min Samples"
                                onChange={e => {
                                const val = e.target.value === "" ? "" : parseInt(e.target.value);
                                handleParamsChange("dbscan", "min_samples", val);
                            }}/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                Metric:&nbsp;&nbsp;
                                <input type="text"
                                className="metric"
                                placeholder="Enter Metric"
                                onChange={e => 
                                    handleParamsChange("dbscan", "metric", e.target.value)

                                }/>
                            </label>
                        </li>
                        <li>
                            <label>
                                Algorithm:&nbsp;&nbsp;
                                <select className="param-select"
                                    value = {hyperparameters.dbscan.algorithm ?? "auto"}
                                    onChange={(e) => 
                                        handleParamsChange("dbscan", "algorithm", e.target.value)
                                }>
                                    <option value="auto">auto</option>
                                    <option value="ball_tree">ball_tree</option>
                                    <option value="kd_tree">kd_tree</option>
                                    <option value="brute">brute</option>
                                </select>
                            </label>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <button className="save" onClick={save_parameters}>Save Changes</button>
    </div>
    );
};