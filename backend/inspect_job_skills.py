from app.database import get_database

db = get_database()

result = (
    db.table("jobs")
    .select("title,skills")
    .order("published_at", desc=True)
    .execute()
)

print("=" * 70)
print("STORED JOB SKILLS")
print("=" * 70)

for index, job in enumerate(result.data or [], start=1):
    print(
        f"{index}. {job.get('title')}"
    )
    print(
        f"   skills = {job.get('skills')!r}"
    )

print("=" * 70)
