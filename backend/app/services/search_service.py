from typing import Any

from app.database import get_database


class SearchService:
    """Centralized job search business logic."""

    def __init__(self) -> None:
        self.db = get_database()

    def search_jobs(
        self,
        *,
        keyword: str | None = None,
        location: str | None = None,
        category: str | None = None,
        job_type: str | None = None,
        work_mode: str | None = None,
        page: int = 1,
        limit: int = 20,
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
                f"company_name.ilike.%{value}%,"
                f"skills.ilike.%{value}%"
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
