from fastapi import APIRouter
from app.database import get_database

router = APIRouter()


@router.get("")
def list_categories():
    db = get_database()

    result = (
        db.table("categories")
        .select("*")
        .order("name")
        .execute()
    )

    return {
        "data": result.data or [],
        "total": len(result.data or []),
    }
