begin;

create table if not exists public.ai_pipeline_users (
  id text primary key,
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_found_items (
  id text primary key,
  user_id text not null references public.ai_pipeline_users(id) on delete restrict,
  user_description text not null,
  ai_description text not null,
  item_type text not null,
  category text not null,
  color text not null,
  material text not null,
  brand text not null,
  visible_contents jsonb not null default '[]'::jsonb,
  distinctive_features jsonb not null default '[]'::jsonb,
  condition text not null default 'Unknown',
  attribute_confidence text not null default 'Unknown',
  search_keywords jsonb not null default '[]'::jsonb,
  location_found text not null default 'Unknown',
  date_found timestamptz not null default now(),
  status text not null default 'available',
  embed_text text not null,
  embedding jsonb not null,
  raw_ai_result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_lost_queries (
  id text primary key,
  user_id text not null references public.ai_pipeline_users(id) on delete restrict,
  description text not null,
  parsed_query jsonb not null,
  embedding jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_matches (
  id text primary key,
  lost_query_id text not null references public.ai_lost_queries(id) on delete cascade,
  found_item_id text not null references public.ai_found_items(id) on delete cascade,
  similarity_score double precision not null,
  semantic_score double precision not null,
  confidence_label text not null default 'Low',
  evidence jsonb not null default '[]'::jsonb,
  contradictions jsonb not null default '[]'::jsonb,
  explanation text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_pipeline_users_email on public.ai_pipeline_users (email);
create index if not exists idx_ai_found_items_status_date on public.ai_found_items (status, date_found desc);
create index if not exists idx_ai_found_items_user_id on public.ai_found_items (user_id, created_at desc);
create index if not exists idx_ai_lost_queries_user_id on public.ai_lost_queries (user_id, created_at desc);
create index if not exists idx_ai_matches_lost_query_id on public.ai_matches (lost_query_id, created_at desc);
create index if not exists idx_ai_matches_found_item_id on public.ai_matches (found_item_id, created_at desc);

commit;
