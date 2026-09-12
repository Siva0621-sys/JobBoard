from app.database import get_database

db = get_database()

result = (
    db.table("jobs")
    .select("title,description")
    .order("published_at", desc=True)
    .execute()
)

print("=" * 70)
print("JOB TEXT SAMPLE FOR SKILL EXTRACTION")
print("=" * 70)

for index, job in enumerate(result.data or [], start=1):
    title = job.get("title") or ""
    description = job.get("description") or ""

    print()
    print(f"{index}. {title}")
    print(f"   Description length: {len(description)}")
    print(
        f"   Preview: "
        f"{description[:300].replace(chr(10), ' ')}"
    )

print()
print("=" * 70)
