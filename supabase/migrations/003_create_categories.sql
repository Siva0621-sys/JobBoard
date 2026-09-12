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
