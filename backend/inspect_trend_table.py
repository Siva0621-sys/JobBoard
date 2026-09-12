from app.database import get_database

db = get_database()

print("=" * 60)
print("JOB TRENDS TABLE STRUCTURE")
print("=" * 60)

result = (
    db.table("job_trends")
    .select("*")
    .limit(1)
    .execute()
)

print("CURRENT ROWS:", len(result.data or []))
print()

if result.data:
    print("COLUMNS:")
    for column in result.data[0].keys():
        print("-", column)
else:
    print("Table is empty.")
    print("We need to inspect the migration definition.")

print("=" * 60)
