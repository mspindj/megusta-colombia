-- ============================================
-- Check what auto-publish has actually published
-- Run Steps 1 & 2 in Supabase SQL Editor
-- ============================================

-- STEP 1: See all cron job runs
SELECT
  jrd.jobid,
  j.jobname,
  jrd.status,
  jrd.return_message,
  jrd.start_time,
  jrd.end_time
FROM cron.job_run_details jrd
LEFT JOIN cron.job j ON jrd.jobid = j.jobid
ORDER BY jrd.start_time DESC
LIMIT 30;

-- STEP 2: See current scheduled jobs
SELECT jobid, jobname, schedule, command
FROM cron.job
ORDER BY jobid;
