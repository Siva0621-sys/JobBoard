-- ============================================================
-- JobBoard: Jobs table
-- ============================================================

create table if not exists public.jobs (
    id uuid primary key default gen_random_uuid(),

    external_id text,
    source text not null default 'unknown',
    source_url text,

    title text not null,
    company_name text,
    company_id uuid,
    category_name text,
    category_id uuid,

    description text,
    responsibilities text[] not null default '{}',
    requirements text[] not null default '{}',
    skills text[] not null default '{}',

    location text,
    city text,
    state text,
    country text,

    job_type text,
    work_mode text,

    salary_min numeric,
    salary_max numeric,
    salary_currency text,

    published_at timestamptz,
    expires_at timestamptz,

    application_url text,
    company_logo_url text,

    views integer not null default 0,
    active boolean not null default true,
    featured boolean not null default false,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique(source, external_id)
);

create index if not exists idx_jobs_title
    on public.jobs(title);

create index if not exists idx_jobs_source
    on public.jobs(source);

create index if not exists idx_jobs_external_id
    on public.jobs(external_id);

create index if not exists idx_jobs_company_name
    on public.jobs(company_name);

create index if not exists idx_jobs_category_name
    on public.jobs(category_name);

create index if not exists idx_jobs_location
    on public.jobs(location);

create index if not exists idx_jobs_published_at
    on public.jobs(published_at desc);

create index if not exists idx_jobs_views
    on public.jobs(views desc);

create index if not exists idx_jobs_active
    on public.jobs(active);

create index if not exists idx_jobs_featured
    on public.jobs(featured);

create index if not exists idx_jobs_metadata
    on public.jobs using gin(metadata);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists jobs_set_updated_at
    on public.jobs;

create trigger jobs_set_updated_at
before update on public.jobs
for each row
execute function public.set_updated_at();

alter table public.jobs enable row level security;

drop policy if exists "Public can read active jobs"
    on public.jobs;

create policy "Public can read active jobs"
on public.jobs
for select
using (active = true);
