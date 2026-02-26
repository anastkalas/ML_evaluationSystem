import os
import pandas as pd
import numpy as np
from PIL import Image

def download_kaggle_dataset(dataset_slug, target_folder="downloads"):
    """
    Downloads and extracts a Kaggle dataset using environment variables.
    """
    # Set credentials
    os.environ['KAGGLE_USERNAME'] = 'speedygonzalez1' 
    os.environ['KAGGLE_KEY'] = '478f6c02d12e8a18dde75600f7301db0' 
    
    import kaggle 
    
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)
    
    print(f"🚀 Downloading {dataset_slug}...")
    try:
        kaggle.api.authenticate() 
        # unzip=True handles the extraction immediately
        kaggle.api.dataset_download_files(dataset_slug, path=target_folder, unzip=True)
        print(f"✅ Dataset extracted to: {os.path.abspath(target_folder)}")
    except Exception as e:
        print(f"❌ Download Error: {e}")

def load_images_from_folder(root_path, target_size=(28, 28), color_mode='L'):
    """
    Scans for the first directory that contains subfolders with images.
    """
    x_data, y_data = [], []
    search_path = None
    valid_subdirs = []

    # Walk through the directory to find where the images are actually hidden
    for root, dirs, files in os.walk(root_path):
        # Look for folders that contain image files
        image_subdirs = []
        for d in dirs:
            subdir_path = os.path.join(root, d)
            files_in_sub = os.listdir(subdir_path)
            if any(f.lower().endswith(('.png', '.jpg', '.jpeg')) for f in files_in_sub):
                image_subdirs.append(d)
        
        # If we found at least one folder with images, this is our dataset root
        if image_subdirs:
            search_path = root
            valid_subdirs = sorted(image_subdirs)
            break

    if not search_path:
        return None, None, None

    class_to_idx = {name: i for i, name in enumerate(valid_subdirs)}
    print(f"📸 Found {len(valid_subdirs)} classes in: {search_path}")

    for label_name in valid_subdirs:
        subdir = os.path.join(search_path, label_name)
        for img_name in os.listdir(subdir):
            if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                img_path = os.path.join(subdir, img_name)
                try:
                    with Image.open(img_path) as img:
                        img = img.convert(color_mode).resize(target_size)
                        x_data.append(np.array(img))
                        y_data.append(class_to_idx[label_name])
                except:
                    continue
    
    return np.array(x_data), np.array(y_data), valid_subdirs

def load_csv_data(root_path):
    """
    Finds and loads the first CSV file found in the directory tree.
    """
    csv_path = None
    for root, dirs, files in os.walk(root_path):
        for f in files:
            if f.endswith('.csv'):
                csv_path = os.path.join(root, f)
                break
        if csv_path: break

    if not csv_path:
        return None, None, None
    
    print(f"📊 Loading CSV data from: {csv_path}")
    df = pd.read_csv(csv_path)
    
    # Simple heuristic: last column is label, others are numeric features
    y = df.iloc[:, -1].values
    x = df.iloc[:, :-1].select_dtypes(include=[np.number]).values
    return x, y, ["CSV_Data"]

def smart_load(root_path):
    """
    Main entry point: Tries to load images, falls back to CSV.
    """
    if not os.path.exists(root_path) or not os.listdir(root_path):
        print(f"⚠️ Warning: {root_path} is empty or does not exist.")
        return None, None, None

    print("🔍 Searching for data...")
    x, y, cls = load_images_from_folder(root_path)
    
    if x is not None and len(x) > 0:
        return x, y, cls
        
    print("No images found, checking for CSV...")
    x, y, cls = load_csv_data(root_path)
    
    if x is None or len(x) == 0:
        raise ValueError(f"FATAL: No valid image or CSV data found in {root_path}")
        
    return x, y, cls

# --- EXAMPLE USAGE ---
# target = "my_dataset"
# download_kaggle_dataset("bird-species-classification-220", target)
# x_raw, y_raw, classes = smart_load(target)