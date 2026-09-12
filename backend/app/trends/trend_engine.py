from datetime import datetime, timedelta, timezone
from typing import Any


class TrendEngine:
    """
    Calculate and persist transparent job trends.

    Job-level trend ranking is based on:
    - publication recency
    - actual stored views

    No fake engagement or popularity data is generated.
    """

    def __init__(self, db: Any) -> None:
        self.db = db

    @staticmethod
    def _recency_score(
        published_at: datetime,
        now: datetime,
        days: int,
    ) -> float:
        """
        Give newer jobs a higher score.

        A job published now is close to 100.
        A job at the end of the period approaches 0.
        """

        age_seconds = max(
            0.0,
            (now - published_at).total_seconds(),
        )

        period_seconds = max(
            1.0,
            days * 24 * 60 * 60,
        )

        score = 100.0 * (
            1.0 - min(
                age_seconds / period_seconds,
                1.0,
            )
        )

        return round(score, 2)

    @staticmethod
    def _view_score(views: int) -> float:
        """
        Convert actual views into a small ranking contribution.

        Views are never invented. Zero views produce zero score.
        """

        if views <= 0:
            return 0.0

        return round(
            min(views, 1000) / 10,
            2,
        )

    async def calculate_job_trends(
        self,
        days: int = 7,
    ) -> list[dict[str, Any]]:
        """
        Calculate and persist job-level trends.
        """

        now = datetime.now(timezone.utc)

        recent_start = now - timedelta(days=days)
        previous_start = recent_start - timedelta(days=days)

        response = (
            self.db.table("jobs")
            .select(
                "id,title,company_name,published_at,views"
            )
            .gte(
                "published_at",
                previous_start.isoformat(),
            )
            .lte(
                "published_at",
                now.isoformat(),
            )
            .eq(
                "active",
                True,
            )
            .execute()
        )

        jobs = response.data or []

        recent_jobs: list[dict[str, Any]] = []
        previous_jobs: list[dict[str, Any]] = []

        for job in jobs:
            published = job.get("published_at")

            if not published:
                continue

            try:
                published_dt = datetime.fromisoformat(
                    str(published).replace(
                        "Z",
                        "+00:00",
                    )
                )

                if published_dt.tzinfo is None:
                    published_dt = published_dt.replace(
                        tzinfo=timezone.utc,
                    )

            except (ValueError, TypeError):
                continue

            if published_dt >= recent_start:
                job["_published_dt"] = published_dt
                recent_jobs.append(job)

            elif published_dt >= previous_start:
                previous_jobs.append(job)

        recent_count = len(recent_jobs)
        previous_count = len(previous_jobs)

        trend_rows: list[dict[str, Any]] = []

        for job in recent_jobs:
            published_dt = job["_published_dt"]

            views = int(
                job.get("views", 0) or 0
            )

            recency_score = self._recency_score(
                published_dt,
                now,
                days,
            )

            view_score = self._view_score(
                views,
            )

            trend_score = round(
                recency_score + view_score,
                2,
            )

            trend_rows.append(
                {
                    "job_id": job["id"],
                    "trend_score": trend_score,
                    "period_days": days,
                    "recent_views": views,
                    "recent_count": recent_count,
                    "previous_count": previous_count,
                }
            )

        trend_rows.sort(
            key=lambda item: (
                item["trend_score"],
                item["recent_views"],
            ),
            reverse=True,
        )

        for rank, trend in enumerate(
            trend_rows,
            start=1,
        ):
            trend["trend_rank"] = rank

        # Remove old calculated rows for this period.
        (
            self.db.table("job_trends")
            .delete()
            .eq(
                "period_days",
                days,
            )
            .execute()
        )

        # Insert the fresh calculation.
        if trend_rows:
            (
                self.db.table("job_trends")
                .insert(trend_rows)
                .execute()
            )

        return trend_rows
