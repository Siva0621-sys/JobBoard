from typing import Any

from app.database import get_database


class CompanyService:
    """Business logic for company discovery."""

    def __init__(self) -> None:
        self.db = get_database()

    def list_companies(
        self,
        *,
        page: int = 1,
        limit: int = 20,
        keyword: str | None = None,
        industry: str | None = None,
    ) -> dict[str, Any]:
        start = (page - 1) * limit
        end = start + limit - 1

        query = self.db.table("companies").select(
            "*",
            count="exact",
        )

        if keyword:
            value = keyword.strip()
            query = query.or_(
                f"name.ilike.%{value}%,"
                f"description.ilike.%{value}%"
            )

        if industry:
            query = query.ilike(
                "industry",
                f"%{industry.strip()}%",
            )

        query = query.order(
            "job_count",
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

    def get_company(
        self,
        company_id: str,
    ) -> dict[str, Any] | None:
        response = (
            self.db.table("companies")
            .select("*")
            .eq("id", company_id)
            .limit(1)
            .execute()
        )

        return response.data[0] if response.data else None
