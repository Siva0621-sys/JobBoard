from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any


class CategoryTrendCalculator:
    """
    Calculate category demand trends from real stored jobs.

    Trend data is based only on publication timestamps.
    No artificial demand or engagement values are created.
    """

    def __init__(self, db: Any) -> None:
        self.db = db

    async def calculate(
        self,
        days: int = 7,
    ) -> list[dict[str, Any]]:
        now = datetime.now(timezone.utc)

        recent_start = now - timedelta(days=days)
        previous_start = recent_start - timedelta(days=days)

        result = (
            self.db.table("jobs")
            .select(
                "id,category_name,published_at"
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

        jobs = result.data or []

        recent_counts: Counter[str] = Counter()
        previous_counts: Counter[str] = Counter()

        for job in jobs:
            category = (
                job.get("category_name")
                or "Other"
            ).strip()

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
                recent_counts[category] += 1

            elif published_dt >= previous_start:
                previous_counts[category] += 1

        categories = set(recent_counts) | set(
            previous_counts
        )

        rows: list[dict[str, Any]] = []

        for category in categories:
            recent_count = recent_counts.get(
                category,
                0,
            )

            previous_count = previous_counts.get(
                category,
                0,
            )

            if previous_count > 0:
                trend_score = round(
                    (
                        (
                            recent_count
                            - previous_count
                        )
                        / previous_count
                    )
                    * 100,
                    2,
                )
            else:
                trend_score = float(
                    recent_count
                )

            rows.append(
                {
                    "category_name": category,
                    "trend_score": trend_score,
                    "job_count": recent_count,
                    "period_days": days,
                }
            )

        rows.sort(
            key=lambda row: (
                row["trend_score"],
                row["job_count"],
            ),
            reverse=True,
        )

        for rank, row in enumerate(
            rows,
            start=1,
        ):
            row["trend_rank"] = rank

        (
            self.db.table("category_trends")
            .delete()
            .eq(
                "period_days",
                days,
            )
            .execute()
        )

        if rows:
            (
                self.db.table("category_trends")
                .insert(rows)
                .execute()
            )

        return rows
