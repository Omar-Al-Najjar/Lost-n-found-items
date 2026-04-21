select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'categories',
    'posts',
    'post_images',
    'conversations',
    'conversation_participants',
    'messages',
    'notifications',
    'ai_pipeline_users',
    'ai_found_items',
    'ai_lost_queries',
    'ai_matches',
    'users'
  )
order by table_name;

select table_name, column_name, data_type, udt_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'profiles' and column_name in (
      'id',
      'display_name',
      'avatar_path',
      'home_country_code',
      'home_city_slug',
      'home_region_slug',
      'bio',
      'full_name',
      'email',
      'avatar_url',
      'created_at',
      'updated_at'
    ))
    or (table_name = 'ai_found_items' and column_name in (
      'id',
      'user_id',
      'user_description',
      'generated_title',
      'generated_summary',
      'subcategory',
      'category',
      'primary_color',
      'material',
      'brand',
      'visible_contents',
      'notable_features',
      'condition_text',
      'attribute_confidence',
      'search_keywords',
      'public_location_label',
      'status',
      'embed_text',
      'embedding',
      'raw_ai_result',
      'created_at'
    ))
    or (table_name = 'ai_lost_queries' and column_name in (
      'id',
      'user_id',
      'description',
      'parsed_query',
      'embedding',
      'created_at'
    ))
    or (table_name = 'ai_matches' and column_name in (
      'id',
      'lost_query_id',
      'found_item_id',
      'similarity_score',
      'semantic_score',
      'confidence_label',
      'evidence',
      'contradictions',
      'explanation',
      'status',
      'created_at'
    ))
  )
order by table_name, ordinal_position;

select viewname
from pg_views
where schemaname = 'public'
  and viewname in (
    'public_feed_view',
    'my_posts_view',
    'conversation_list_view'
  )
order by viewname;

select
  obj_description('public.profiles'::regclass) as profiles_comment,
  case
    when to_regclass('public.users') is not null
    then obj_description('public.users'::regclass)
    else null
  end as users_comment;

select
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'full_name'
  ) as profiles_has_full_name,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'email'
  ) as profiles_has_email,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'avatar_url'
  ) as profiles_has_avatar_url,
  exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'users'
  ) as has_legacy_users_table;
