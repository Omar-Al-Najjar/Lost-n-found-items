begin;

alter table if exists public.profiles
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists avatar_url text;

comment on table public.profiles is
  'Canonical mobile app user profile table. Use this instead of the legacy public.users table for app-facing identity data.';

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'users'
  ) then
    execute $comment$
      comment on table public.users is
      'Legacy table retained for compatibility. The mobile app schema uses public.profiles as the canonical user table.';
    $comment$;
  end if;
end
$$;

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
  generated_title text,
  generated_summary text not null,
  subcategory text not null,
  category text not null,
  primary_color text not null,
  material text not null,
  brand text not null,
  visible_contents jsonb not null default '[]'::jsonb,
  notable_features jsonb not null default '[]'::jsonb,
  condition_text text not null default 'Unknown',
  attribute_confidence text not null default 'Unknown',
  search_keywords jsonb not null default '[]'::jsonb,
  public_location_label text not null default 'Unknown',
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

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'ai_description'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'generated_summary'
  ) then
    alter table public.ai_found_items rename column ai_description to generated_summary;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'item_type'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'subcategory'
  ) then
    alter table public.ai_found_items rename column item_type to subcategory;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'color'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'primary_color'
  ) then
    alter table public.ai_found_items rename column color to primary_color;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'distinctive_features'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'notable_features'
  ) then
    alter table public.ai_found_items rename column distinctive_features to notable_features;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'condition'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'condition_text'
  ) then
    alter table public.ai_found_items rename column condition to condition_text;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'location_found'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'public_location_label'
  ) then
    alter table public.ai_found_items rename column location_found to public_location_label;
  end if;
end
$$;

alter table if exists public.ai_found_items
  add column if not exists generated_title text,
  add column if not exists generated_summary text,
  add column if not exists subcategory text,
  add column if not exists primary_color text,
  add column if not exists notable_features jsonb,
  add column if not exists condition_text text,
  add column if not exists public_location_label text;

alter table if exists public.ai_found_items
  alter column notable_features set default '[]'::jsonb,
  alter column condition_text set default 'Unknown',
  alter column public_location_label set default 'Unknown';

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'ai_description'
  ) then
    execute '
      update public.ai_found_items
      set generated_summary = coalesce(nullif(trim(generated_summary), ''''), nullif(trim(ai_description), ''''))
      where nullif(trim(ai_description), '''') is not null
    ';
    execute 'alter table public.ai_found_items drop column ai_description';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'item_type'
  ) then
    execute '
      update public.ai_found_items
      set subcategory = coalesce(nullif(trim(subcategory), ''''), nullif(trim(item_type), ''''))
      where nullif(trim(item_type), '''') is not null
    ';
    execute 'alter table public.ai_found_items drop column item_type';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'color'
  ) then
    execute '
      update public.ai_found_items
      set primary_color = coalesce(nullif(trim(primary_color), ''''), nullif(trim(color), ''''))
      where nullif(trim(color), '''') is not null
    ';
    execute 'alter table public.ai_found_items drop column color';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'distinctive_features'
  ) then
    execute '
      update public.ai_found_items
      set notable_features = case
        when notable_features is null or notable_features = ''[]''::jsonb then distinctive_features
        else notable_features
      end
      where distinctive_features is not null
    ';
    execute 'alter table public.ai_found_items drop column distinctive_features';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'condition'
  ) then
    execute '
      update public.ai_found_items
      set condition_text = coalesce(nullif(trim(condition_text), ''''), nullif(trim(condition), ''''))
      where nullif(trim(condition), '''') is not null
    ';
    execute 'alter table public.ai_found_items drop column condition';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ai_found_items'
      and column_name = 'location_found'
  ) then
    execute '
      update public.ai_found_items
      set public_location_label = coalesce(nullif(trim(public_location_label), ''''), nullif(trim(location_found), ''''))
      where nullif(trim(location_found), '''') is not null
    ';
    execute 'alter table public.ai_found_items drop column location_found';
  end if;
end
$$;

update public.ai_found_items
set
  category = case
    when lower(category) = 'electronics' then 'electronics'
    when lower(category) in ('bag/wallet', 'bag', 'wallet', 'bags') then 'bags'
    when lower(category) = 'documents' then 'documents'
    when lower(category) in ('keys', 'jewellery', 'jewelry', 'accessories', 'accessory') then 'accessories'
    else 'other'
  end,
  generated_summary = coalesce(nullif(trim(generated_summary), ''), 'Found item'),
  subcategory = coalesce(nullif(trim(subcategory), ''), 'Unknown'),
  primary_color = coalesce(nullif(trim(primary_color), ''), 'Unknown'),
  material = coalesce(nullif(trim(material), ''), 'Unknown'),
  brand = coalesce(nullif(trim(brand), ''), 'Unknown'),
  notable_features = coalesce(notable_features, '[]'::jsonb),
  condition_text = coalesce(nullif(trim(condition_text), ''), 'Unknown'),
  public_location_label = coalesce(nullif(trim(public_location_label), ''), 'Unknown'),
  generated_title = coalesce(
    nullif(trim(generated_title), ''),
    nullif(trim(concat_ws(' ', nullif(primary_color, 'Unknown'), nullif(brand, 'Unknown'), nullif(subcategory, 'Unknown'))), ''),
    'Found item'
  )
where true;

alter table if exists public.ai_found_items
  alter column generated_summary set not null,
  alter column subcategory set not null,
  alter column primary_color set not null,
  alter column notable_features set not null,
  alter column condition_text set not null,
  alter column public_location_label set not null;

comment on table public.ai_pipeline_users is
  'Deprecated server-side Python test-user table. Real app users live in public.profiles.';
comment on table public.ai_found_items is
  'Server-side Python AI found-item records. App-compatible field names with additional backend-only AI/debug fields.';
comment on column public.ai_found_items.status is
  'Backend-only Python pipeline status. For testing, available roughly corresponds to an app post being active.';
comment on table public.ai_lost_queries is
  'Server-side Python AI lost-item searches and structured query payloads.';
comment on table public.ai_matches is
  'Server-side Python AI match results between ai_lost_queries and ai_found_items.';
comment on column public.ai_matches.status is
  'Backend-only Python pipeline match lifecycle state. Not the same contract as app notification or post status.';

create index if not exists idx_ai_pipeline_users_email on public.ai_pipeline_users (email);
create index if not exists idx_ai_found_items_status_date on public.ai_found_items (status, date_found desc);
create index if not exists idx_ai_found_items_user_id on public.ai_found_items (user_id, created_at desc);
create index if not exists idx_ai_lost_queries_user_id on public.ai_lost_queries (user_id, created_at desc);
create index if not exists idx_ai_matches_lost_query_id on public.ai_matches (lost_query_id, created_at desc);
create index if not exists idx_ai_matches_found_item_id on public.ai_matches (found_item_id, created_at desc);

commit;
