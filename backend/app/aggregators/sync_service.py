from typing import Any

from app.aggregators.deduplicator import JobDeduplicator
from app.aggregators.normalizer import JobNormalizer
from app.aggregators.provider_manager import ProviderManager
from app.database import get_database


class JobSyncService:
    """Synchronize external jobs into Supabase."""

    def __init__(
        self,
        provider_manager: ProviderManager | None = None,
    ) -> None:
        self.db = get_database()
        self.providers = (
            provider_manager
            or ProviderManager()
        )

    async def sync(
        self,
        *,
        keyword: str | None = None,
        location: str | None = None,
        page: int = 1,
        limit: int = 100,
    ) -> dict[str, Any]:
        """Fetch, normalize, deduplicate, and store jobs."""

        raw_jobs = await self.providers.fetch_all(
            keyword=keyword,
            location=location,
            page=page,
            limit=limit,
        )

        normalized_jobs = [
            JobNormalizer.normalize(
                job,
                job.get("_provider"),
            )
            for job in raw_jobs
        ]

        unique_jobs = JobDeduplicator.deduplicate(
            normalized_jobs
        )

        inserted = 0
        updated = 0
        failed = 0

        for job in unique_jobs:
            payload = {
                key: value
                for key, value in job.items()
                if key != "fingerprint"
            }

            try:
                existing = (
                    self.db.table("jobs")
                    .select("id")
                    .eq(
                        "external_id",
                        payload.get("external_id"),
                    )
                    .eq(
                        "source",
                        payload.get("source"),
                    )
                    .limit(1)
                    .execute()
                )

                if existing.data:
                    job_id = existing.data[0]["id"]

                    (
                        self.db.table("jobs")
                        .update(payload)
                        .eq("id", job_id)
                        .execute()
                    )

                    updated += 1

                else:
                    self.db.table("jobs").insert(
                        payload
                    ).execute()

                    inserted += 1

            except Exception:
                failed += 1

        return {
            "success": True,
            "fetched": len(raw_jobs),
            "unique": len(unique_jobs),
            "inserted": inserted,
            "updated": updated,
            "failed": failed,
        }
