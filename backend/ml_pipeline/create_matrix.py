import io
import base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from pathlib import Path
import seaborn as sns
import math

def get_matrix_plots_base64():
    # Setup paths
    BACKEND_DIR = Path(__file__).resolve().parent.parent
    csv_path = BACKEND_DIR / "classificationOutput.csv"
    save_path = BACKEND_DIR / "full_model_report.png"
    
    df_full = pd.read_csv(csv_path)

    # Filter for rows that actually contain model results
    rows_to_plot = df_full[df_full['TP1'].notna()]
    num_plots = len(rows_to_plot)
    
    # identify how many classes exist by counting columns starting with 'TP'
    tp_cols = [col for col in df_full.columns if col.startswith('TP')]
    num_classes = len(tp_cols)
    labels = [f"{i+1}" for i in range(num_classes)]
    
    # --- TASK 1: GENERATE & SAVE THE FULL REPORT (ALL MODELS) ---
    # define 2 rows and as many rows as needed for all models
    cols = 2
    rows = math.ceil(num_plots / cols)
    fig_full, axes_full = plt.subplots(rows, cols, figsize=(cols * 8, rows * 7))
    
    # ensure axes is always iterable(even if there is only 1 plot)
    if num_plots == 1:
        axes_full = np.array([axes_full])
    axes_flat = axes_full.flatten()

    # iterate through each model row to generate and plot the conf. matrix
    for idx, (i, row) in enumerate(rows_to_plot.iterrows()):
        conf_matrix = _generate_matrix(row, num_classes)
        ax = axes_flat[idx]

        # create a heatmap without numbers using red color map
        sns.heatmap(conf_matrix, annot=False, cmap="Reds", 
                    xticklabels=labels, yticklabels=labels, 
                    ax=ax, square=True, cbar=True)

        name = row.get('Classifier', row.get('Model', f"Model {idx+1}"))
        ax.set_title(f"Model: {name}", fontsize=14)

    # Clean up empty subplots
    for j in range(idx + 1, len(axes_flat)):
        axes_flat[j].axis('off')

    # adjust spacing and save the high-resolution PNG to the local disk
    plt.tight_layout(pad=3.0)
    fig_full.savefig(save_path, format='png', dpi=150) # Save all plots to disk
    plt.close(fig_full)

    # --- TASK 2: GENERATE THE FRONTEND PREVIEW (FIRST 3 MODELS) Simplified vertical layout---
    num_preview = min(3, num_plots)
    # We use a single column layout for the web preview as seen in your screenshots
    fig_ui, axes_ui = plt.subplots(num_preview, 1, figsize=(8, 6 * num_preview))
    
    if num_preview == 1:
        axes_ui = [axes_ui]

    for idx in range(num_preview):
        row = rows_to_plot.iloc[idx]
        conf_matrix = _generate_matrix(row, num_classes)
        sns.heatmap(conf_matrix, annot=False, cmap="Reds", 
                    xticklabels=labels, yticklabels=labels, 
                    ax=axes_ui[idx], square=True, cbar=True)
        
        name = row.get('Classifier', row.get('Model', f"Model {idx+1}"))
        axes_ui[idx].set_title(f"Model: {name} (Preview)", fontsize=14)

    plt.tight_layout()
    
    # Convert preview to Base64
    # Saves the plot to an in-memory buffer instead of a title
    buf = io.BytesIO()
    fig_ui.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    plt.close(fig_ui)
    buf.seek(0)
    
    # encode the binary image data to a string suitable for HTML image tags
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"

def _generate_matrix(row, num_classes):
    # Helper to reconstruct the confusion matrix from CSV rows.
    matrix = np.zeros((num_classes, num_classes), dtype=int)
    for c in range(num_classes):
        tp = row.get(f'TP{c+1}', 0)
        fn = row.get(f'FN{c+1}', 0)

        # set diagonal correct predictions
        matrix[c, c] = tp

        # distribute FN across other columns in the same row
        if num_classes > 1:
            err = fn // (num_classes - 1)
            for other_c in range(num_classes):
                if c != other_c:
                    matrix[c, other_c] = err
    return matrix