import pandas as pd
from pathlib import Path
import os

# the script will load the file inside the uploads folder
# the uploads folder will not have two files at the same time
def load_dataset(target_column):
    uploads_dir = Path(__file__).resolve().parent.parent / 'uploads'
    if not uploads_dir.exists():
        raise FileNotFoundError(f"Uploads directory not found: {uploads_dir}")

    files = [p for p in uploads_dir.iterdir() if p.is_file()]
    if not files:
        raise FileNotFoundError(f"No files found in uploads directory: {uploads_dir}")

    dataset_path = files[0]
    df = pd.read_csv(dataset_path)

    if df.empty:  # Check if the DataFrame is empty
        raise ValueError("Dataset is empty.")

    df = df.dropna(how='all')

    df = df.fillna(df.select_dtypes(include=['number']).mean())

    X = df.drop(columns=[target_column])  # Features
    y = df[target_column]  # Target variable

    os.remove(dataset_path)
    
    return X, y, target_column, df