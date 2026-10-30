import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartPulse - AI Business Intelligence"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartpulse-production-secret-key-2026")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartpulse.db")
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]
    SIMULATOR_INTERVAL_SECONDS: int = 15  # Auto-simulate an order every 15s if enabled
    LOW_STOCK_THRESHOLD: int = 15
    FORECAST_DAYS: int = 14

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

