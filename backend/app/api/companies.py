from fastapi import APIRouter
from app.database import get_database

router = APIRouter()


@router.get("")
def list_companies():
    db = get_database()

    result = (
        db.table("companies")
        .select("*")
        .order("name")
        .execute()
    )

    return {
        "data": result.data or [],
        "total": len(result.data or []),
    }


@router.get("/{company_id}")
def get_company(company_id: str):
    db = get_database()

    result = (
        db.table("companies")
        .select("*")
        .eq("id", company_id)
        .limit(1)
        .execute()
    )

    if not result.data:
        return {
            "data": None,
            "message": "Company not found",
        }

    return {
        "data": result.data[0],
    }
