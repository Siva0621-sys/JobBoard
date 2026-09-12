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
