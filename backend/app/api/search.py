from fastapi import APIRouter, Query
from app.database import get_database

router = APIRouter()


@router.get("")
def search_jobs(
    keyword: str | None = Query(None),
    location: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    db = get_database()

    query = db.table("jobs").select("*", count="exact")

    if keyword:
        query = query.or_(
            f"title.ilike.%{keyword}%,description.ilike.%{keyword}%"
        )

    if location:
        query = query.ilike("location", f"%{location}%")

    start = (page - 1) * limit
    end = start + limit - 1

    result = query.range(start, end).execute()

    return {
        "data": result.data or [],
        "page": page,
        "limit": limit,
        "total": result.count or 0,
    }
