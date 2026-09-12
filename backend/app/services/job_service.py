from typing import Any

from app.database import get_database


class JobService:
    """Business logic for retrieving and managing jobs."""

    def __init__(self) -> None:
        self.db = get_database()

    def list_jobs(
        self,
        *,
        page: int = 1,
        limit: int = 20,
        keyword: str | None = None,
        location: str | None = None,
        category: str | None = None,
        job_type: str | None = None,
        work_mode: str | None = None,
        sort: str = "latest",
    ) -> dict[str, Any]:
        start = (page - 1) * limit
        end = start + limit - 1

        query = self.db.table("jobs").select(
            "*",
            count="exact",
        )

        if keyword:
            value = keyword.strip()
            query = query.or_(
                f"title.ilike.%{value}%,"
                f"description.ilike.%{value}%,"
                f"company_name.ilike.%{value}%"
            )

        if location:
            query = query.ilike(
                "location",
                f"%{location.strip()}%",
            )

        if category:
            query = query.eq("category_slug", category)

        if job_type:
            query = query.eq("job_type", job_type)

        if work_mode:
            query = query.eq("work_mode", work_mode)

        if sort == "popular":
            query = query.order(
                "views",
                desc=True,
                nullsfirst=False,
            )
        else:
            query = query.order(
                "published_at",
                desc=True,
                nullsfirst=False,
            )

        response = query.range(start, end).execute()
        total = response.count or 0

        return {
            "data": response.data or [],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (
                    (total + limit - 1) // limit
                    if total
                    else 0
                ),
            },
        }

    def get_job(self, job_id: str) -> dict[str, Any] | None:
        response = (
            self.db.table("jobs")
            .select("*")
            .eq("id", job_id)
            .limit(1)
            .execute()
        )

        return response.data[0] if response.data else None
