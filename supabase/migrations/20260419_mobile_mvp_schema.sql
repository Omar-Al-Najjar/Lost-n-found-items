begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'post_type') then
    create type public.post_type as enum ('lost', 'found');
  end if;

  if not exists (select 1 from pg_type where typname = 'post_status') then
    create type public.post_status as enum ('draft', 'active', 'resolved', 'archived', 'removed');
  end if;

  if not exists (select 1 from pg_type where typname = 'conversation_status') then
    create type public.conversation_status as enum ('active', 'archived', 'blocked');
  end if;

  if not exists (select 1 from pg_type where typname = 'message_type') then
    create type public.message_type as enum ('text', 'system');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum ('match', 'message', 'status', 'system');
  end if;

  if not exists (select 1 from pg_type where typname = 'image_role') then
    create type public.image_role as enum ('primary', 'gallery');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop view if exists public.conversation_list_view;
drop view if exists public.my_posts_view;
drop view if exists public.public_feed_view;

drop table if exists public.item_images cascade;
drop table if exists public.claims cascade;
drop table if exists public.locations cascade;
drop table if exists public.items cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversation_participants cascade;
drop table if exists public.conversations cascade;
drop table if exists public.notifications cascade;
drop table if exists public.post_images cascade;
drop table if exists public.posts cascade;
drop table if exists public.categories cascade;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_path text,
  home_country_code text,
  home_city_slug text,
  home_region_slug text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists avatar_path text,
  add column if not exists home_country_code text,
  add column if not exists home_city_slug text,
  add column if not exists home_region_slug text,
  add column if not exists bio text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.profiles
set display_name = coalesce(nullif(trim(display_name), ''), 'User')
where display_name is null or trim(display_name) = '';

alter table public.profiles
  alter column display_name set not null;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    created_at,
    updated_at
  )
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'User'
    ),
    now(),
    now()
  )
  on conflict (id) do update
  set
    display_name = excluded.display_name,
    updated_at = now();

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
grant execute on function public.handle_new_user() to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.categories (slug, name)
values
  ('electronics', 'Electronics'),
  ('bags', 'Bags'),
  ('documents', 'Documents'),
  ('accessories', 'Accessories'),
  ('other', 'Other')
