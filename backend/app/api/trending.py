from fastapi import APIRouter
from app.database import get_database

router = APIRouter()


@router.get("")
def trending():
    db = get_database()

    result = (
        db.table("job_trends")
        .select("*")
        .order("trend_score", desc=True)
        .limit(20)
        .execute()
    )

    return {
        "data": result.data or [],
        "total": len(result.data or []),
    }
