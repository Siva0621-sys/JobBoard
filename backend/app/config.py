from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from backend/.env."""

    app_name: str = "JobBoard API"
    app_env: str = "development"
    debug: bool = True
    api_prefix: str = "/api/v1"

    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    cors_origins: str = (
        "http://localhost:5500,http://127.0.0.1:5500"
    )

    adzuna_app_id: str = ""
    adzuna_app_key: str = ""
    adzuna_country: str = "in"

    remotive_api_url: str = "https://remotive.com/api/remote-jobs"

    job_sync_enabled: bool = True
    job_sync_interval_minutes: int = Field(default=30, ge=1)
    job_sync_batch_size: int = Field(default=100, ge=1)

    trend_engine_enabled: bool = True
    trend_refresh_interval_minutes: int = Field(default=60, ge=1)

    http_timeout_seconds: int = Field(default=20, ge=1)
    http_max_retries: int = Field(default=3, ge=0)

    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Return CORS origins as a cleaned list."""
        return [
            origin.strip()
            for origin in self.cors_origins.split(",")
            if origin.strip()
        ]


@lru_cache
def get_settings() -> Settings:
    """Return a cached application settings instance."""
    return Settings()


settings = get_settings()
