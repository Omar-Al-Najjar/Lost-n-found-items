-- Optional: schedule automatic cleanup for resolved posts.
-- Run this after the retention migration is applied.

create extension if not exists pg_cron;

-- Remove old job if it exists.
select cron.unschedule(jobid)
from cron.job
where jobname = 'purge-expired-resolved-posts';

-- Run every day at 03:15 UTC (adjust as needed).
select cron.schedule(
  'purge-expired-resolved-posts',
  '15 3 * * *',
  $$select public.purge_expired_resolved_posts(500);$$
);

-- Verify scheduled jobs.
select jobid, jobname, schedule, command
from cron.job
where jobname = 'purge-expired-resolved-posts';
