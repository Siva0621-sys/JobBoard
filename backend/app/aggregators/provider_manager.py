from typing import Any

from app.aggregators.adzuna import AdzunaProvider
from app.aggregators.base_provider import BaseJobProvider
from app.aggregators.remotive import RemotiveProvider


class ProviderManager:
    """Manage all configured external job providers."""

    def __init__(
        self,
        providers: list[BaseJobProvider] | None = None,
    ) -> None:
        self.providers = providers or [
            AdzunaProvider(),
            RemotiveProvider(),
        ]

    async def fetch_all(
        self,
        *,
        keyword: str | None = None,
        location: str | None = None,
        page: int = 1,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        """Fetch jobs from every configured provider."""

        all_jobs: list[dict[str, Any]] = []

        for provider in self.providers:
            try:
                jobs = await provider.fetch_jobs(
                    keyword=keyword,
                    location=location,
                    page=page,
                    limit=limit,
                )

                for job in jobs:
                    all_jobs.append(
                        {
                            "_provider": provider.name,
                            **job,
                        }
                    )

            except Exception:
                # One provider failure must not stop other providers.
                continue

        return all_jobs

    async def health(self) -> dict[str, bool]:
        """Return availability status for every provider."""

        results: dict[str, bool] = {}

        for provider in self.providers:
            try:
                results[provider.name] = (
                    await provider.health_check()
                )
            except Exception:
                results[provider.name] = False

        return results
