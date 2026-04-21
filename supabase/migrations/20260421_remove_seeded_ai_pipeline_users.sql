begin;

delete from public.ai_pipeline_users
where id in ('user_001', 'user_002', 'user_003', 'user_004')
   or email in ('ahmad@example.com', 'sara@example.com', 'omar@example.com', 'lina@example.com');

comment on table public.ai_pipeline_users is
  'Deprecated server-side Python test-user table. Real app users live in public.profiles.';

commit;
