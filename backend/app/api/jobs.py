from fastapi import APIRouter, Query
from app.database import get_database

router = APIRouter()


@router.get("")
def list_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    keyword: str | None = None,
    location: str | None = None,
    category: str | None = None,
    job_type: str | None = None,
    work_mode: str | None = None,
):
    db = get_database()

    query = db.table("jobs").select("*", count="exact")

    if keyword:
        query = query.or_(
            f"title.ilike.%{keyword}%,description.ilike.%{keyword}%"
        )

    if location:
        query = query.ilike("location", f"%{location}%")

    if category:
        query = query.eq("category_id", category)

    if job_type:
        query = query.eq("job_type", job_type)

    if work_mode:
        query = query.eq("work_mode", work_mode)

    start = (page - 1) * limit
    end = start + limit - 1

    result = query.range(start, end).execute()

    return {
        "data": result.data or [],
        "page": page,
        "limit": limit,
        "total": result.count or 0,
    }


@router.get("/{job_id}")
def get_job(job_id: str):
    db = get_database()

    result = (
        db.table("jobs")
        .select("*")
        .eq("id", job_id)
        .limit(1)
        .execute()
    )

    if not result.data:
        return {
            "data": None,
            "message": "Job not found",
        }

    return {
        "data": result.data[0],
    }
