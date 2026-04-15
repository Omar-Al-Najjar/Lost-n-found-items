# 06 — Database Schema

## Design Principles

- keep raw user input and normalized AI output separately
- store structured attributes explicitly
- use status enums, not freeform strings
- store embeddings in dedicated columns or companion tables
- design for strict RLS from day one

## Extensions

```sql
create extension if not exists vector;
create extension if not exists pg_trgm;
```

## Suggested Enums

```sql
create type post_type as enum ('lost', 'found');

create type post_status as enum (
  'draft',
  'active',
  'analysis_pending',
  'analysis_failed',
  'pending_verification',
  'resolved',
  'archived',
  'removed'
);

create type item_resolution_status as enum (
  'still_missing',
  'possibly_matched',
  'claimed',
  'returned',
  'closed_unresolved'
);

create type image_role as enum ('primary', 'gallery');

create type conversation_status as enum ('active', 'archived', 'blocked');

create type message_type as enum ('text', 'system');

create type moderation_target_type as enum ('post', 'message', 'profile');

create type moderation_status as enum ('open', 'reviewed', 'dismissed', 'actioned');

create type ai_job_type as enum (
  'analyze_post',
  'embed_post',
  'embed_search_query',
  'generate_matches'
);

create type ai_job_status as enum (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled'
);
```

## Tables

## 1. profiles

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 50),
  avatar_path text,
  home_country_code text,
  home_city_slug text,
  home_region_slug text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 2. posts

Single table for lost and found posts.

```sql
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type post_type not null,
  status post_status not null default 'draft',
  resolution_status item_resolution_status not null default 'still_missing',

  country_code text not null,
  city_slug text not null,
  region_slug text,
  public_location_label text,
  precise_location_private text,

  user_description text,
  generated_title text,
  generated_summary text,

  category text,
  subcategory text,
  brand text,
  model text,
  primary_color text,
  secondary_color text,
  material text,
  condition_text text,
  notable_features text[],
  search_keywords text[],

  found_or_lost_at timestamptz,
  posted_at timestamptz not null default now(),

  has_images boolean not null default false,
  primary_image_path text,

  analysis_version text,
  analysis_state text not null default 'not_started',

  is_sensitive boolean not null default false,
  is_public boolean not null default true,
  is_removed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 3. post_images

```sql
create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  image_role image_role not null default 'gallery',
  position int not null default 0,
  width int,
  height int,
  mime_type text,
  file_size_bytes bigint,
  is_blurred boolean not null default false,
  created_at timestamptz not null default now()
);
```

## 4. post_ai_extractions

Store raw and normalized AI output.

```sql
create table public.post_ai_extractions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  job_id uuid,
  model_name text,
  model_version text,

  raw_user_text text,
  ai_raw_json jsonb not null,
  normalized_json jsonb not null,

  extracted_category text,
  extracted_brand text,
  extracted_colors text[],
  extracted_condition text,
  extracted_notable_features text[],
  confidence_score numeric(5,4),

  safety_flags text[],
  created_at timestamptz not null default now()
);
```

## 5. post_embeddings

You may keep embeddings in a separate table to allow regeneration/versioning.

```sql
create table public.post_embeddings (
  post_id uuid primary key references public.posts(id) on delete cascade,
  embedding vector(1536),
  embedding_model text not null,
  embedding_version text not null,
  source_text text not null,
  updated_at timestamptz not null default now()
);
```

Adjust vector dimension to your embedding provider.

## 6. search_queries

Log user searches for observability and optional retrieval reuse.

```sql
create table public.search_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  raw_query text not null,
  normalized_query text,
  country_code text not null,
  city_slug text not null,
  region_slug text,
  inferred_filters jsonb,
  created_at timestamptz not null default now()
);
```

## 7. search_query_embeddings

```sql
create table public.search_query_embeddings (
  search_query_id uuid primary key references public.search_queries(id) on delete cascade,
  embedding vector(1536),
  embedding_model text not null,
  embedding_version text not null,
  source_text text not null,
  created_at timestamptz not null default now()
);
```

## 8. match_candidates

Persistent record of search or proactive match results.

```sql
create table public.match_candidates (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('search_query', 'post')),
  source_id uuid not null,
  candidate_post_id uuid not null references public.posts(id) on delete cascade,

  score_total numeric(7,4) not null,
  score_semantic numeric(7,4),
  score_text numeric(7,4),
  score_structured numeric(7,4),
  score_geo numeric(7,4),

  explanation jsonb,
  created_for_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
```

## 9. conversations

```sql
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  context_post_id uuid references public.posts(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  status conversation_status not null default 'active',
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 10. conversation_participants

```sql
create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);
```

## 11. messages

```sql
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references public.profiles(id) on delete cascade,
  type message_type not null default 'text',
  body text not null check (char_length(body) between 1 and 5000),
  is_edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 12. moderation_reports

```sql
create table public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references public.profiles(id) on delete cascade,
  target_type moderation_target_type not null,
  target_id uuid not null,
  reason_code text not null,
  note text,
  status moderation_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## 13. post_status_events

```sql
create table public.post_status_events (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  from_status post_status,
  to_status post_status not null,
  note text,
  created_at timestamptz not null default now()
);
```

## 14. ai_jobs

```sql
create table public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type ai_job_type not null,
  target_entity_type text not null,
  target_entity_id uuid not null,
  dedupe_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  status ai_job_status not null default 'pending',
  attempts int not null default 0,
  last_error text,
  run_after timestamptz not null default now(),
  locked_at timestamptz,
  locked_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Suggested Indexes

```sql
create index idx_posts_public_feed on public.posts (city_slug, region_slug, type, status, posted_at desc);
create index idx_posts_user_id on public.posts (user_id, created_at desc);
create index idx_posts_status on public.posts (status);
create index idx_posts_category on public.posts (category);
create index idx_posts_brand on public.posts (brand);
create index idx_posts_found_or_lost_at on public.posts (found_or_lost_at desc);

create index idx_post_images_post_id on public.post_images (post_id, position);

create index idx_messages_conversation_id on public.messages (conversation_id, created_at asc);
create index idx_conversations_last_message_at on public.conversations (last_message_at desc);

create index idx_match_candidates_source on public.match_candidates (source_type, source_id, created_at desc);

create index idx_ai_jobs_status_run_after on public.ai_jobs (status, run_after);

create index idx_posts_search_text on public.posts using gin (
  to_tsvector(
    'simple',
    coalesce(generated_title,'') || ' ' ||
    coalesce(generated_summary,'') || ' ' ||
    coalesce(user_description,'') || ' ' ||
    coalesce(category,'') || ' ' ||
    coalesce(brand,'')
  )
);

create index idx_post_embeddings_vector on public.post_embeddings
using hnsw (embedding vector_cosine_ops);
```

## Useful Views

## public_feed_view

Purpose:
- hide private/internal fields
- simplify feed queries from client

Suggested columns:
- id
- type
- status
- generated_title
- generated_summary
- category
- brand
- primary_color
- city_slug
- region_slug
- primary_image_path
- posted_at
- user_display_name
- is_sensitive

## conversation_list_view

Purpose:
- compute latest message preview
- unread state
- other participant preview

## Suggested Triggers

- update `updated_at` on row changes
- set `has_images` and `primary_image_path` based on `post_images`
- insert `post_status_events` on status changes
- optionally auto-create profile row on auth user creation if your auth flow supports it cleanly

## Notes

- keep exact embedding dimension configurable
- do not rely solely on `generated_title` for search
- prefer separate extraction snapshots for audit/versioning
