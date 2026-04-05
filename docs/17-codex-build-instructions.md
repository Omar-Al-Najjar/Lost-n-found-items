# 17 — Codex Build Instructions

You are building the **Lost & Found** mobile app from these docs.

## Objective

Implement an MVP mobile application using:
- Expo + React Native + TypeScript
- Expo Router
- Supabase Auth, Postgres, Storage, Realtime
- Supabase Edge Functions for AI workflows
- pgvector-based hybrid search

## Required Execution Order

1. Read `01-requirements-and-scope.md`
2. Implement schema from `06-database-schema.md`
3. Implement RLS/security from `07-rls-and-security.md`
4. Scaffold app routes from `04-frontend-architecture.md`
5. Build screens from `12-screen-specs.md`
6. Implement APIs from `11-api-contracts.md`
7. Follow milestone order in `14-implementation-plan.md`

## Hard Requirements

- TypeScript everywhere
- strict environment separation
- no service-role key in client code
- all DB writes compatible with RLS
- no placeholder fake security
- AI outputs validated before persistence
- search is hybrid, not embeddings-only
- messaging is private and access-controlled

## Repository Tasks

## 1. Mobile App
Create:
- auth flow
- feed
- create post flows
- search flow
- inbox
- profile
- reusable UI components
- Supabase client/provider setup
- typed service layer

## 2. Supabase Schema
Create migrations for:
- enums
- tables
- indexes
- views
- triggers
- policies

## 3. Storage
Create buckets and storage path helpers.

## 4. Edge Functions
Create:
- `analyze-item`
- `generate-embedding`
- `search-found-items`
- `generate-post-matches`
- `create-conversation-for-post`
- `report-content`

## 5. Matching Logic
Implement:
- query normalization
- embedding generation
- hybrid candidate retrieval
- deterministic reranking
- explanation chip generation

## Build Constraints

- do not expose internal moderation/admin features in MVP UI unless required
- do not block posting if AI analysis is delayed
- do not show private profile/contact information publicly
- do not rely on client-side authorization checks alone

## Code Quality Expectations

- strongly typed request/response contracts
- small, composable service modules
- clear feature boundaries
- loading/empty/error states on all screens
- resilient retry behavior for uploads and AI jobs

## Suggested Deliverable Sequence

### Step A
Initialize Expo project with routing, auth provider, and tab shell.

### Step B
Add Supabase client and schema migrations.

### Step C
Implement feed, detail, and profile screens using safe views.

### Step D
Implement lost/found post creation with image uploads.

### Step E
Implement messaging and inbox.

### Step F
Implement AI extraction, embeddings, and search.

### Step G
Implement proactive matches and moderation reporting.

## Completion Standard

The build is acceptable only when a real user can:
- authenticate
- create lost/found posts
- see them in feed
- search for likely matches
- start a private conversation
- mark a post resolved
