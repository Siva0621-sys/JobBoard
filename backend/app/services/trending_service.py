from typing import Any

from app.database import get_database


class TrendingService:
    """Business logic for trend-engine results."""

    def __init__(self) -> None:
        self.db = get_database()

    def get_trending_jobs(
        self,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        response = (
            self.db.table("job_trends")
            .select("job_id,trend_score,trend_rank")
            .order(
                "trend_rank",
                desc=False,
                nullsfirst=False,
            )
            .limit(limit)
            .execute()
        )

        return response.data or []

    def get_trending_skills(
        self,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        response = (
            self.db.table("skill_trends")
            .select("*")
            .order(
                "trend_score",
                desc=True,
                nullsfirst=False,
            )
            .limit(limit)
            .execute()
        )

        return response.data or []

    def get_trending_categories(
        self,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        response = (
            self.db.table("category_trends")
            .select("*")
            .order(
                "trend_score",
                desc=True,
                nullsfirst=False,
            )
            .limit(limit)
            .execute()
        )

        return response.data or []
