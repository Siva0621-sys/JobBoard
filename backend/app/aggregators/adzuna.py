from typing import Any

import httpx

from app.aggregators.base_provider import BaseJobProvider
from app.config import settings


class AdzunaProvider(BaseJobProvider):
    """Adzuna job-search provider."""

    name = "adzuna"

    def __init__(self) -> None:
        self.app_id = settings.adzuna_app_id
        self.app_key = settings.adzuna_app_key
        self.country = settings.adzuna_country
        self.base_url = (
            "https://api.adzuna.com/v1/api/jobs"
        )

    async def fetch_jobs(
        self,
        *,
        keyword: str | None = None,
        location: str | None = None,
        page: int = 1,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        """Fetch jobs from Adzuna when credentials are configured."""

        if not self.app_id or not self.app_key:
            return []

        url = (
            f"{self.base_url}/"
            f"{self.country}/search/{page}"
        )

        params: dict[str, Any] = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "results_per_page": min(limit, 100),
            "content-type": "application/json",
        }

        if keyword:
            params["what"] = keyword

        if location:
            params["where"] = location

        try:
            async with httpx.AsyncClient(
                timeout=settings.http_timeout_seconds
            ) as client:
                response = await client.get(
                    url,
                    params=params,
                )
                response.raise_for_status()

            payload = response.json()
            return payload.get("results", [])

        except (httpx.HTTPError, ValueError):
            return []

    async def health_check(self) -> bool:
        """Check whether Adzuna credentials are configured."""
        return bool(
            self.app_id
            and self.app_key
        )
