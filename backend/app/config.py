"""
Application configuration.
Loads settings from environment variables (.env file locally, or platform
environment variables on Render/Vercel).
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "GeoCrop EWS API"
    app_env: str = "development"

    # Database URL — defaults to local SQLite file for zero-config local dev.
    database_url: str = "sqlite:///./geocrop.db"

    # Comma separated list of allowed origins for CORS.
    cors_origins: str = "http://localhost:5173"

    # Path to the trained model artifacts.
    model_dir: str = "model"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()
