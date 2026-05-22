# Lovable Prompt — Deploy Tier 1 Automation Edge Functions

> Deploy 2 Supabase Edge Functions + pg_cron schedules for Reddit monitoring and copy generation

---

## Prompt

Create two new Supabase Edge Functions and set up pg_cron scheduled jobs for automated content operations.

### 1. Edge Function: `reddit-monitor`

Create a Supabase Edge Function called `reddit-monitor` that monitors Reddit for travel-related posts about Colombia. **Disable JWT verification** — this function is triggered by pg_cron, not by users.

Here is the complete code for `supabase/functions/reddit-monitor/index.ts`:

```typescript
[PASTE CONTENTS OF docs/supabase/reddit-monitor/index.ts HERE]
```

**Required secrets for this function:**
- `REDDIT_CLIENT_ID` — Reddit app client ID
- `REDDIT_CLIENT_SECRET` — Reddit app client secret
- `REDDIT_USERNAME` — megustaguides
- `REDDIT_PASSWORD` — Reddit account password
- `NOTION_API_KEY` — Notion internal integration token
- `NOTION_REDDIT_DB_ID` — d4d2bdf405e64b8fbf65ce1dfc43a5ae
- `BREVO_API_KEY` — already configured
- `NOTIFY_EMAIL` — hola@megusta.com.co

### 2. Edge Function: `generate-copy`

Create a Supabase Edge Function called `generate-copy` that generates marketing copy variants using Claude API. **Disable JWT verification.**

Here is the complete code for `supabase/functions/generate-copy/index.ts`:

```typescript
[PASTE CONTENTS OF docs/supabase/generate-copy/index.ts HERE]
```

**Required secrets for this function:**
- `ANTHROPIC_API_KEY` — Claude API key
- `NOTION_API_KEY` — same as above
- `NOTION_COPY_DB_ID` — d034050377714f8b820778c63c943bcb

### 3. pg_cron Scheduled Jobs

After deploying both functions, set up cron jobs using Supabase's SQL editor:

```sql
-- Enable pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Reddit Monitor: every 2 hours
SELECT cron.schedule(
  'reddit-monitor',
  '0 */2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/reddit-monitor',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Copy Generator: every Monday at 9:00 AM UTC
SELECT cron.schedule(
  'generate-copy',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/generate-copy',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

### 4. Test after deployment

Invoke both functions manually to verify they work:
- Call `reddit-monitor` and check that posts appear in the Notion "Reddit Opportunities" database
- Call `generate-copy` with body `{"city": "Bogotá", "channel": "Pinterest"}` for a single test generation, then check the Notion "Content Copy Bank" database

### Summary

| Function | Schedule | What it does |
|----------|----------|-------------|
| `reddit-monitor` | Every 2 hours | Searches Reddit for Colombia travel posts, saves to Notion, emails notification |
| `generate-copy` | Mondays 9am | Generates 15 copy variants (3 cities x 5 channels), saves to Notion |
