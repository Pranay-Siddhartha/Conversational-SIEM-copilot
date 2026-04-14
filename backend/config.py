import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    # Default is handled in db/database.py but can be overridden here via env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    # AI Provider (Strictly Groq)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    # App
    APP_TITLE: str = "SIEM Copilot API"
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
