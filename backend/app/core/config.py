from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
import uuid

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "info"
    
    # PostgreSQL Database Settings (Password: root)
    DATABASE_URL: str = "postgresql://postgres:root@localhost:5432/fintrack_db"
    ASYNC_DATABASE_URL: str = "postgresql+asyncpg://postgres:root@localhost:5432/fintrack_db"
    
    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # V1 Single User Default ID
    DEFAULT_USER_ID: uuid.UUID = uuid.UUID("00000000-0000-0000-0000-000000000000")
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
