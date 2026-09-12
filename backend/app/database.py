from functools import lru_cache

from supabase import Client, create_client

from app.config import settings


@lru_cache(maxsize=1)
def get_database() -> Client:
    key = settings.supabase_service_role_key or settings.supabase_anon_key

    if not settings.supabase_url:
        raise RuntimeError("SUPABASE_URL is missing.")

    if not key:
        raise RuntimeError(
            "SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY is missing."
        )

    return create_client(
        settings.supabase_url.rstrip("/"),
        key,
    )


def initialize_database() -> Client:
    return get_database()
