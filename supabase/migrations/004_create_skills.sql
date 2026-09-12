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
