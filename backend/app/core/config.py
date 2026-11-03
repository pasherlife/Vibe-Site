"""Application configuration using Pydantic Settings"""
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+psycopg2://postgres:postgres@localhost:5432/game_localization",
        description="Database connection URL"
    )
    
    # JWT Authentication
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        description="JWT Secret Key"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    DEBUG: bool = True
    APP_NAME: str = "Game Localization Portal"
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # File upload
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: set = {".locres", ".csv", ".json", ".txt"}
    UPLOAD_DIR: str = "uploads"
    
    @property
    def database_url(self) -> str:
        return self.DATABASE_URL
    
    @property
    def max_file_size_bytes(self) -> int:
        return self.MAX_FILE_SIZE_MB * 1024 * 1024


settings = Settings()
