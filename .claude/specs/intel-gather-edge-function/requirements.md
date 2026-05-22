# Requirements: intel-gather Edge Function

**Notación EARS:** "When [condición], system must [comportamiento]"

---

## Inicialización

**REQ-01:** When pg_cron triggers intel-gather every Monday at 8am UTC, the system must invoke the Edge Function via `net.http_post` without JWT verification.

**REQ-02:** When the Edge Function starts, the system must verify that `APIFY_TOKEN`, `BREVO_API_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set; if any is missing, it must return HTTP 500 with message `"Missing env: [VAR_NAME]"` and stop execution without making external calls.

---

## Scraping

**REQ-03:** When the Edge Function runs, the system must call the Apify Reddit scraper actor against subreddits: `Colombia`, `bogota`, `medellin`, `digitalnomad` with `sort=hot` and a maximum of 30 items per subreddit.

**REQ-04:** When the Apify run is submitted, the system must wait for completion using `waitForFinish=120` (2 minutes); if the run does not finish in time, it must be treated as a failure (REQ-09).

**REQ-05:** When the Apify run completes, the system must retrieve all items from the run's dataset.

---

## Filtrado

**REQ-06:** When processing Apify results, the system must discard posts with `score < 10`.

**REQ-07:** When processing Apify results, the system must query `content_ideas` for existing URLs and discard posts whose URL already exists in the table (deduplicación por URL).

---

## Inserción

**REQ-08:** When a post passes all filters, the system must insert a row into `content_ideas` with:
- `source` = `'reddit'`
- `origin` = subreddit name prefixed with `r/` (e.g. `r/Colombia`)
- `title` = post title, truncated to 500 characters if necessary
- `url` = post permalink (full URL)
- `score` = upvote count as integer
- `content_type` = `'image'`
- `status` = `'pending'`

---

## Notificación

**REQ-09:** When all inserts complete (including when count is 0), the system must send a transactional email via Brevo to `mspin.dj@gmail.com` with:
- Subject: `☕ {N} ideas nuevas para Me Gusta Colombia`
- Body: count of new ideas, list of top 5 titles, link directo al dashboard de Supabase

**REQ-10:** When the Apify run fails, times out, or throws an unhandled error, the system must send an error notification email to `mspin.dj@gmail.com` with the error message and return HTTP 500.

---

## Criterios de validación manual

| REQ | Cómo verificar |
|-----|---------------|
| REQ-01 | `SELECT * FROM cron.job WHERE jobname = 'intel-gather-weekly'` devuelve una fila |
| REQ-02 | Llamar la función sin secrets configurados devuelve 500 + mensaje claro |
| REQ-03 | Logs de Apify muestran 4 subreddits scrapeados |
| REQ-06 | Ningún row en `content_ideas` tiene `score < 10` después de correr |
| REQ-07 | Correr la función dos veces seguidas: segunda corrida inserta 0 rows |
| REQ-08 | `SELECT * FROM content_ideas ORDER BY created_at DESC LIMIT 5` muestra rows con todos los campos correctos |
| REQ-09 | Email recibido en mspin.dj@gmail.com con count y links |
| REQ-10 | Llamar con APIFY_TOKEN inválido → email de error recibido |
