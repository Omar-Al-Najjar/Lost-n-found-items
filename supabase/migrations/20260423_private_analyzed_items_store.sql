-- Private store for analyzed found-item drafts (not public feed posts).

create table if not exists public.analyzed_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'analyzed' check (status in ('analyzed', 'archived')),
  title text not null,
  summary text not null,
  user_description text not null,
  public_location_label text,
  category text not null default 'other',
  subcategory text,
  brand text,
  primary_color text,
  material text,
  notable_features text[] not null default '{}',
  search_keywords text[] not null default '{}',
  confidence text not null default 'low' check (confidence in ('low', 'medium', 'high')),
  review_hint text,
  image_storage_path text,
  raw_ai_analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analyzed_items_user_created_idx
  on public.analyzed_items (user_id, created_at desc);

create or replace function public.set_analyzed_items_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_set_analyzed_items_updated_at on public.analyzed_items;
create trigger trg_set_analyzed_items_updated_at
before update on public.analyzed_items
for each row execute function public.set_analyzed_items_updated_at();

alter table public.analyzed_items enable row level security;

drop policy if exists "analyzed_items_select_own" on public.analyzed_items;
create policy "analyzed_items_select_own"
on public.analyzed_items
for select
using (auth.uid() = user_id);

drop policy if exists "analyzed_items_insert_own" on public.analyzed_items;
create policy "analyzed_items_insert_own"
on public.analyzed_items
for insert
with check (auth.uid() = user_id);

drop policy if exists "analyzed_items_update_own" on public.analyzed_items;
create policy "analyzed_items_update_own"
on public.analyzed_items
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "analyzed_items_delete_own" on public.analyzed_items;
create policy "analyzed_items_delete_own"
on public.analyzed_items
for delete
using (auth.uid() = user_id);

