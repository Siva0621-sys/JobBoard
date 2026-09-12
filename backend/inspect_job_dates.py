from app.database import get_database

db = get_database()

result = (
    db.table("jobs")
    .select("id,title,published_at,views")
    .order("published_at", desc=True)
    .execute()
)

print("=" * 70)
print("JOB PUBLICATION DATA")
print("=" * 70)

for index, job in enumerate(result.data or [], start=1):
    print(
        f"{index}. "
        f"{job.get('published_at')} | "
        f"{job.get('views', 0)} | "
        f"{job.get('title')}"
    )

print("=" * 70)
