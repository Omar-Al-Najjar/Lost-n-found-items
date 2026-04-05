# 07 — RLS and Security

## Security Principles

- RLS enabled on every user-generated table
- least privilege access
- no service role in mobile client
- private messages accessible only to participants
- storage access controlled by ownership and visibility rules
- public feed is still served from tables protected by RLS

## Authentication Model

Use Supabase Auth with authenticated sessions. The mobile app stores session tokens securely and refreshes them using the official client flow.

## Authorization Model

Authorization must be enforced primarily in Postgres through RLS and policy-aware storage access.

## Core RLS Rules

## profiles
- authenticated users can read limited public profile fields
- users can update only their own profile

## posts
- anyone authenticated can read active public posts in their allowed visibility scope
- owners can create, update, and resolve their own posts
- only owner or moderation role can soft-remove a post
- removed posts hidden from normal users

## post_images
- public read only if parent post is public and active
- owner can insert and manage images on own posts
- storage metadata must align with parent post ownership

## post_ai_extractions
- owner can read their own extraction results
- public users do not read raw AI payloads
- if some extracted public fields are needed, expose them through post columns or a view

## conversations
- only participants can read
- only authorized server-side flow or participants can create
- only participants can update read state
- blocked/archived behavior enforced by policy and app logic

## messages
- only participants can read messages in that conversation
- sender must be a participant to insert a message
- updates restricted or disabled for MVP
- deletes optional, typically avoided for MVP

## moderation_reports
- reporter can create
- reporter may read their own reports if desired
- admin-only for review fields if admin panel added later

## Example Policy Sketches

These are directional examples, not final migration-ready code.

## profiles read

```sql
create policy "profiles are readable to authenticated users"
on public.profiles
for select
to authenticated
using (true);
```

## profiles update own row

```sql
create policy "users update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```

## posts read public active rows

```sql
create policy "read active public posts"
on public.posts
for select
to authenticated
using (
  is_public = true
  and is_removed = false
  and status in ('active', 'analysis_pending', 'pending_verification')
);
```

## posts insert own row

```sql
create policy "users insert own posts"
on public.posts
for insert
to authenticated
with check (auth.uid() = user_id);
```

## posts update own row

```sql
create policy "users update own posts"
on public.posts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## messages read by conversation participants

```sql
create policy "participants read messages"
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
```

## messages insert by conversation participants

```sql
create policy "participants send messages"
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
```

## Storage Security Strategy

Use separate buckets:
- `avatars`
- `post-images`

Recommended rules:
- avatar bucket: authenticated upload, controlled read
- post-images: authenticated upload, access tied to post ownership and post visibility
- avoid blanket public bucket unless product policy explicitly allows every image to be public

## Sensitive Item Handling

Some categories may require stricter defaults:
- IDs
- wallets
- keys
- cards
- documents
- electronics with serials

Recommended behavior:
- public card hides overly specific sensitive details
- image blurring or partial obscuring may be needed later
- exact found location stays private
- messaging prompts include safer verification checklist

## Abuse Prevention

- rate limit message creation
- rate limit new conversations
- rate limit search endpoint
- basic spam detection on repeated messages
- report and soft-hide flow for content review

## Secrets Management

Store only on server-side:
- AI API keys
- service-role key
- provider webhooks
- admin tokens

Never expose:
- service-role key in Expo app
- internal AI prompt templates that include secrets
- moderation admin actions to client without proper role checks

## Auditability

Recommended audit events:
- post created
- post published
- post resolved
- conversation created
- moderation report created
- AI job failed
- match generated

## Production Checklist

- RLS enabled on all tables
- policies tested with authenticated and anonymous clients
- storage policies tested
- service role limited to server contexts
- error logs capture function failures without leaking secrets
