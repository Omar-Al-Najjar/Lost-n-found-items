# AI Workspace

This folder is the local Python workspace for the Lost & Found AI agent.

Current layout:
- `notebooks/ai-agent.ipynb`: original prototype notebook kept as reference
- `pipeline.py`: reusable local Python pipeline extracted from the notebook
- `app.py`: simple local Streamlit frontend for testing the notebook flow
- `../api/index.py`: FastAPI entrypoint used for the deployed Vercel API
- `requirements.txt`: Python dependencies for the local AI workspace

Planned next steps:
1. Run lightweight validation and confirm the local app startup flow
2. Prepare the pipeline for later API deployment

## Local run

From the repo root:

```bash
py -m venv .venv
.venv\Scripts\activate
pip install -r ai\requirements.txt
set MOONSHOT_API_KEY=your_real_key_here
set SUPABASE_DB_URL=your_supabase_postgres_connection_string
streamlit run ai\app.py
```

## Local API run

From the repo root:

```bash
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
set MOONSHOT_API_KEY=your_real_key_here
set MOONSHOT_BASE_URL=https://api.moonshot.ai/v1
set KIMI_MODEL=kimi-k2.5
set SUPABASE_DB_URL=your_supabase_postgres_connection_string
set SUPABASE_URL=https://your-project-ref.supabase.co
set SUPABASE_ANON_KEY=your_public_anon_key
uvicorn api.index:app --reload
```

API endpoints:
- `GET /api/health`
- `POST /api/found/analyze`
- `POST /api/lost/search`

Vercel deployment files:
- `requirements.txt`
- `vercel.json`
- `.vercelignore`

The local Streamlit app now requires `SUPABASE_DB_URL`.
- It reads real `public.profiles` data and writes found-item records into the real `public.posts` table used by the React Native app.
- It no longer falls back to fake in-memory data when you launch Streamlit.
- The repo now includes `.streamlit/config.toml` with `fileWatcherType = "none"` to avoid Streamlit watcher crashes/noise when `torch` and `sentence-transformers` are imported.

Supabase mode now uses the live app tables for core data:
- `public.profiles` for user selection
- `public.posts` for found-item records and search candidates

Optional backend-only helper tables may still exist:
- `public.ai_pipeline_users`
- `public.ai_found_items`
- `public.ai_lost_queries`
- `public.ai_matches`

The Supabase bootstrap and alignment migrations live in:
- `supabase/migrations/20260420_ai_pipeline_testing_schema.sql`
- `supabase/migrations/20260421_align_ai_pipeline_with_live_schema.sql`
- `supabase/migrations/20260421_remove_seeded_ai_pipeline_users.sql`

Verification queries live in:
- `supabase/queries/verify_ai_pipeline_schema.sql`
- `supabase/queries/verify_combined_schema.sql`

The Python pipeline stays isolated from the mobile app tables, but it now uses app-compatible field names where it matters:
- `generated_summary`
- `subcategory`
- `primary_color`
- `notable_features`
- `public_location_label`

Canonical live mobile schema:
- user identity: `public.profiles`
- reports: `public.posts`
- images: `public.post_images`
- chat: `public.conversations`, `public.conversation_participants`, `public.messages`
- alerts: `public.notifications`

Legacy notes:
- `public.users` may still exist in Supabase, but it is not the canonical mobile app user table for this repo.
- `public.ai_pipeline_users` is deprecated and should not be used as the source of truth for Streamlit or the React Native app.

## VS Code

There is also a ready-to-run VS Code launch config:
- `AI App (Streamlit)`

Before launching it, make sure `MOONSHOT_API_KEY` is set in your terminal or Python environment.

## Notes

- The Python test pipeline now uses real app-facing Supabase data for users and found posts.
- The deployed API verifies the Supabase bearer token and keeps the Moonshot key server-side.
- Streamlit no longer depends on seeded fake users; it reads from `public.profiles`.
- Found items saved from Streamlit now write into `public.posts`, so they can appear in the React Native app.
- `sentence-transformers` and related packages were installed into the current Python environment.
- Pip reported some unrelated dependency conflicts in that environment, so a dedicated virtualenv is still the safer long-term setup.
