
-- ==================================================
-- supabase\migrations\001_create_jobs.sql
-- ==================================================

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


-- ==================================================
-- supabase\migrations\002_create_companies.sql
-- ==================================================

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


-- ==================================================
-- supabase\migrations\003_create_categories.sql
-- ==================================================

create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    slug text unique,

    description text,
    icon text,
    image_url text,

    parent_id uuid references public.categories(id)
        on delete set null,

    job_count integer not null default 0,

    featured boolean not null default false,
    active boolean not null default true,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_categories_name
    on public.categories(name);

create index if not exists idx_categories_slug
    on public.categories(slug);

create index if not exists idx_categories_parent
    on public.categories(parent_id);

create index if not exists idx_categories_job_count
    on public.categories(job_count desc);

create index if not exists idx_categories_featured
    on public.categories(featured);

create index if not exists idx_categories_active
    on public.categories(active);

drop trigger if exists categories_set_updated_at
    on public.categories;

create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

alter table public.categories enable row level security;

drop policy if exists "Public can read active categories"
    on public.categories;

create policy "Public can read active categories"
on public.categories
for select
using (active = true);


-- ==================================================
-- supabase\migrations\004_create_skills.sql
-- ==================================================

create table if not exists public.skills (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    slug text unique,

    category text,
    description text,

    job_count integer not null default 0,

    trend_score numeric not null default 0,
    trend_rank integer,

    featured boolean not null default false,
    active boolean not null default true,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_skills_name
    on public.skills(name);

create index if not exists idx_skills_slug
    on public.skills(slug);

create index if not exists idx_skills_category
    on public.skills(category);

create index if not exists idx_skills_job_count
    on public.skills(job_count desc);

create index if not exists idx_skills_trend_score
    on public.skills(trend_score desc);

create index if not exists idx_skills_trend_rank
    on public.skills(trend_rank);

drop trigger if exists skills_set_updated_at
    on public.skills;

create trigger skills_set_updated_at
before update on public.skills
for each row
execute function public.set_updated_at();

alter table public.skills enable row level security;

drop policy if exists "Public can read active skills"
    on public.skills;

create policy "Public can read active skills"
on public.skills
for select
using (active = true);


-- ==================================================
-- supabase\migrations\005_create_trends.sql
-- ==================================================

create table if not exists public.job_trends (
    id uuid primary key default gen_random_uuid(),

    job_id uuid not null
        references public.jobs(id)
        on delete cascade,

    trend_score numeric not null default 0,
    trend_rank integer,

    period_days integer not null default 7,

    recent_views integer not null default 0,
    recent_count integer not null default 0,
    previous_count integer not null default 0,

    calculated_at timestamptz not null default now(),

    unique(job_id, period_days)
);

create index if not exists idx_job_trends_job
    on public.job_trends(job_id);

create index if not exists idx_job_trends_score
    on public.job_trends(trend_score desc);

create index if not exists idx_job_trends_rank
    on public.job_trends(trend_rank);


create table if not exists public.skill_trends (
    id uuid primary key default gen_random_uuid(),

    skill_id uuid
        references public.skills(id)
        on delete cascade,

    skill_name text not null,

    trend_score numeric not null default 0,
    trend_rank integer,

    job_count integer not null default 0,

    period_days integer not null default 7,

    calculated_at timestamptz not null default now(),

    unique(skill_name, period_days)
);

create index if not exists idx_skill_trends_score
    on public.skill_trends(trend_score desc);

create index if not exists idx_skill_trends_rank
    on public.skill_trends(trend_rank);


create table if not exists public.category_trends (
    id uuid primary key default gen_random_uuid(),

    category_id uuid
        references public.categories(id)
        on delete cascade,

    category_name text not null,

    trend_score numeric not null default 0,
    trend_rank integer,

    job_count integer not null default 0,

    period_days integer not null default 7,

    calculated_at timestamptz not null default now(),

    unique(category_name, period_days)
);

create index if not exists idx_category_trends_score
    on public.category_trends(trend_score desc);

create index if not exists idx_category_trends_rank
    on public.category_trends(trend_rank);


create table if not exists public.location_trends (
    id uuid primary key default gen_random_uuid(),

    location text not null,

    trend_score numeric not null default 0,
    trend_rank integer,

    job_count integer not null default 0,

    period_days integer not null default 7,

    calculated_at timestamptz not null default now(),

    unique(location, period_days)
);

create index if not exists idx_location_trends_score
    on public.location_trends(trend_score desc);

create index if not exists idx_location_trends_rank
    on public.location_trends(trend_rank);


alter table public.job_trends enable row level security;
alter table public.skill_trends enable row level security;
alter table public.category_trends enable row level security;
alter table public.location_trends enable row level security;


drop policy if exists "Public can read job trends"
    on public.job_trends;

create policy "Public can read job trends"
on public.job_trends
for select
using (true);


drop policy if exists "Public can read skill trends"
    on public.skill_trends;

create policy "Public can read skill trends"
on public.skill_trends
for select
using (true);


drop policy if exists "Public can read category trends"
    on public.category_trends;

create policy "Public can read category trends"
on public.category_trends
for select
using (true);


drop policy if exists "Public can read location trends"
    on public.location_trends;

create policy "Public can read location trends"
on public.location_trends
for select
using (true);


-- ==================================================
-- supabase\migrations\006_create_indexes.sql
-- ==================================================

-- ============================================================
-- JobBoard: Additional search and relationship indexes
-- ============================================================

create index if not exists idx_jobs_company_id
    on public.jobs(company_id);

create index if not exists idx_jobs_country
    on public.jobs(country);

create index if not exists idx_jobs_city
    on public.jobs(city);

create index if not exists idx_jobs_active_published
    on public.jobs(active, published_at desc);

create index if not exists idx_jobs_type_mode
    on public.jobs(job_type, work_mode);

create index if not exists idx_jobs_skills
    on public.jobs using gin(skills);

create index if not exists idx_jobs_responsibilities
    on public.jobs using gin(responsibilities);

create index if not exists idx_jobs_requirements
    on public.jobs using gin(requirements);


create index if not exists idx_companies_active_jobs
    on public.companies(active, job_count desc);

create index if not exists idx_categories_active_jobs
    on public.categories(active, job_count desc);

create index if not exists idx_skills_active_trends
    on public.skills(active, trend_score desc);


-- Add foreign-key relationships after all core tables exist.
do 
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'jobs_company_id_fkey'
    ) then
        alter table public.jobs
        add constraint jobs_company_id_fkey
        foreign key (company_id)
        references public.companies(id)
        on delete set null;
    end if;
end
;


do 
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'jobs_category_id_fkey'
    ) then
        alter table public.jobs
        add constraint jobs_category_id_fkey
        foreign key (category_id)
        references public.categories(id)
        on delete set null;
    end if;
end
;


-- Helpful full-text search index.
create index if not exists idx_jobs_full_text
on public.jobs
using gin (
    to_tsvector(
        'english',
        concat_ws(
            ' ',
            coalesce(title, ''),
            coalesce(company_name, ''),
            coalesce(description, ''),
            coalesce(location, ''),
            coalesce(category_name, '')
        )
    )
);

