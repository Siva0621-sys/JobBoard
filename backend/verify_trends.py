from app.database import get_database

db = get_database()

print("=" * 60)
print("TREND DATABASE VERIFICATION")
print("=" * 60)

result = (
    db.table("job_trends")
    .select("*")
    .limit(20)
    .execute()
)

print("ROWS:", len(result.data or []))
print()

for index, row in enumerate(result.data or [], start=1):
    print(f"{index}. {row}")

print("=" * 60)
