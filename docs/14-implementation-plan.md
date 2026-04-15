# 14 — Implementation Plan

## Phase 0 — Repository Setup

Deliverables:
- Expo app scaffold
- TypeScript
- Expo Router
- Supabase project created
- environment configuration
- lint/format/test baseline

## Phase 1 — Auth and Session

Deliverables:
- sign in/up/reset screens
- auth provider
- route protection
- profile bootstrap
- sign out

Dependencies:
- Supabase Auth
- profile table

## Phase 2 — Core Schema and RLS

Deliverables:
- SQL migrations for core tables
- RLS policies
- seed data or local dev fixtures
- basic safe public views

Dependencies:
- database finalized

## Phase 3 — Found/Lost Post Creation

Deliverables:
- create found flow
- create lost flow
- image upload
- own post management
- feed cards visible

Dependencies:
- posts table
- images table
- storage bucket policies

## Phase 4 — Feed and Detail

Deliverables:
- feed list
- filters
- post detail screen
- owner management actions
- pagination

Dependencies:
- safe feed view
- detail read model

## Phase 5 — Messaging

Deliverables:
- conversation creation flow
- inbox list
- thread screen
- realtime updates
- unread state

Dependencies:
- conversation schema
- message schema
- policies
- realtime wiring

## Phase 6 — AI Analysis

Deliverables:
- analyze-item function
- AI extraction schema
- post analysis state
- retry behavior
- embeddings generation

Dependencies:
- post and images data stable
- AI provider keys

## Phase 7 — Search and Matching

Deliverables:
- search input
- search function
- ranked results
- explanations
- proactive matches

Dependencies:
- embeddings
- indexes
- ranking logic

## Phase 8 — Moderation and Polish

Deliverables:
- report flow
- status history
- edge case cleanup
- loading/error polish
- analytics hooks
- production hardening

## Recommended Order Within Codex

1. create migrations
2. create Supabase client wiring
3. create auth screens and providers
4. create route groups and protected layouts
5. create feed and profile foundations
6. create post creation with storage
7. create messaging
8. add AI functions
9. add search and matching
10. add moderation and QA

## Definition of Done Per Phase

A phase is done when:
- UI exists
- backend path exists
- policies are enforced
- error states handled
- at least one happy-path integration tested

## Risks

- image upload complexity on mobile
- RLS policy mistakes
- AI JSON inconsistency
- search ranking quality tuning
- realtime subscription edge cases

## Risk Mitigation

- keep first schema simple
- use typed validators on all function payloads
- log AI raw responses
- start with direct deterministic ranking, then tune
- prefer one conversation creation path controlled by server logic