on conflict (slug) do update
set name = excluded.name;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.post_type not null,
  status public.post_status not null default 'draft',
  country_code text not null,
  city_slug text not null,
  region_slug text,
  public_location_label text,
  precise_location_private text,
  user_description text not null,
  generated_title text,
  generated_summary text,
  category text not null,
  subcategory text,
  brand text,
  model text,
  primary_color text,
  secondary_color text,
  material text,
  condition_text text,
  notable_features text[] not null default '{}'::text[],
  search_keywords text[] not null default '{}'::text[],
  found_or_lost_at timestamptz,
  posted_at timestamptz not null default now(),
  has_images boolean not null default false,
  primary_image_path text,
  is_sensitive boolean not null default false,
  is_public boolean not null default true,
  is_removed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text not null unique,
  image_role public.image_role not null default 'gallery',
  position integer not null default 0,
  width integer,
  height integer,
  mime_type text,
  file_size_bytes bigint,
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  context_post_id uuid references public.posts(id) on delete set null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  status public.conversation_status not null default 'active',
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_user_id uuid not null references public.profiles(id) on delete cascade,
  type public.message_type not null default 'text',
  body text not null check (char_length(body) between 1 and 5000),
  is_edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  related_post_id uuid references public.posts(id) on delete set null,
  title text not null check (char_length(title) between 1 and 150),
  body text not null check (char_length(body) between 1 and 2000),
  type public.notification_type not null default 'system',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.sync_post_image_summary(target_post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts p
  set
    has_images = exists (
      select 1
      from public.post_images pi
      where pi.post_id = target_post_id
    ),
    primary_image_path = (
      select pi.storage_path
      from public.post_images pi
      where pi.post_id = target_post_id
      order by
        case when pi.image_role = 'primary' then 0 else 1 end,
        pi.position asc,
        pi.created_at asc
      limit 1
    ),
    updated_at = now()
  where p.id = target_post_id;
$$;

create or replace function public.handle_post_images_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_post_id uuid;
begin
  affected_post_id := coalesce(new.post_id, old.post_id);
  perform public.sync_post_image_summary(affected_post_id);
  return coalesce(new, old);
end;
$$;

create or replace function public.touch_conversation_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set
    last_message_at = (
      select max(m.created_at)
      from public.messages m
      where m.conversation_id = coalesce(new.conversation_id, old.conversation_id)
    ),
    updated_at = now()
  where id = coalesce(new.conversation_id, old.conversation_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
before update on public.conversations
for each row
execute function public.set_updated_at();

drop trigger if exists set_messages_updated_at on public.messages;
create trigger set_messages_updated_at
before update on public.messages
for each row
execute function public.set_updated_at();

drop trigger if exists post_images_sync_post_summary on public.post_images;
create trigger post_images_sync_post_summary
after insert or update or delete on public.post_images
for each row
execute function public.handle_post_images_change();

drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation
after insert or update or delete on public.messages
for each row
execute function public.touch_conversation_last_message();

create index idx_categories_slug on public.categories (slug);
create index idx_posts_user_id_created_at on public.posts (user_id, created_at desc);
create index idx_posts_feed on public.posts (city_slug, region_slug, type, status, posted_at desc);
create index idx_posts_status on public.posts (status);
create index idx_posts_category on public.posts (category);
create index idx_posts_posted_at on public.posts (posted_at desc);
create index idx_post_images_post_id_position on public.post_images (post_id, position);
create index idx_conversations_context_post_id on public.conversations (context_post_id);
create index idx_conversations_last_message_at on public.conversations (last_message_at desc nulls last);
create index idx_conversation_participants_user_id on public.conversation_participants (user_id, joined_at desc);
create index idx_messages_conversation_id_created_at on public.messages (conversation_id, created_at asc);
create index idx_notifications_user_id_created_at on public.notifications (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "categories_select_authenticated" on public.categories;
create policy "categories_select_authenticated"
on public.categories
for select
to authenticated
using (true);

drop policy if exists "posts_select_public_active" on public.posts;
create policy "posts_select_public_active"
on public.posts
for select
to authenticated
using (
  is_public = true
  and is_removed = false
  and status = 'active'
);

drop policy if exists "posts_select_own" on public.posts;
create policy "posts_select_own"
on public.posts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own"
on public.posts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own"
on public.posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own"
on public.posts
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "post_images_select_allowed" on public.post_images;
create policy "post_images_select_allowed"
on public.post_images
for select
to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_images.post_id
      and (
        p.user_id = auth.uid()
        or (
          p.is_public = true
          and p.is_removed = false
          and p.status = 'active'
        )
      )
  )
);

drop policy if exists "post_images_insert_owner" on public.post_images;
create policy "post_images_insert_owner"
on public.post_images
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.posts p
    where p.id = post_images.post_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "post_images_update_owner" on public.post_images;
create policy "post_images_update_owner"
on public.post_images
for update
to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_images.post_id
      and p.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.posts p
    where p.id = post_images.post_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "post_images_delete_owner" on public.post_images;
create policy "post_images_delete_owner"
on public.post_images
for delete
to authenticated
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_images.post_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "conversations_select_participants" on public.conversations;
create policy "conversations_select_participants"
on public.conversations
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversations.id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "conversations_update_owner" on public.conversations;
create policy "conversations_update_owner"
on public.conversations
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

drop policy if exists "conversation_participants_select_participants" on public.conversation_participants;
create policy "conversation_participants_select_participants"
on public.conversation_participants
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "conversation_participants_update_own" on public.conversation_participants;
create policy "conversation_participants_update_own"
on public.conversation_participants
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "messages_insert_sender_participant" on public.messages;
create policy "messages_insert_sender_participant"
on public.messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "messages_update_sender" on public.messages;
create policy "messages_update_sender"
on public.messages
for update
to authenticated
using (sender_user_id = auth.uid())
with check (sender_user_id = auth.uid());

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own"
on public.notifications
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own"
on public.notifications
for delete
to authenticated
using (user_id = auth.uid());

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select on public.categories to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.post_images to authenticated;
grant select, update on public.conversations to authenticated;
grant select, update on public.conversation_participants to authenticated;
grant select, insert, update on public.messages to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  ('avatars', 'avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('post-images', 'post-images', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_select_authenticated" on storage.objects;
create policy "avatars_select_authenticated"
on storage.objects
for select
to authenticated
using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own_folder" on storage.objects;
create policy "avatars_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and owner_id = auth.uid()::text
);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = auth.uid()::text
);

