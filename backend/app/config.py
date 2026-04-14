import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:////tmp/siem_copilot.db" if os.getenv("VERCEL") else "sqlite:///./siem_copilot.db"
    )

    # AI Provider: "openai", "gemini", or "groq"
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "groq")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

    # App
    APP_TITLE: str = "SIEM Copilot API"
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"


settings = Settings()
