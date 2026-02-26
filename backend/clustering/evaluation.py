from dataLoader import download_kaggle_dataset, load_images_from_folder, smart_load
from preprocessing import prepare_clustering_dataset
from stackedAutoEncoder import build_autoencoder
from pipeline import run_clustering
import os
from visualization import plot_clusters

# 1. USER INPUT
dataset_name = input("Enter Kaggle dataset slug (e.g., puneet6060/intel-image-classification): ")
target_dir = "downloads"

x_raw, y_raw, class_names = smart_load(target_dir)

# 3. DETECT SUBFOLDERS
# Many Kaggle datasets have a 'train' or 'test' subfolder. We need to find where classes are.
potential_path = os.path.join(target_dir, "train") 
load_path = potential_path if os.path.exists(potential_path) else target_dir

# 4. LOAD AND PREPARE
IMG_SIZE = (28, 28)
x_raw, y_raw, classes = load_images_from_folder(load_path, target_size=IMG_SIZE)

# Catch all 5 items exactly as they are returned
x_train, x_test, y_train, y_test, meta = prepare_clustering_dataset(x_raw, y_raw)

print(f"Successfully loaded {len(x_raw)} images across {meta['num_classes']} classes.")

# 3. Reduce Dimensions (SAE)
# Compresses photo to 32 key features
sae_full, encoder = build_autoencoder(meta['flat_dim'], encoding_dim=[128, 64, 32])
sae_full.compile(optimizer='adam', loss='mse')
sae_full.fit(x_train, x_train, epochs=20, batch_size=32, verbose=0)

# Run Clustering
reduced_test_data = encoder.predict(x_test)
cluster_labels, scores = run_clustering(reduced_test_data, method='DBSCAN', params={'num_clusters': meta['num_classes'], 'eps': 7, 'min_samples': 15})

# output results
count = 0
print("Clustering Metrics: ", scores)
for key, val in scores.items():
    if count == 0:
        formatted_list = [f"{v:.4f}" for v in val]
        print(f"{key}: {formatted_list}")
        count += 1
    else:
        print(f"{key}: {val}")
        count -= 1
# visualize clusters
plot_clusters(x_test, cluster_labels, meta['original_shape'], samples_per_cluster=3)