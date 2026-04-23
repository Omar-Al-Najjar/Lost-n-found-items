begin;

alter table public.posts
  add column if not exists match_text_en text,
  add column if not exists match_keywords_en text[] not null default '{}'::text[],
  add column if not exists match_location_en text,
  add column if not exists match_norm_updated_at timestamptz;

comment on column public.posts.match_text_en is
  'English-normalized free text used for AI matching retrieval.';
comment on column public.posts.match_keywords_en is
  'English-normalized keyword tokens for lexical AI matching.';
comment on column public.posts.match_location_en is
  'English-normalized public location label used for matching.';
comment on column public.posts.match_norm_updated_at is
  'Timestamp of latest AI normalization refresh for matching fields.';

-- Safe bootstrap for existing rows; full quality backfill is handled by ai/backfill_match_normalization.py.
update public.posts
set
  match_text_en = coalesce(match_text_en, nullif(trim(concat_ws(' ',
    generated_title,
    generated_summary,
    user_description,
    subcategory,
    category,
    primary_color,
    material,
    brand
  )), '')),
  match_keywords_en = case
    when coalesce(array_length(match_keywords_en, 1), 0) > 0 then match_keywords_en
    else coalesce(search_keywords, '{}'::text[])
  end,
  match_location_en = coalesce(match_location_en, public_location_label, city_slug),
  match_norm_updated_at = coalesce(match_norm_updated_at, now())
where type = 'found'
  and status = 'active'
  and is_removed = false;

create index if not exists idx_posts_match_norm_updated_at
  on public.posts (match_norm_updated_at desc);

create index if not exists idx_posts_match_location_en
  on public.posts (match_location_en);

create index if not exists idx_posts_match_keywords_en_gin
  on public.posts using gin (match_keywords_en);

commit;
