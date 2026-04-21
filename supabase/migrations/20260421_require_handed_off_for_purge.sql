begin;

alter table public.posts
  add column if not exists handed_to_owner boolean not null default false;

comment on column public.posts.handed_to_owner is
  'True only when the owner-confirmed handoff happened. Purge is allowed only for these rows.';

-- Conservative backfill: existing rows are treated as not handed-off unless explicitly updated.
update public.posts
set handed_to_owner = false
where status = 'resolved'
  and handed_to_owner is distinct from false;

update public.posts
set handed_to_owner = false
where status <> 'resolved'
  and handed_to_owner is distinct from false;

create or replace function public.apply_post_resolution_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'resolved' then
    new.is_public := false;
    new.resolved_at := coalesce(new.resolved_at, old.resolved_at, now());

    if coalesce(new.handed_to_owner, false) then
      new.purge_after_at := coalesce(
        new.purge_after_at,
        old.purge_after_at,
        new.resolved_at + interval '30 days'
      );
    else
      new.purge_after_at := null;
    end if;
  elsif new.status = 'active' then
    new.resolved_at := null;
    new.purge_after_at := null;
    new.handed_to_owner := false;

    -- Lost posts can be public, found posts remain internal by default.
    if new.type = 'found' then
      new.is_public := false;
    elsif new.type = 'lost' then
      new.is_public := true;
    end if;
  elsif new.status in ('draft', 'archived', 'removed') then
    new.is_public := false;
    new.resolved_at := null;
    new.purge_after_at := null;
    new.handed_to_owner := false;
  end if;

  return new;
end;
$$;

-- Ensure unresolved handoff rows are never scheduled for purge.
update public.posts
set purge_after_at = null
where status = 'resolved'
  and coalesce(handed_to_owner, false) = false;

create or replace function public.purge_expired_resolved_posts(batch_size integer default 200)
returns table (
  deleted_posts integer,
  deleted_storage_objects integer
)
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  safe_batch integer := greatest(coalesce(batch_size, 200), 1);
begin
  return query
  with candidates as (
    select p.id
    from public.posts p
    where p.status = 'resolved'
      and coalesce(p.handed_to_owner, false) = true
      and p.purge_after_at is not null
      and p.purge_after_at <= now()
    order by p.purge_after_at asc
    limit safe_batch
  ),
  image_paths as (
    select pi.storage_path
    from public.post_images pi
    join candidates c on c.id = pi.post_id
    where pi.storage_path is not null
  ),
  deleted_storage as (
    delete from storage.objects so
    using image_paths ip
    where so.bucket_id = 'post-images'
      and so.name = ip.storage_path
    returning so.id
  ),
  deleted_posts_cte as (
    delete from public.posts p
    using candidates c
    where p.id = c.id
    returning p.id
  )
  select
    coalesce((select count(*)::int from deleted_posts_cte), 0),
    coalesce((select count(*)::int from deleted_storage), 0);
end;
$$;

revoke all on function public.purge_expired_resolved_posts(integer) from public;
grant execute on function public.purge_expired_resolved_posts(integer) to service_role;

commit;
