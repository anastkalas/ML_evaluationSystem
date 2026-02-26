import "../style/tuning.css";
import { useState } from "react";
import axios from 'axios';
export default function Tuning() {

    const [ldaopen, setLdaOpen] = useState(false);
    const [logisticopen, setlogisticOpen] = useState(false);
    const [DTopen, setDTOpen] = useState(false);
    const [rfopen, setRFOpen] = useState(false);
    const [knopen, setKNOpen] = useState(false);
    const [nbopen, setNBOpen] = useState(false);
    const [svcopen, setSVCOpen] = useState(false);

    const [hyperparameters, setHyperparameters] = useState({
        lda: {
            solver: "svd",
            shrinkage: null,
            priors: null,
            n_components: null,
            store_covariance: false,
            tol: 0.0001,
            covariance_estimator: null
        },

        logistic_regression: {
            penalty: "l2",
            dual: false,
            tol: 0.0001,
            C: 1.0,
            fit_intercept: true,
            intercept_scaling: 1,
            class_weight: null,
            random_state: null,
            solver: "lbfgs",
            max_iter: 100000,
            verbose: 0,
            warm_start: false,
            l1_ratio: null
        },

        decision_tree: {
            criterion: "gini",
            splitter: "best",
            max_depth: null,
            min_samples_split: 2,
            min_samples_leaf: 1,
            min_weight_fraction_leaf: 0.0,
            max_features: null,
            random_state: null,
            max_leaf_nodes: null,
            min_impurity_decrease: 0.0,
            class_weight: null,
            ccp_alpha: 0.0
        },

        random_forest: {
            n_estimators: 100,
            criterion: "gini",
            max_depth: null,
            min_samples_split: 2,
            min_samples_leaf: 1,
            min_weight_fraction_leaf: 0.0,
            max_features: "sqrt",
            max_leaf_nodes: null,
            min_impurity_decrease: 0.0,
            bootstrap: true,
            oob_score: false,
            random_state: null,
            verbose: 0,
            warm_start: false,
            class_weight: null,
            ccp_alpha: 0.0,
            max_samples: null
        },

        knn: {
            n_neighbors: 5,
            weights: "uniform",
            algorithm: "auto",
            leaf_size: 30,
            p: 2,
            metric: "minkowski",
            metric_params: null
        },

        gaussian_nb: {
            priors: null,
            var_smoothing: 1e-9
        },

        svc: {
            C: 1.0,
            kernel: "rbf",
            degree: 3,
            gamma: "scale",
            coef0: 0.0,
            shrinking: true,
            probability: false,
            tol: 0.001,
            class_weight: null,
            verbose: false,
            max_iter: -1,
            decision_function_shape: "ovr",
            break_ties: false,
            random_state: null
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

    // send scheme to the backend
    const save_parameters = async () => {
        try{
            const response = await axios.post('http://localhost:5000/save_hyperparameters', 
                {
                    hyperparameters: hyperparameters
                }
            );
            console.log('Hyperparameters saved successfully:', response.data);
        }catch(error){
            console.error("Error Saving Parameters:", error);
        }
    }

    return (
        <div className="tuning">
            <h1 className="tuning-title"> Hyperparameter Tuning Options </h1>
            <div className="tuning-container">
                <div className="params-dropdown">
                <button className="dropdown-toggle" onClick={() => setLdaOpen(!ldaopen)}>
                    <span className={`arrow ${ldaopen ? "open" : ""}`}>▼</span>
                    LDA
                </button>
                <div className={`dropdown-panel ${ldaopen ? "open" : ""}`}>
                    <ul className="param-list">
                    <li>
                        <label>Solver:&nbsp;&nbsp;
                            <select  value={hyperparameters.lda.solver ?? ""}
                                className="solver-select"
                                onChange={e =>
                                    handleParamsChange("lda", "solver", e.target.value)
                                }>
                                    <option value="svd">svd</option>
                                    <option value="lsqr">lsqr</option>
                                    <option value="eigen">eigen</option>
                            </select>
                        </label>
                    </li>
                    <br/>
                    <li>
                        <label>
                            Shrinkage:&nbsp;&nbsp;
                            <input type="text"
                                placeholder="None, Auto or float value"
                                value={hyperparameters.lda.shrinkage ?? ""}
                                onChange={e =>
                                    handleParamsChange("lda", "shrinkage", e.target.value === "" ? null: e.target.value)
                                }
                                />
                        </label>
                    </li>
                    <br/>
                    <li>
                        <label>
                            Priors:&nbsp;&nbsp;
                            <input type="text"
                                value={hyperparameters.lda.priors ?? ""}
                                onChange={e =>
                                    handleParamsChange("lda", "priors", e.target.value === "" ? null: e.target.value)
                                }
                                placeholder="e.g. 0.6,0.4 or leave empty"/>
                        </label>
                    </li>
                    <br/>
                    <li>
                        <label>n_components:&nbsp;&nbsp;
                            <input type="text"
                            value = {hyperparameters.lda.n_components ?? ""}
                            onChange={e =>
                                handleParamsChange("lda", "n_components", e.target.value === "" ? null: e.target.value)
                            }
                            placeholder="None, int"/>
                        </label>
                    </li>
                    <br/>
                    <li>
                        <label>Store Covariance:&nbsp;&nbsp;True/False
                            <input type="checkbox"
                                checked={hyperparameters.lda.store_covariance}
                                onChange={e => 
                                    handleParamsChange("lda", "store_covariance", e.target.checked)}/>
                        </label>
                    </li>
                    <br/>
                    <li>
                        <label>
                            tol(float 0.0001 → 0.1):
                            <input
                                type="number"
                                min="0.0001"
                                max="0.1"
                                step="0.0001"
                                value={hyperparameters.lda.tol ?? ""}
                                onChange={e =>
                                    handleParamsChange("lda", "tol", e.target.value === "" ? null:Number(e.target.value))
                                }
                            />
                        </label>
                    </li>
                    <br/>
                    <li>
                        <label>
                            Covariance Estimator
                            <select className="covariance-select"
                                value={hyperparameters.lda.covariance_estimator ?? ""}
                                onChange={e =>
                                    handleParamsChange("lda", "covariance_estimator", e.target.value)
                                }>
                                    <option>None</option>
                                    <option>LedoitWolf</option>
                                    <option>OAS</option>
                                    <option>EmpiricalCovariance</option>
                                    <option>GraphicalLassoCV</option>
                            </select>
                        </label>
                    </li>
                    </ul>
                </div>
                </div>

                <div className="params-dropdown">
                <button className="dropdown-toggle" onClick={() => setlogisticOpen(!logisticopen)}>
                    <span className={`arrow ${logisticopen ? "open" : ""}`}>▼</span>
                    Logistic Regression
                </button>
                <div className={`dropdown-panel ${logisticopen ? "open" : ""}`}>
                    <ul className="param-list">
                        <li>
                            <label>Penalty:&nbsp;&nbsp;
                                <select className="penalty-select"
                                    value={hyperparameters.logistic_regression.penalty ?? ""}
                                    onChange={e =>
                                        handleParamsChange("logistic_regression", "penalty", e.target.value)
                                    }>
                                    <option value="l2">l2</option>
                                    <option value="l1">l1</option>
                                    <option value="elasticnet">elasticnet</option>
                                    <option value="none">None</option>
                                </select>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>l1_raito
                                <input 
                                    type="number"
                                    min="0" max="1"
                                    step="0.01"
                                    placeholder="Enter l1_ratio value"
                                    value={hyperparameters.logistic_regression.l1_ratio ?? ""}
                                    onChange={e =>
                                        handleParamsChange("logistic_regression", "l1_ratio", e.target.value === "" ? null:Number(e.target.value))
                                    }
                                />
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                Solver:
                                <select
                                    className="solver-select"
                                    value={hyperparameters.logistic_regression.solver ?? ""}
                                    onChange={e =>
                                        handleParamsChange("logistic_regression", "solver", e.target.value)
                                    }
                                >
                                        <option value="saga">saga</option>
                                        <option value="lbfgs">lbfgs</option>
                                </select>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>Max Iterations:
                                <input type="number"
                                    placeholder="Enter max iterations"
                                    value={hyperparameters.logistic_regression.max_iter ?? ""}
                                    onChange={e =>
                                        handleParamsChange("logistic_regression", "max_iter", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                Warm start:
                                <input type="checkbox"
                                checked={hyperparameters.logistic_regression.warm_start}
                                onChange={e => 
                                    handleParamsChange("logistic_regression", "warm_start", e.target.checked)}
                                />
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                fit_intercept:
                                <input type="checkbox"
                                checked={hyperparameters.logistic_regression.fit_intercept}
                                onChange={e => 
                                    handleParamsChange("logistic_regression", "fit_intercept", e.target.checked)}/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                class_weight:
                                <input type="checkbox"
                                    checked={hyperparameters.logistic_regression.class_weight}
                                    onChange={e => 
                                        handleParamsChange("logistic_regression", "class_weight", e.target.checked)}/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>Random State:
                                <input type="number"
                                    placeholder="Enter random state value"
                                    value={hyperparameters.logistic_regression.random_state ?? ""}
                                    onChange={e =>
                                        handleParamsChange("logistic_regression", "random_state", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                Verbose:
                                <input type="number"
                                    min="0"
                                    placeholder="Enter verbose level"
                                    value={hyperparameters.logistic_regression.verbose ?? ""}
                                    onChange={e =>
                                        handleParamsChange("logistic_regression", "verbose", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                    </ul>
                </div>
                </div>
                <div className="params-dropdown">
                <button className="dropdown-toggle" onClick={() => setDTOpen(!DTopen)}>
                    <span className={`arrow ${DTopen ? "open" : ""}`}>▼</span>
                    Decision Tree
                </button>
                <div className={`dropdown-panel ${DTopen ? "open" : ""}`}>
                    <ul className="param-list">
                        <li>
                            <label>
                                Criterion:&nbsp;&nbsp;
                                <select className="criterion-select"
                                    value={hyperparameters.decision_tree.criterion ?? ""}
                                    onChange={e =>
                                        handleParamsChange("decision_tree", "criterion", e.target.value)
                                    }>
                                        <option value="gini">gini</option>
                                        <option value="entropy">entropy</option>
                                        <option value="log_loss">log_loss</option>
                                </select>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                Splitter:&nbsp;&nbsp;
                                <select className="splitter-select"
                                    value={hyperparameters.decision_tree.splitter ?? ""}
                                    onChange={e =>
                                        handleParamsChange("decision_tree", "splitter", e.target.value)
                                    }>
                                        <option value="best">best</option>
                                        <option value="random">random</option>
                                </select>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                max_depth:
                                <input type="number"
                                    min="1"
                                    placeholder="Enter max depth"
                                    value={hyperparameters.decision_tree.max_depth ?? ""}
                                    onChange={e =>
                                        handleParamsChange("decision_tree", "max_depth", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                min_samples_split:
                                <input type="number"
                                    min="2"
                                    placeholder="Enter min samples split"
                                    value={hyperparameters.decision_tree.min_samples_split ?? ""}
                                    onChange={e =>
                                        handleParamsChange("decision_tree", "min_samples_split", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                min_samples_leaf:
                                <input type="number"
                                    min="1"
                                    placeholder="Enter min samples leaf"
                                    value={hyperparameters.decision_tree.min_samples_leaf ?? ""}
                                    onChange={e =>
                                        handleParamsChange("decision_tree", "min_samples_leaf", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                max_features:&nbsp;&nbsp;
                                <input type="text"
                                    placeholder="sqrt, log2, None or int"
                                    value={hyperparameters.decision_tree.max_features ?? ""}
                                    onChange={e =>
                                        handleParamsChange("decision_tree", "max_features", e.target.value === "" ? null: e.target.value)
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                random_state:&nbsp;&nbsp;
                                <input type="number"
                                    placeholder="Enter random state value"
                                    value={hyperparameters.decision_tree.random_state ?? ""}
                                    onChange={e =>
                                        handleParamsChange("decision_tree", "random_state", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                max_leaf_nodes:&nbsp;&nbsp;
                                <input type="number"
                                    min="0"
                                    placeholder="Enter max leaf nodes"
                                    value={hyperparameters.decision_tree.max_leaf_nodes ?? ""}
                                    onChange={e =>
                                        handleParamsChange("decision_tree", "max_leaf_nodes", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                class_weight:&nbsp;&nbsp;
                                <input type="text"
                                    placeholder="dict, list of dict or “balanced”, default=None"
                                    value={hyperparameters.decision_tree.class_weight ?? ""}
                                    onChange={e =>
                                        handleParamsChange("decision_tree", "class_weight", e.target.value === "" ? null: e.target.value)
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                ccp_alpha:&nbsp;&nbsp;
                                <input type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter ccp_alpha value"
                                    value={hyperparameters.decision_tree.ccp_alpha ?? ""}
                                    onChange={e =>
                                        handleParamsChange("decision_tree", "cpp_alpha", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                    </ul>
                </div>
                </div>
                <div className="params-dropdown">
                <button className="dropdown-toggle" onClick={() => setRFOpen(!rfopen)}>
                    <span className={`arrow ${rfopen ? "open" : ""}`}>▼</span>
                    Random Forest
                </button>
                <div className={`dropdown-panel ${rfopen ? "open" : ""}`}>
                    <ul className="param-list">
                        <li>
                            <label>
                                n_estimators:&nbsp;&nbsp;
                                <input type="number"
                                    min="10"
                                    max="100"
                                    placeholder="defalt value is 100"
                                    value={hyperparameters.random_forest.n_estimators ?? ""}
                                    onChange={e =>
                                        handleParamsChange("random_forest", "n_estimators", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                Criterion:&nbsp;&nbsp;
                                <select className="criterion-select"
                                    value={hyperparameters.random_forest.criterion ?? ""}
                                    onChange={e =>
                                        handleParamsChange("random_forest", "criterion", e.target.value)
                                    }>
                                    <option value="gini">gini</option>
                                    <option value="entropy">entropy</option>
                                    <option value="log_loss">log_loss</option>
                                </select>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                max_depth:
                                <input type="text"
                                    min="1"
                                    placeholder="Enter max depth. Mininmum value=1 other int or None"
                                    value={hyperparameters.random_forest.max_depth ?? ""}
                                    onChange={e =>
                                        handleParamsChange("random_forest", "max_depth", e.target.value === "" ? null: e.target.value)
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                min_samples_leaf:
                                <input type="number"
                                    min="1"
                                    placeholder="Enter min samples leaf"
                                    value={hyperparameters.random_forest.min_samples_leaf ?? ""}
                                    onChange={e =>
                                        handleParamsChange("random_forest", "min_samples_leaf", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                min_weight_fraction_leaf:
                                <input type="number"
                                    min="0"
                                    max="0.5"
                                    step="0.01"
                                    placeholder="Enter min weight fraction leaf"
                                    value={hyperparameters.random_forest.min_weight_fraction_leaf ?? ""}
                                    onChange={e =>
                                        handleParamsChange("random_forest", "min_weight_fraction_leaf", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                max_features:&nbsp;&nbsp;
                                <input type="text"
                                    placeholder="None, sqrt, log2, int or float value"
                                    value={hyperparameters.random_forest.max_features ?? ""}
                                    onChange={e =>
                                        handleParamsChange("random_forest", "max_features", e.target.value === "" ? null: e.target.value)
                                    }/>
                            </label>
                        </li>
                        <li>
                            <label>
                                max_leaf_nodes:&nbsp;&nbsp;
                                <input type="number"
                                    placeholder="None or int"
                                    value={hyperparameters.random_forest.max_leaf_nodes ?? ""}
                                    onChange={e =>
                                        handleParamsChange("random_forest", "max_leaf_nodes", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                bootstrap:&nbsp;&nbsp;
                                <input type="checkbox"
                                    checked={hyperparameters.random_forest.bootstrap}
                                    onChange={e => 
                                        handleParamsChange("random_forest", "bootstrap", e.target.checked)}/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                random_state:&nbsp;&nbsp;
                                <input type="number"
                                    placeholder="Enter random state value"
                                    value={hyperparameters.random_forest.random_state ?? ""}
                                    onChange={e =>
                                        handleParamsChange("random_forest", "random_state", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                verbose:&nbsp;&nbsp;
                                <input type="number"
                                    min="0"
                                    placeholder="Enter verbose level"
                                    value={hyperparameters.random_forest.verbose ?? ""}
                                    onChange={e =>
                                        handleParamsChange("random_forest", "verbose", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                class_weight:&nbsp;&nbsp;
                                <input type="text"
                                    placeholder="dict, list of dict or “balanced”, default=None"
                                    value={hyperparameters.random_forest.class_weight ?? ""}
                                    onChange={e =>
                                        handleParamsChange("random_forest", "class_weight", e.target.value === "" ? null: e.target.value)
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                ccp_alpha:&nbsp;&nbsp;
                                <input type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Enter ccp_alpha value"
                                    value={hyperparameters.random_forest.ccp_alpha ?? ""}
                                    onChange={e =>
                                        handleParamsChange("random_forest", "ccp_alpha", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                    </ul>
                </div>
                </div>
                <div className="params-dropdown">
                <button className="dropdown-toggle" onClick={() => setKNOpen(!knopen)}>
                    <span className={`arrow ${knopen ? "open" : ""}`}>▼</span>
                    KNN
                </button>
                <div className={`dropdown-panel ${knopen ? "open" : ""}`}>
                    <ul className="param-list">
                        <li>
                            <label>
                                n_neighbors
                                <input type="number"
                                placeholder="Number of Neighbors to use"
                                value={hyperparameters.knn.n_neighbors ?? ""}
                                    onChange={e =>
                                        handleParamsChange("knn", "n_neighbors", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                weights
                                <input type="text"
                                    placeholder="uniform, distance or None"
                                    value={hyperparameters.knn.weights ?? ""}
                                    onChange={e =>
                                        handleParamsChange("knn", "weights", e.target.value === "" ? null:e.target.value)
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                algorithm
                                <input type="text"
                                    placeholder="auto, ball_tree, kd_tree, brute"
                                    value={hyperparameters.knn.algorithm ?? ""}
                                    onChange={e =>
                                        handleParamsChange("knn", "algorithm", e.target.value === "" ? null:e.target.value)
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                leaf_size
                                <input type="number"
                                    value={hyperparameters.knn.leaf_size ?? ""}
                                    onChange={e =>
                                        handleParamsChange("knn", "leaf_size", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                p
                                <input type="number"
                                    placeholder="1=manhattan distance 2=euclidean distance"
                                    value={hyperparameters.knn.p ?? ""}
                                    onChange={e =>
                                        handleParamsChange("knn", "p", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                    </ul>
                </div>
                </div>
                <div className="params-dropdown">
                <button className="dropdown-toggle" onClick={() => setNBOpen(!nbopen)}>
                    <span className={`arrow ${nbopen ? "open" : ""}`}>▼</span>
                    Gaussian Naive Bayes
                </button>
                <div className={`dropdown-panel ${nbopen ? "open" : ""}`}>
                    <ul className="param-list">
                        <li>
                            <label>
                                priors:
                                <input type="text"
                                    placeholder="array-like of shape(n_classes), default=None"
                                    value={hyperparameters.gaussian_nb.priors ?? ""}
                                    onChange={e =>
                                        handleParamsChange("gaussian_nb", "priors", e.target.value === "" ? null: e.target.value)
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                var_smoothing
                                <input type="number"
                                    placeholder="float, default=1e-9"
                                    value={hyperparameters.gaussian_nb.var_smoothing ?? ""}
                                    onChange={e =>
                                        handleParamsChange("gaussian_nb", "smoothing", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                    </ul>
                </div>
                </div>
                <div className="params-dropdown">
                <button className="dropdown-toggle" onClick={() => setSVCOpen(!svcopen)}>
                    <span className={`arrow ${svcopen ? "open" : ""}`}>▼</span>
                    SVC
                </button>
                <div className={`dropdown-panel ${svcopen ? "open" : ""}`}>
                    <ul className="param-list">
                        <li>
                            <label>
                                C:
                                <input type="number"
                                    placeholder="float or the default=1.0"
                                    value={hyperparameters.svc.C ?? ""}
                                    onChange={e =>
                                        handleParamsChange("svc", "C", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                kernel:
                                <input type="text"
                                    placeholder="linear, poly, rbf, sigmoid, precomputed, default=rbf"
                                    value={hyperparameters.svc.kernel ?? ""}
                                    onChange={e =>
                                        handleParamsChange("svc", "kernel", e.target.value === "" ? null: e.target.value)
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                gamma:
                                <input type="text"
                                    placeholder="auto, scale or float, default=scale"
                                    value={hyperparameters.svc.gamma ?? ""}
                                    onChange={e =>
                                        handleParamsChange("svc", "gamma", e.target.value === "" ? null: e.target.value)
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                degree:
                                <input type="number"
                                    placeholder="default=3"
                                    value={hyperparameters.svc.degree ?? ""}
                                    onChange={e =>
                                        handleParamsChange("svc", "degree", e.target.value === "" ? null:Number(e.target.value))
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                class_weight:
                                <input type="text"
                                    placeholder="dict or balanced, default=None"
                                    value={hyperparameters.svc.class_weight ?? ""}
                                    onChange={e =>
                                        handleParamsChange("svc", "class_weight", e.target.value === "" ? null: e.target.value)
                                    }/>
                            </label>
                        </li>
                        <br/>
                        <li>
                            <label>
                                probability:
                                <input type="checkbox"
                                    checked={hyperparameters.svc.probability}
                                    onChange={e => 
                                        handleParamsChange("svc", "probability", e.target.checked)}/>
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