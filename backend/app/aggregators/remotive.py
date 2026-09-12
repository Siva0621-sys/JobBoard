from typing import Any

import httpx

from app.aggregators.base_provider import BaseJobProvider
from app.config import settings


class RemotiveProvider(BaseJobProvider):
    """Remotive remote-job provider."""

    name = "remotive"

    async def fetch_jobs(
        self,
        *,
        keyword: str | None = None,
        location: str | None = None,
        page: int = 1,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        """Fetch remote jobs from Remotive."""

        params: dict[str, Any] = {
            "limit": min(limit, 100),
        }

        if keyword:
            params["search"] = keyword

        try:
            async with httpx.AsyncClient(
                timeout=settings.http_timeout_seconds
            ) as client:
                response = await client.get(
                    settings.remotive_api_url,
                    params=params,
                )
                response.raise_for_status()

            payload = response.json()
            jobs = payload.get("jobs", [])

            if location:
                location_value = location.lower().strip()
                jobs = [
                    job
                    for job in jobs
                    if location_value
                    in str(
                        job.get("candidate_required_location", "")
                    ).lower()
                ]

            return jobs

        except (httpx.HTTPError, ValueError):
            return []

    async def health_check(self) -> bool:
        """Check whether Remotive's API responds successfully."""

        try:
            async with httpx.AsyncClient(
                timeout=settings.http_timeout_seconds
            ) as client:
                response = await client.get(
                    settings.remotive_api_url,
                    params={"limit": 1},
                )
                return response.is_success

        except httpx.HTTPError:
            return False
