import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
MAX_CONTENT_LENGTH = 50 * 1024 * 1024 # 50MB
ALLOWED_EXTENSIONS = {'csv'}