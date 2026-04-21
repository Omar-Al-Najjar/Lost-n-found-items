begin;

alter table public.posts
  add column if not exists resolved_at timestamptz,
  add column if not exists purge_after_at timestamptz;

comment on column public.posts.resolved_at is
  'Timestamp when the report was marked handed-off/resolved.';

comment on column public.posts.purge_after_at is
  'Timestamp after which a resolved report can be permanently deleted by cleanup jobs.';

create index if not exists idx_posts_purge_after_resolved
  on public.posts (purge_after_at)
  where status = 'resolved' and purge_after_at is not null;

-- Backfill old rows to align with privacy and retention behavior.
update public.posts
set is_public = false
where type = 'found'
  and status = 'active'
  and is_public is distinct from false;

update public.posts
set
  is_public = false,
  resolved_at = coalesce(resolved_at, updated_at, posted_at, created_at, now()),
  purge_after_at = coalesce(
    purge_after_at,
    coalesce(resolved_at, updated_at, posted_at, created_at, now()) + interval '30 days'
  )
where status = 'resolved';

update public.posts
set
  resolved_at = null,
  purge_after_at = null
where status <> 'resolved'
  and (resolved_at is not null or purge_after_at is not null);

create or replace function public.apply_post_resolution_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'resolved' then
    new.is_public := false;

    if tg_op = 'INSERT' or old.status is distinct from 'resolved' then
      new.resolved_at := coalesce(new.resolved_at, now());
      new.purge_after_at := coalesce(new.purge_after_at, now() + interval '30 days');
    else
      new.resolved_at := coalesce(new.resolved_at, old.resolved_at, now());
      new.purge_after_at := coalesce(
        new.purge_after_at,
        old.purge_after_at,
        new.resolved_at + interval '30 days'
      );
    end if;
  elsif new.status = 'active' then
    new.resolved_at := null;
    new.purge_after_at := null;

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
  end if;

  return new;
end;
$$;

drop trigger if exists apply_post_resolution_state_before_write on public.posts;
create trigger apply_post_resolution_state_before_write
before insert or update of status, type
on public.posts
for each row
execute function public.apply_post_resolution_state();

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
