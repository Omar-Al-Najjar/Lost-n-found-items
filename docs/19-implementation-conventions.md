# 19 - Implementation Conventions

This file translates the source docs into practical coding conventions for this repo.

## Frontend Conventions

- Use TypeScript for all app code.
- Prefer feature-based folders (`auth`, `feed`, `create`, `search`, `inbox`, `profile`).
- Keep screens focused on UI; move Supabase calls into typed service modules.
- Validate form input with schema-based validation before API calls.

## Supabase and Security Conventions

- All user data access must be RLS-compatible.
- Do not trust client ownership fields without server-side checks.
- Use safe views/RPCs for feed and detail reads whenever possible.
- Never expose service role keys or privileged tokens in mobile code.

## Edge Function Conventions

- Validate all request payloads at function boundaries.
- Return normalized success/error shape from all functions.
- Make AI jobs idempotent through dedupe keys and retry-safe writes.
- Persist raw AI output plus normalized output for auditability.

## Search and Matching Conventions

- Use hybrid scoring (structured + text + vector + geo).
- Keep explanation chips deterministic and user-readable.
- Log search queries and match generation events for observability.

## Delivery Conventions

- Ship in the order defined in `14-implementation-plan.md`.
- Update docs in this folder when behavior changes.
- Keep checklists in `18-build-checklist.md` current as progress is made.
