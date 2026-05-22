-- ============================================
-- FIX: Rotate auto-publish cron for Week 2
-- Run in Supabase SQL Editor
-- Date: 2026-04-14
-- ============================================

-- STEP 1: Check current cron jobs (see what's scheduled)
SELECT jobid, jobname, schedule, command
FROM cron.job
WHERE jobname LIKE '%auto-publish%' OR command LIKE '%auto-publish%'
ORDER BY jobid;

-- STEP 2: Check what already ran (to confirm duplicates)
SELECT jobid, jobname, status, return_message, start_time, end_time
FROM cron.job_run_details
WHERE jobname LIKE '%auto-publish%' OR command LIKE '%auto-publish%'
ORDER BY start_time DESC
LIMIT 20;

-- ============================================
-- STEP 3: Delete old schedules and create new ones for Week 2
-- Uncomment and run AFTER reviewing Steps 1-2
-- ============================================

-- First, unschedule all existing auto-publish jobs
-- (replace JOB_ID with actual jobids from Step 1)
-- SELECT cron.unschedule(JOB_ID);

-- Week 2 schedule (Apr 14-20):
-- Mon Apr 14: day4-apps (image, FB+IG) — phone tip
-- Wed Apr 16: Reel 2 — FrontSeat (manual publish via meta-publish)
-- Fri Apr 18: day8-phrases (image, FB+IG) — front seat script
-- Sun Apr 20: Reel 3 — Emergency (manual publish via meta-publish)

-- Monday image post (9:00 AM UTC = 4:00 AM COT)
SELECT cron.schedule(
  'auto-publish-mon',
  '0 14 * * 1',  -- Monday 2:00 PM UTC = 9:00 AM COT
  $$
  SELECT net.http_post(
    url := 'https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/auto-publish',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"postId": "day4-apps"}'::jsonb
  );
  $$
);

-- Friday image post
SELECT cron.schedule(
  'auto-publish-fri',
  '0 14 * * 5',  -- Friday 2:00 PM UTC = 9:00 AM COT
  $$
  SELECT net.http_post(
    url := 'https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/auto-publish',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"postId": "day8-phrases"}'::jsonb
  );
  $$
);

-- NOTE: Reels (Wed + Sun) are published manually via meta-publish
-- because IG Reels require video_url + media_type=REELS + status polling.
-- Use this curl to publish each Reel:
--
-- curl -X POST "https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/meta-publish" \
--   -H "Content-Type: application/json" \
--   -d '{
--     "message": "CAPTION_HERE",
--     "imageUrl": "https://uocwxwvcrnkfnnoyjzyb.supabase.co/storage/v1/object/public/content/reels/REEL_FILE.mp4",
--     "platforms": ["facebook"]
--   }'
