import matplotlib.pyplot as plt
import numpy as np
import os
import io
import base64

def plot_clusters(x_test, labels, shape, samples_per_cluster=5, save_path=None):
    # 1. Get unique cluster IDs, excluding noise (-1)
    unique_clusters = sorted([c for c in np.unique(labels) if c != -1])
    n_clusters = len(unique_clusters)
    
    if n_clusters == 0:
        return None

    # 2. Create the figure
    fig = plt.figure(figsize=(samples_per_cluster * 2, n_clusters * 2))

    for row_idx, cluster_id in enumerate(unique_clusters):
        indices = np.where(labels == cluster_id)[0]
        n_samples = min(len(indices), samples_per_cluster)
        samples_indices = np.random.choice(indices, n_samples, replace=False)

        for col_idx, img_idx in enumerate(samples_indices):
            plt.subplot(n_clusters, samples_per_cluster, row_idx * samples_per_cluster + col_idx + 1)
            # Handle grayscale vs RGB shapes
            img_to_show = x_test[img_idx].reshape(shape)
            plt.imshow(img_to_show, cmap='gray' if len(shape) == 2 or shape[-1] == 1 else None)
            plt.axis('off')
            
            if col_idx == 0:
                plt.text(-5, shape[0]//2, f"ID: {int(cluster_id)}", 
                         va='center', ha='right', fontsize=10, fontweight='bold')

    plt.tight_layout()

    # --- NEW: PHYSICAL SAVE LOGIC ---
    if save_path:
        # Create directory if it doesn't exist (e.g., 'outputs/')
        dir_name = os.path.dirname(save_path)
        if dir_name and not os.path.exists(dir_name):
            os.makedirs(dir_name)
        
        # Save the file to disk
        plt.savefig(save_path, bbox_inches='tight', dpi=300)
        print(f"Cluster plot saved to: {save_path}")

    # 3. CONVERT TO BASE64
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    
    # 4. CLEAN UP
    plt.close(fig) 
    return img_base64