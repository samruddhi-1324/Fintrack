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
    
    # V1 Single User Default ID (used for backward compatibility / fallback)
    DEFAULT_USER_ID: uuid.UUID = uuid.UUID("00000000-0000-0000-0000-000000000000")
    
    # JWT & Auth Security Settings (Strictly Environment Driven)
    JWT_SECRET_KEY: str = "super_secret_jwt_key_fintrack_2026_change_in_prod"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Google OAuth 2.0 / OpenID Connect
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    
    # Cookie Security Settings
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: str = ""
    
    # Rate Limiting Settings
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/minute"
    RATE_LIMIT_RESET: str = "3/minute"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

