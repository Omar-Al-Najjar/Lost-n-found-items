begin;

create or replace function public.is_conversation_creator(target_conversation_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = target_conversation_id
      and c.created_by = auth.uid()
  );
$$;

create or replace function public.is_conversation_participant(target_conversation_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = target_conversation_id
      and cp.user_id = auth.uid()
  );
$$;

revoke all on function public.is_conversation_creator(uuid) from public;
grant execute on function public.is_conversation_creator(uuid) to authenticated;

revoke all on function public.is_conversation_participant(uuid) from public;
grant execute on function public.is_conversation_participant(uuid) to authenticated;

drop policy if exists "conversations_select_participants" on public.conversations;
create policy "conversations_select_participants"
on public.conversations
for select
to authenticated
using (
  public.is_conversation_creator(id)
  or public.is_conversation_participant(id)
);

drop policy if exists "conversation_participants_select_participants" on public.conversation_participants;
create policy "conversation_participants_select_participants"
on public.conversation_participants
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_conversation_creator(conversation_id)
  or public.is_conversation_participant(conversation_id)
);

drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants"
on public.messages
for select
to authenticated
using (
  public.is_conversation_creator(conversation_id)
  or public.is_conversation_participant(conversation_id)
);

drop policy if exists "messages_insert_sender_participant" on public.messages;
create policy "messages_insert_sender_participant"
on public.messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and (
    public.is_conversation_creator(conversation_id)
    or public.is_conversation_participant(conversation_id)
  )
);

commit;
