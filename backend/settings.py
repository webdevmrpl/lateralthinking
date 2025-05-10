import os
from authx import AuthX, AuthXConfig
from datetime import timedelta
from fastapi.security import HTTPBearer
from backend.schemas.users import User

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "your-api-key")
MONGODB_USERNAME = os.getenv("MONGODB_USERNAME", "mongoadmin")
MONGODB_PASSWORD = os.getenv("MONGODB_PASSWORD", "password")
MONGODB_URL = f"mongodb://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@mongo:27017/"
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "lateral")

auth_config = AuthXConfig(
    JWT_SECRET_KEY=os.getenv("JWT_SECRET_TOKEN", "changeme"),
    JWT_TOKEN_LOCATION=["cookies", "headers"],
    JWT_ACCESS_COOKIE_NAME="my_access_token",
    JWT_REFRESH_COOKIE_NAME="my_refresh_token",
    JWT_REFRESH_TOKEN_EXPIRES=timedelta(days=5),
)

security = AuthX(config=auth_config, model=User)
security_scheme = HTTPBearer()
