from collections import Counter
from datetime import datetime, timedelta, timezone
from typing import Any


class LocationTrendCalculator:
    """
    Calculate location demand trends from real stored jobs.

    Priority:
    city -> state -> country -> location

    No location is invented when the source does not provide it.
    """

    def __init__(self, db: Any) -> None:
        self.db = db

    @staticmethod
    def _get_location(job: dict[str, Any]) -> str | None:
        city = (job.get("city") or "").strip()
        state = (job.get("state") or "").strip()
        country = (job.get("country") or "").strip()
        location = (job.get("location") or "").strip()

        if city:
            return city

        if state:
            return state

        if country:
            return country

        if location:
            return location

        return None

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
                "id,city,state,country,location,published_at"
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

            location = self._get_location(job)

            if not location:
                continue

            if published_dt >= recent_start:
                recent_counts[location] += 1

            elif published_dt >= previous_start:
                previous_counts[location] += 1

        rows: list[dict[str, Any]] = []

        for location, recent_count in recent_counts.items():
            previous_count = previous_counts.get(
                location,
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

                trend_status = (
                    "up"
                    if trend_score > 0
                    else "down"
                    if trend_score < 0
                    else "stable"
                )

            else:
                trend_score = float(recent_count)
                trend_status = "new"

            rows.append(
                {
                    "location_name": location,
                    "trend_score": trend_score,
                    "job_count": recent_count,
                    "period_days": days,
                    "trend_status": trend_status,
                }
            )

        rows.sort(
            key=lambda row: (
                row["job_count"],
                row["trend_score"],
            ),
            reverse=True,
        )

        for rank, row in enumerate(
            rows,
            start=1,
        ):
            row["trend_rank"] = rank

        (
            self.db.table("location_trends")
            .delete()
            .eq(
                "period_days",
                days,
            )
            .execute()
        )

        database_rows = []

        for row in rows:
            database_rows.append(
                {
                    "location": row["location_name"],
                    "trend_score": row["trend_score"],
                    "trend_rank": row["trend_rank"],
                    "job_count": row["job_count"],
                    "period_days": row["period_days"],
                }
            )

        if database_rows:
            (
                self.db.table("location_trends")
                .insert(database_rows)
                .execute()
            )

        return rows