drop policy if exists "post_images_select_allowed" on storage.objects;
create policy "post_images_select_allowed"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'post-images'
  and exists (
    select 1
    from public.post_images pi
    join public.posts p on p.id = pi.post_id
    where pi.storage_path = storage.objects.name
      and (
        p.user_id = auth.uid()
        or (
          p.is_public = true
          and p.is_removed = false
          and p.status = 'active'
        )
      )
  )
);

drop policy if exists "post_images_insert_own_folder" on storage.objects;
create policy "post_images_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'post-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "post_images_update_own" on storage.objects;
create policy "post_images_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'post-images'
  and owner_id = auth.uid()::text
)
with check (
  bucket_id = 'post-images'
  and owner_id = auth.uid()::text
);

drop policy if exists "post_images_delete_own" on storage.objects;
create policy "post_images_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'post-images'
  and owner_id = auth.uid()::text
);

create or replace view public.public_feed_view
with (security_invoker = true)
as
select
  p.id,
  p.user_id,
  p.type,
  p.status,
  coalesce(nullif(p.generated_title, ''), initcap(replace(p.category, '_', ' '))) as title,
  coalesce(nullif(p.generated_summary, ''), left(p.user_description, 180)) as summary,
  p.category,
  p.brand,
  p.primary_color,
  p.city_slug,
  p.region_slug,
  p.public_location_label,
  p.primary_image_path,
  p.posted_at,
  pr.display_name as user_display_name,
  pr.avatar_path as user_avatar_path,
  p.is_sensitive
from public.posts p
join public.profiles pr on pr.id = p.user_id
where p.is_public = true
  and p.is_removed = false
  and p.status = 'active';

create or replace view public.my_posts_view
with (security_invoker = true)
as
select
  p.id,
  p.user_id,
  p.type,
  p.status,
  p.generated_title,
  p.generated_summary,
  p.user_description,
  p.category,
  p.brand,
  p.primary_color,
  p.city_slug,
  p.region_slug,
  p.public_location_label,
  p.posted_at,
  p.primary_image_path,
  p.has_images,
  coalesce(image_stats.image_count, 0) as image_count,
  coalesce(message_stats.message_count, 0) as message_count,
  message_stats.last_message_at
from public.posts p
left join lateral (
  select count(*)::int as image_count
  from public.post_images pi
  where pi.post_id = p.id
) image_stats on true
left join lateral (
  select
    count(m.id)::int as message_count,
    max(m.created_at) as last_message_at
  from public.conversations c
  left join public.messages m on m.conversation_id = c.id
  where c.context_post_id = p.id
) message_stats on true
where auth.uid() = p.user_id;

create or replace view public.conversation_list_view
with (security_invoker = true)
as
select
  cp.user_id as viewer_user_id,
  c.id as conversation_id,
  c.context_post_id,
  c.status,
  c.last_message_at,
  other_participant.user_id as other_user_id,
  other_profile.display_name as other_display_name,
  other_profile.avatar_path as other_avatar_path,
  post_context.generated_title as context_post_title,
  post_context.primary_image_path as context_post_image_path,
  latest_message.body as latest_message_body,
  latest_message.created_at as latest_message_created_at,
  coalesce(unread.unread_count, 0) as unread_count
from public.conversation_participants cp
join public.conversations c on c.id = cp.conversation_id
left join lateral (
  select cp2.user_id
  from public.conversation_participants cp2
  where cp2.conversation_id = c.id
    and cp2.user_id <> cp.user_id
  order by cp2.joined_at asc
  limit 1
) other_participant on true
left join public.profiles other_profile on other_profile.id = other_participant.user_id
left join public.posts post_context on post_context.id = c.context_post_id
left join lateral (
  select m.body, m.created_at
  from public.messages m
  where m.conversation_id = c.id
  order by m.created_at desc
  limit 1
) latest_message on true
left join lateral (
  select count(*)::int as unread_count
  from public.messages m
  where m.conversation_id = c.id
    and m.sender_user_id <> cp.user_id
    and (cp.last_read_at is null or m.created_at > cp.last_read_at)
) unread on true
where cp.user_id = auth.uid();

grant select on public.public_feed_view to authenticated;
grant select on public.my_posts_view to authenticated;
grant select on public.conversation_list_view to authenticated;

commit;
