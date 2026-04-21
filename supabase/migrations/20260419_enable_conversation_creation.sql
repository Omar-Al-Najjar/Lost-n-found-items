begin;

drop policy if exists "conversations_insert_own" on public.conversations;
create policy "conversations_insert_own"
on public.conversations
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "conversation_participants_insert_for_creator" on public.conversation_participants;
create policy "conversation_participants_insert_for_creator"
on public.conversation_participants
for insert
to authenticated
with check (
  exists (
    select 1
    from public.conversations c
    where c.id = conversation_participants.conversation_id
      and c.created_by = auth.uid()
  )
);

grant insert on public.conversations to authenticated;
grant insert on public.conversation_participants to authenticated;

commit;
