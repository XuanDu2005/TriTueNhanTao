import os
from dotenv import load_dotenv

load_dotenv()

DATA_DIR = '/data'
os.makedirs(DATA_DIR, exist_ok=True)

class Config:
    UPLOAD_FOLDER = os.path.join(DATA_DIR, 'uploads')
    DATABASE_PATH = os.path.join(DATA_DIR, 'database.db')
    MAX_CONTENT_LENGTH = 20 * 1024 * 1024
    ALLOWED_EXTENSIONS = {'pdf'}
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
