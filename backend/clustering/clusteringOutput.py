import pandas as pd
import os

def clusteringOutput(results_dict, output_path="clustering_results"):
    if not os.path.exists(output_path):
        os.makedirs(output_path)

    rows = []

    for algo_name, data in results_dict.items():
        if "error" in data:
            rows.append({
                "Algorithm": algo_name.upper(),
                "Status": "Error/No Clusters",
                "n_clusters_found": 0,
                "silhouette": "N/A",
                "davies_bouldin": "N/A"
            })
        else:
            metrics = data.get("metrics", {})
            rows.append({
                "Algorithm": algo_name.upper(),
                "Status": "Success",
                "n_clusters_found": metrics.get("n_clusters_found"),
                "silhouette": metrics.get("silhouette"),
                "davies_bouldin": metrics.get("davies_bouldin")
            })

    # Create dataframe and save
    df = pd.DataFrame(rows)
    csv_files_path = os.path.join(output_path, "clusteringOutput.csv")
    df.to_csv(csv_files_path, index=False)

    print(f"Metrics saved to {csv_files_path}")
    return csv_files_path