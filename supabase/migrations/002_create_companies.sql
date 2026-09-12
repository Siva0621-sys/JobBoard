create table if not exists public.companies (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    slug text unique,

    logo_url text,
    website text,

    description text,
    industry text,

    location text,
    city text,
    state text,
    country text,

    company_size text,
    founded_year integer,

    job_count integer not null default 0,

    verified boolean not null default false,
    featured boolean not null default false,
    active boolean not null default true,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_companies_name
    on public.companies(name);

create index if not exists idx_companies_slug
    on public.companies(slug);

create index if not exists idx_companies_industry
    on public.companies(industry);

create index if not exists idx_companies_location
    on public.companies(location);

create index if not exists idx_companies_job_count
    on public.companies(job_count desc);

create index if not exists idx_companies_featured
    on public.companies(featured);

create index if not exists idx_companies_metadata
    on public.companies using gin(metadata);

drop trigger if exists companies_set_updated_at
    on public.companies;

create trigger companies_set_updated_at
before update on public.companies
for each row
execute function public.set_updated_at();

alter table public.companies enable row level security;

drop policy if exists "Public can read active companies"
    on public.companies;

create policy "Public can read active companies"
on public.companies
for select
using (active = true);
