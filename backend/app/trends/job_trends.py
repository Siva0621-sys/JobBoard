from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any


class JobTrendCalculator:
    """Calculate job-demand trends from real database records."""

    def __init__(self, db: Any) -> None:
        self.db = db

    async def calculate(
        self,
        days: int = 7,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc)
        recent_start = now - timedelta(days=days)
        previous_start = recent_start - timedelta(days=days)

        response = (
            self.db.table("jobs")
            .select(
                "id,title,company_name,category_name,"
                "published_at,views"
            )
            .gte(
                "published_at",
                previous_start.isoformat(),
            )
            .execute()
        )

        jobs = response.data or []

        recent_jobs: list[dict[str, Any]] = []
        previous_jobs: list[dict[str, Any]] = []

        for job in jobs:
            published_at = job.get("published_at")

            if not published_at:
                continue

            try:
                published = datetime.fromisoformat(
                    str(published_at).replace(
                        "Z",
                        "+00:00",
                    )
                )
            except ValueError:
                continue

            if published >= recent_start:
                recent_jobs.append(job)
            else:
                previous_jobs.append(job)

        previous_ids = {
            str(job.get("id"))
            for job in previous_jobs
        }

        results: list[dict[str, Any]] = []

        for job in recent_jobs:
            job_id = str(job.get("id"))

            # New jobs receive a real demand signal based on
            # publication recency and available view data.
            views = int(job.get("views", 0) or 0)

            repeat_signal = (
                1 if job_id in previous_ids else 0
            )

            score = (
                100
                + min(views, 1000) * 0.1
                + repeat_signal * 10
            )

            results.append(
                {
                    "job_id": job_id,
                    "title": job.get("title"),
                    "company_name": job.get(
                        "company_name"
                    ),
                    "category_name": job.get(
                        "category_name"
                    ),
                    "trend_score": round(score, 2),
                }
            )

        results.sort(
            key=lambda item: item["trend_score"],
            reverse=True,
        )

        for rank, item in enumerate(
            results[:limit],
            start=1,
        ):
            item["trend_rank"] = rank

        return results[:limit]
