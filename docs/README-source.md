# Lost & Found — Codex Build Pack

This repository contains the functional, technical, and implementation documentation needed for Codex to build the **Lost & Found** mobile application.

## Product Summary

Lost & Found is a city/region-wide mobile application for iOS and Android built with **React Native + Expo**, backed by **Supabase** for auth, Postgres, storage, and realtime. The app lets people:

- post items they found
- describe items they lost
- search found items using AI-assisted matching
- chat privately to verify ownership and arrange return
- manage their posts and item history from a personal profile

## Recommended Implementation Stack

### Frontend
- React Native
- Expo
- Expo Router
- TypeScript
- React Query (TanStack Query)
- Zustand or Context for lightweight local UI state
- React Hook Form + Zod
- Expo Image Picker
- Expo Secure Store
- NativeWind or a small custom design system

### Backend
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Supabase Realtime
- Supabase Edge Functions
- pgvector for embeddings
- SQL migrations managed through Supabase CLI

### AI
- Vision + language model for item extraction from photos and user text
- Text embeddings for semantic retrieval
- Hybrid ranking:
  - structured filtering
  - full-text search
  - vector similarity
  - deterministic business scoring

## Folder Map

- `docs/00-product-overview.md` — one-page summary of the product and goals
- `docs/01-requirements-and-scope.md` — product requirements, scope, and acceptance criteria
- `docs/02-user-flows.md` — end-to-end user flows
- `docs/03-information-architecture.md` — app entities, navigation, and data relationships
- `docs/04-frontend-architecture.md` — React Native/Expo frontend architecture
- `docs/05-backend-architecture.md` — Supabase backend architecture and services
- `docs/06-database-schema.md` — complete database design, enums, tables, indexes, and SQL sketches
- `docs/07-rls-and-security.md` — RLS, authorization, safety, and privacy policies
- `docs/08-storage-and-media.md` — image upload, processing, buckets, and media rules
- `docs/09-ai-pipeline-and-matching.md` — AI extraction, embeddings, search, and ranking
- `docs/10-messaging-and-realtime.md` — inbox/chat system and realtime behavior
- `docs/11-api-contracts.md` — service contracts and Edge Function I/O definitions
- `docs/12-screen-specs.md` — screen-by-screen frontend requirements
- `docs/13-design-system.md` — UI design system and component guidance
- `docs/14-implementation-plan.md` — build order and milestones
- `docs/15-testing-and-qa.md` — test plan
- `docs/16-devops-and-env.md` — environments, secrets, deployment, observability
- `docs/17-codex-build-instructions.md` — direct instructions for Codex on how to execute the build

## Recommended Build Phases

1. Project scaffolding and auth
2. Core database schema and RLS
3. Storage and item post creation
4. Feed and item detail screens
5. Lost post creation
6. Messaging
7. AI extraction pipeline
8. Search and smart matching
9. Moderation, trust, analytics, polish

## Non-Goals for MVP

- Payments
- Public comments
- Admin dashboard web app
- Complex social features
- End-to-end identity verification
- Multi-language translation pipeline
- Automated courier handoff

## MVP Definition

The MVP is successful when a user can:

1. sign up and sign in
2. create a found item post with photos
3. create a lost item post
4. browse a city/region feed
5. search found items with natural language
6. open a match candidate
7. message another user privately
8. mark an item as returned or resolved

## Important Build Principles

- Privacy first: no public phone numbers or personal contact info
- RLS first: client should never bypass database policy enforcement
- AI assistive, not authoritative: AI suggests matches but users verify ownership
- Deterministic schema: keep structured extracted fields alongside raw user text
- Idempotent backend jobs: photo analysis and embedding generation must be retry-safe
- Auditability: log match events and state transitions

## Suggested Initial Repository Layout

```text
/apps/mobile
/supabase/functions
/supabase/migrations
/packages/shared
/docs
```

## Start Here

Codex should read these files in this order:

1. `docs/17-codex-build-instructions.md`
2. `docs/01-requirements-and-scope.md`
3. `docs/06-database-schema.md`
4. `docs/07-rls-and-security.md`
5. `docs/11-api-contracts.md`
6. `docs/12-screen-specs.md`
7. `docs/14-implementation-plan.md`
