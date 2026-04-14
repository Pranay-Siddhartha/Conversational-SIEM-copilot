import os
from pydantic import Field, validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # App
    APP_TITLE: str = "SIEM Copilot API"
    CORS_ORIGINS: list[str] = [
    "http://localhost:3000",
    "https://conversational-siem-assisstant.vercel.app"
]

    # Database: sqlite:///data/app.db or environment override
    DATABASE_URL: str = Field(default="")

    # AI Provider: Required for production
    GROQ_API_KEY: str = Field(default="")

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
