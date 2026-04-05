# Lost and Found App Docs

This repository uses the documents in this folder as the source of truth for the same React Native app.

## Source Docs Imported

- `README-source.md`
- `06-database-schema.md`
- `07-rls-and-security.md`
- `11-api-contracts.md`
- `12-screen-specs.md`
- `14-implementation-plan.md`
- `17-codex-build-instructions.md`

## Execution Order

1. `17-codex-build-instructions.md`
2. `06-database-schema.md`
3. `07-rls-and-security.md`
4. `11-api-contracts.md`
5. `12-screen-specs.md`
6. `14-implementation-plan.md`

## Working Rules

- All app and backend changes should map back to one of the docs above.
- If implementation deviates, update docs first, then code.
- Keep security and RLS decisions explicit in schema migrations and service code.
- Never place Supabase service role keys in client/mobile code.

## Current Repo Status

- App entry scaffold exists in `App.tsx`.
- Docs are now colocated in this workspace under `docs/`.
- Next implementation step is project scaffolding for Expo Router + Supabase client wiring.
