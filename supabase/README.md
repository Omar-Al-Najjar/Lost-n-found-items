# Supabase Mobile MVP Schema

This folder contains the schema consolidation for the mobile MVP.

## Files

- `migrations/20260419_mobile_mvp_schema.sql`
  - canonical mobile schema
  - RLS policies
  - storage bucket setup
  - feed, my-posts, and conversation-list views
  - cleanup of legacy `items`-style tables

- `queries/verify_mobile_mvp_schema.sql`
  - post-migration verification queries

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
