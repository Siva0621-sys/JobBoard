from app.database import get_database

db = get_database()

tables = [
    "skill_trends",
    "category_trends",
    "location_trends",
]

print("=" * 70)
print("TREND TABLE STATUS")
print("=" * 70)

for table in tables:
    result = (
        db.table(table)
        .select("*")
        .limit(5)
        .execute()
    )

    print()
    print(f"{table}: {len(result.data or [])} rows")

    for row in result.data or []:
        print(row)

print()
print("=" * 70)
