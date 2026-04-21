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
    'notifications'
  )
order by table_name;

select table_name, column_name, data_type, udt_name, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'profiles',
    'posts',
    'post_images',
    'conversations',
    'conversation_participants',
    'messages',
    'notifications'
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

select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname in ('public', 'storage')
  and (
    tablename in (
      'profiles',
      'posts',
      'post_images',
      'conversations',
      'conversation_participants',
      'messages',
      'notifications'
    )
    or tablename = 'objects'
  )
order by schemaname, tablename, policyname;

select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('avatars', 'post-images')
order by id;

select
  exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'items') as has_items,
  exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'item_images') as has_item_images,
  exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'claims') as has_claims,
  exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'locations') as has_locations;
