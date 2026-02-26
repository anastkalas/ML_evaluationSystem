import numpy as np
from sklearn.model_selection import train_test_split
import os
from PIL import Image

def prepare_clustering_dataset(x_raw, y_raw, test_size=0.2, random_state=42):
    # 1. Flatten and Normalize (Your existing logic is perfect)
    flat_dim = int(np.prod(x_raw.shape[1:]))
    x_norm = x_raw.astype('float32') / 255.0
    
    if len(x_raw.shape) > 2:
        x_norm = x_norm.reshape(x_norm.shape[0], flat_dim)

    # 2. Split with a "Safety Fallback"
    try:
        # Try to split with stratification (keeps class balance)
        x_train, x_test, y_train, y_test = train_test_split(
            x_norm, y_raw, test_size=test_size, random_state=random_state, stratify=y_raw
        )
    except ValueError:
        # If classes are too small for stratification, do a regular split
        print("WARNING: Stratified split failed (likely small classes). Falling back to regular split.")
        x_train, x_test, y_train, y_test = train_test_split(
            x_norm, y_raw, test_size=test_size, random_state=random_state
        )

    # 3. Metadata for the rest of the pipeline
    metadata = {
        "original_shape": x_raw.shape[1:],
        "flat_dim": flat_dim,
        "num_classes": len(np.unique(y_raw))
    }

    return x_train, x_test, y_train, y_test, metadata