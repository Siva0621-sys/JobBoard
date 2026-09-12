from typing import Any

from app.database import get_database


class StatisticsService:
    """Business logic for JobBoard platform statistics."""

    def __init__(self) -> None:
        self.db = get_database()

    def overview(self) -> dict[str, Any]:
        jobs = (
            self.db.table("jobs")
            .select("id", count="exact")
            .execute()
        )

        companies = (
            self.db.table("companies")
            .select("id", count="exact")
            .execute()
        )

        categories = (
            self.db.table("categories")
            .select("id", count="exact")
            .execute()
        )

        remote_jobs = (
            self.db.table("jobs")
            .select("id", count="exact")
            .eq("work_mode", "remote")
            .execute()
        )

        return {
            "total_jobs": jobs.count or 0,
            "total_companies": companies.count or 0,
            "total_categories": categories.count or 0,
            "remote_jobs": remote_jobs.count or 0,
        }
