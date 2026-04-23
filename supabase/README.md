# Supabase Mobile MVP Schema

This folder contains the schema consolidation for the mobile MVP.

## Files

- `migrations/20260419_mobile_mvp_schema.sql`
  - canonical mobile schema
  - RLS policies
  - storage bucket setup
  - feed, my-posts, and conversation-list views
  - cleanup of legacy `items`-style tables

- `migrations/20260421_post_resolution_retention_cleanup.sql`
  - adds `resolved_at` + `purge_after_at` on `posts`
  - auto-hides resolved posts from public feed
  - adds `purge_expired_resolved_posts(batch_size)` cleanup function

- `migrations/20260421_require_handed_off_for_purge.sql`
  - adds `handed_to_owner` to `posts`
  - ensures purge only applies when `handed_to_owner = true`
  - updates purge function and resolution trigger accordingly

- `migrations/20260423_show_active_found_posts_in_public_feed.sql`
  - makes active found posts visible in `public_feed_view`
  - keeps resolved/draft/archived/removed posts hidden from public feed

- `migrations/20260423_ai_match_normalization_fields.sql`
  - adds write-time AI matching columns on `public.posts`:
    - `match_text_en`, `match_keywords_en`, `match_location_en`, `match_norm_updated_at`
  - seeds basic values for existing active found posts
  - adds indexes for faster matching retrieval/filtering

- `migrations/20260421_chat_images_and_presence.sql`
  - adds profile `last_seen_at` + `touch_my_presence()` RPC
  - adds image support fields on `messages` and enum value `message_type = 'image'`
  - creates private `message-images` bucket + storage policies
  - updates `conversation_list_view` with `other_last_seen_at`

- `queries/verify_mobile_mvp_schema.sql`
  - post-migration verification queries

- `queries/setup_resolved_post_purge_cron.sql`
  - optional pg_cron schedule for periodic purge of resolved posts past retention

## How to apply

Run the migration in one of these ways:

1. Supabase SQL Editor
   - Open your project
   - Go to `SQL Editor`
   - Paste `migrations/20260419_mobile_mvp_schema.sql`
   - Run it

2. Supabase CLI
   - Put this repo under a normal Supabase project layout
   - Run your usual `supabase db push` / migration flow

## Important note

This migration assumes a fresh or development database and intentionally removes legacy tables:

- `items`
- `item_images`
- `claims`
- `locations`
- legacy message/conversation/notification tables

If your live project has production data, do not run this as-is. Convert it into a staged migration with data backfills first.
