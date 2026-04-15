# 18 - Build Checklist

Use this checklist while implementing the MVP. Mark items complete as we ship.

## Phase 0 - Setup

- [ ] Initialize Expo app with TypeScript
- [ ] Add Expo Router tabs + auth route groups
- [ ] Add lint/format/test baseline
- [ ] Add env strategy for local/staging/prod

## Phase 1 - Auth

- [ ] Supabase client and auth provider
- [ ] Sign up, sign in, reset password screens
- [ ] Session persistence on mobile
- [ ] Profile bootstrap after registration

## Phase 2 - Database and Security

- [ ] Create enums and tables from schema doc
- [ ] Add indexes and views
- [ ] Enable and test RLS on all user tables
- [ ] Add storage policies for avatars and post images

## Phase 3 - Posting

- [ ] Create found item flow
- [ ] Create lost item flow
- [ ] Upload images and link to posts
- [ ] Owner edit/resolve/archive actions

## Phase 4 - Feed and Detail

- [ ] Public feed query and pagination
- [ ] Post detail screen with safe fields
- [ ] Owner management controls and empty states

## Phase 5 - Messaging

- [ ] Conversation creation endpoint
- [ ] Inbox list and thread UI
- [ ] Realtime message updates
- [ ] Read state handling

## Phase 6 - AI and Search

- [ ] `analyze-item` edge function
- [ ] `generate-embedding` edge function
- [ ] `search-found-items` edge function
- [ ] Hybrid ranking + explanation chips

## Phase 7 - Matching and Moderation

- [ ] Proactive match generation endpoint
- [ ] Report content flow and backend handling
- [ ] Basic anti-abuse rate limits

## Phase 8 - QA and Release Readiness

- [ ] Integration tests for key happy paths
- [ ] Loading/error states on all screens
- [ ] Security pass on auth, RLS, storage, and function access
- [ ] MVP walkthrough validation:
  - [ ] Authenticate
  - [ ] Create found post
  - [ ] Create lost post
  - [ ] Browse feed
  - [ ] Search matches
  - [ ] Start private conversation
  - [ ] Resolve post
