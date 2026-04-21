begin;

drop policy if exists "conversations_select_participants" on public.conversations;
create policy "conversations_select_participants"
on public.conversations
for select
to authenticated
using (
  created_by = auth.uid()
  or exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversations.id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "conversation_participants_select_participants" on public.conversation_participants;
create policy "conversation_participants_select_participants"
on public.conversation_participants
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.conversations c
    where c.id = conversation_participants.conversation_id
      and c.created_by = auth.uid()
  )
);

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
  or exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and c.created_by = auth.uid()
  )
);

drop policy if exists "messages_insert_sender_participant" on public.messages;
create policy "messages_insert_sender_participant"
on public.messages
for insert
to authenticated
with check (
  sender_user_id = auth.uid()
  and (
    exists (
      select 1
      from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and c.created_by = auth.uid()
    )
  )
);

commit;
