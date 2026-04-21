select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'ai_pipeline_users',
    'ai_found_items',
    'ai_lost_queries',
    'ai_matches'
  )
order by table_name;

select table_name, column_name, data_type, udt_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'ai_pipeline_users',
    'ai_found_items',
    'ai_lost_queries',
    'ai_matches'
  )
order by table_name, ordinal_position;

select
  indexname,
  tablename,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in (
    'ai_pipeline_users',
    'ai_found_items',
    'ai_lost_queries',
    'ai_matches'
  )
order by tablename, indexname;

select
  column_name,
  col_description('public.ai_found_items'::regclass, ordinal_position) as column_comment
from information_schema.columns
where table_schema = 'public'
  and table_name = 'ai_found_items'
  and column_name in ('status')
order by ordinal_position;

select
  obj_description('public.ai_pipeline_users'::regclass) as ai_pipeline_users_comment,
  obj_description('public.ai_found_items'::regclass) as ai_found_items_comment,
  obj_description('public.ai_lost_queries'::regclass) as ai_lost_queries_comment,
  obj_description('public.ai_matches'::regclass) as ai_matches_comment;
