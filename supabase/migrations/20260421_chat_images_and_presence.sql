begin;

alter table public.profiles
  add column if not exists last_seen_at timestamptz not null default now();

create index if not exists idx_profiles_last_seen_at on public.profiles (last_seen_at desc);

update public.profiles
set last_seen_at = coalesce(last_seen_at, updated_at, created_at, now())
where last_seen_at is null;

do $$
begin
  alter type public.message_type add value if not exists 'image';
exception
  when duplicate_object then null;
end
$$;

alter table public.messages
  add column if not exists image_path text,
  add column if not exists image_mime_type text,
  add column if not exists image_width integer,
  add column if not exists image_height integer;

create index if not exists idx_messages_image_path on public.messages (image_path) where image_path is not null;

create or replace function public.touch_my_presence()
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  touched_at timestamptz := now();
begin
  update public.profiles
  set last_seen_at = touched_at
  where id = auth.uid();

  return touched_at;
end;
$$;

revoke all on function public.touch_my_presence() from public;
grant execute on function public.touch_my_presence() to authenticated;

create or replace function public.mark_conversation_read(target_conversation_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = public
as $$
declare
  read_at timestamptz := now();
begin
  update public.conversation_participants cp
  set last_read_at = read_at
  where cp.conversation_id = target_conversation_id
    and cp.user_id = auth.uid();

  return read_at;
end;
$$;

revoke all on function public.mark_conversation_read(uuid) from public;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

create or replace function public.leave_conversation(target_conversation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.conversation_participants cp
  where cp.conversation_id = target_conversation_id
    and cp.user_id = auth.uid();

  delete from public.conversations c
  where c.id = target_conversation_id
    and not exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = c.id
    );

  return true;
end;
$$;

revoke all on function public.leave_conversation(uuid) from public;
grant execute on function public.leave_conversation(uuid) to authenticated;

drop view if exists public.conversation_list_view;

create view public.conversation_list_view
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
  coalesce(unread.unread_count, 0) as unread_count,
  other_profile.last_seen_at as other_last_seen_at
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

grant select on public.conversation_list_view to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  ('message-images', 'message-images', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "message_images_select_allowed" on storage.objects;
create policy "message_images_select_allowed"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'message-images'
  and exists (
    select 1
    from public.messages m
    join public.conversation_participants cp on cp.conversation_id = m.conversation_id
    where m.image_path = storage.objects.name
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "message_images_insert_own_folder" on storage.objects;
create policy "message_images_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'message-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "message_images_update_own" on storage.objects;
create policy "message_images_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'message-images'
  and owner_id = auth.uid()::text
)
with check (
  bucket_id = 'message-images'
  and owner_id = auth.uid()::text
);

drop policy if exists "message_images_delete_own" on storage.objects;
create policy "message_images_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'message-images'
  and owner_id = auth.uid()::text
);

commit;
