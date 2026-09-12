import asyncio

from app.aggregators.provider_manager import ProviderManager
from app.aggregators.normalizer import JobNormalizer
from app.database import get_database


async def main():
    print("=" * 60)
    print("JOB DATABASE INSERT DIAGNOSTIC")
    print("=" * 60)

    providers = ProviderManager()

    raw_jobs = await providers.fetch_all(
        page=1,
        limit=1,
    )

    print("RAW JOBS:", len(raw_jobs))

    if not raw_jobs:
        print("No jobs returned.")
        return

    job = raw_jobs[0]

    print("\nPROVIDER:")
    print(job.get("_provider"))

    normalized = JobNormalizer.normalize(
        job,
        job.get("_provider"),
    )

    payload = {
        key: value
        for key, value in normalized.items()
        if key != "fingerprint"
    }

    print("\nPAYLOAD:")
    for key, value in payload.items():
        print(f"{key}: {value!r}")

    print("\nATTEMPTING SUPABASE INSERT...")
    print("-" * 60)

    try:
        db = get_database()
        result = db.table("jobs").insert(payload).execute()

        print("INSERT SUCCESS")
        print("RESULT:")
        print(result.data)

    except Exception as error:
        print("INSERT FAILED")
        print("ERROR TYPE:", type(error).__name__)
        print("ERROR:", error)

    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
