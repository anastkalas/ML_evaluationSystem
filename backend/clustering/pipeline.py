import time
import numpy as np
from sklearn.cluster import KMeans, DBSCAN
from sklearn.metrics import silhouette_score, davies_bouldin_score
from sklearn.preprocessing import StandardScaler

def run_clustering(data, method, params=None):
    print(f"DEBUG: Running {method} with params: {params}") # <--- ADD THIS
    if method == 'KMeans':
        # Ensure we use 'n_clusters' for sklearn compatibility
        n_val = int(params.get('n_clusters', 3)) 
        model = KMeans(n_clusters=n_val, n_init='auto', random_state=42)

    elif method == 'DBSCAN':
        eps_val = float(params.get('eps', 0.5)) 
        min_samples_val = int(params.get('min_samples', 5))
        model = DBSCAN(eps=eps_val, min_samples=min_samples_val)
    
    labels = model.fit_predict(data)
    unique_labels = set(labels)
    n_clusters = len(unique_labels) - (1 if -1 in unique_labels else 0)

    # Initialize scores with safe defaults
    scores = {
        "n_clusters_found": int(n_clusters),
        "silhouette": -1.0,
        "davies_bouldin": -1.0
    }

    # Only calculate metrics if clustering actually partitioned the data
    if n_clusters > 1:
        scores["silhouette"] = float(silhouette_score(data, labels))
        scores["davies_bouldin"] = float(davies_bouldin_score(data, labels))

    return labels, scores