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
    
    # Email Service Settings (100% Environment Driven)
    EMAIL_PROVIDER: str = "smtp"
    EMAIL_FROM: str = "FinTrack <your_email@gmail.com>"
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Local Gmail / Custom SMTP Settings
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_TLS: bool = True
    SMTP_SSL: bool = False
    
    # Resend API Settings (Production)
    RESEND_API_KEY: str = ""
    
    # Pluggable AI Provider Settings (Gemini / OpenAI / Rule-Based)
    AI_PROVIDER: str = "gemini"
    AI_ENABLED: bool = True
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    from pydantic import model_validator
    @model_validator(mode="after")
    def assemble_db_and_cors(self) -> "Settings":
        # Handle CORS string from env if passed as comma-separated string
        if isinstance(self.CORS_ORIGINS, str):
            self.CORS_ORIGINS = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
            
        # Standardize DATABASE_URL for Postgres/Supabase
        if self.DATABASE_URL and self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
        # Standardize ASYNC_DATABASE_URL for asyncpg
        if self.DATABASE_URL and "localhost:5432/fintrack_db" not in self.DATABASE_URL:
            if not self.ASYNC_DATABASE_URL or "localhost:5432/fintrack_db" in self.ASYNC_DATABASE_URL:
                self.ASYNC_DATABASE_URL = self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        if self.ASYNC_DATABASE_URL:
            if self.ASYNC_DATABASE_URL.startswith("postgres://"):
                self.ASYNC_DATABASE_URL = self.ASYNC_DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
            elif self.ASYNC_DATABASE_URL.startswith("postgresql://"):
                self.ASYNC_DATABASE_URL = self.ASYNC_DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
            
        return self

settings = Settings()


