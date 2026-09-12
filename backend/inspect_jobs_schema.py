from app.database import get_database

db = get_database()

result = (
    db.table("jobs")
    .select("*")
    .limit(1)
    .execute()
)

print("=" * 70)
print("JOBS TABLE COLUMNS")
print("=" * 70)

if result.data:
    for column, value in result.data[0].items():
        print(f"{column}: {value!r}")
else:
    print("No rows found.")

print("=" * 70)
