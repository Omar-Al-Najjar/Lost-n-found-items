begin;

-- Backfill: active found posts should be visible in the public feed.
update public.posts
set is_public = true
where type = 'found'
  and status = 'active'
  and is_removed = false
  and is_public is distinct from true;

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
    new.is_public := true;
  elsif new.status in ('draft', 'archived', 'removed') then
    new.is_public := false;
    new.resolved_at := null;
    new.purge_after_at := null;
    new.handed_to_owner := false;
  end if;

  return new;
end;
$$;

commit;
