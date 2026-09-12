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
