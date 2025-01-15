import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-api-key")
MONGODB_USERNAME = os.getenv("MONGODB_USERNAME", "mongoadmin")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD", "password")
MONGODB_URL = f"mongodb://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@mongo:27017/"
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "lateral")
