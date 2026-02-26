import os
from werkzeug.utils import secure_filename
from config import ALLOWED_EXTENSIONS, UPLOAD_FOLDER
from pathlib import Path

# check if uploaded file has a valid extension
def allowed_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    )

""" 
    validate and securely save uploaded CSV file.
    returns absolutely file path if success otherwise raises error
"""
def save_uploaded_file(file):
    filename = file.filename

    if filename == "":
        raise ValueError("No file selected")
    
    if not allowed_file(filename):
        raise ValueError("Invalid file type. Only csv is allowed")
    
    # secure filename to prevent directory treaversal attacks
    safe_name = secure_filename(filename)

    # ensure uploads folder exists
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    # create full file path
    file_path = os.path.join(UPLOAD_FOLDER, safe_name)

    # save file to disk
    file.save(file_path)

    return file_path