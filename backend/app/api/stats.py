from fastapi import APIRouter
from app.database import get_database

router = APIRouter()


@router.get("")
def statistics():
    db = get_database()

    jobs = db.table("jobs").select("id", count="exact").execute()
    companies = db.table("companies").select("id", count="exact").execute()
    categories = db.table("categories").select("id", count="exact").execute()

    return {
        "total_jobs": jobs.count or 0,
        "total_companies": companies.count or 0,
        "total_categories": categories.count or 0,
    }
