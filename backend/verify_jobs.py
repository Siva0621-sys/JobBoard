from app.database import get_database

db = get_database()

result = (
    db.table("jobs")
    .select("id,title,company_name,source,location,job_type,work_mode,apply_url")
    .execute()
)

print("=" * 60)
print("SUPABASE JOB VERIFICATION")
print("=" * 60)
print("TOTAL JOBS:", len(result.data or []))
print()

for index, job in enumerate(result.data or [], start=1):
    print(
        f"{index}. "
        f"{job.get('title')} | "
        f"{job.get('company_name')} | "
        f"{job.get('source')} | "
        f"{job.get('location')}"
    )

print("=" * 60)
