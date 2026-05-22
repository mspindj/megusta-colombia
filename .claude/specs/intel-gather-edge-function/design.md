# Design: intel-gather Edge Function

**Feature ID:** intel-gather-edge-function  
**Fecha:** 2026-05-21  
**Estado:** spec_ready — esperando aprobación humana

---

## Archivos a crear / modificar

| Acción | Ruta | Notas |
|--------|------|-------|
| CREATE | `docs/supabase/intel-gather/index.ts` | Deno Edge Function completa |
| NO TOCAR | `tsconfig.json` | `docs/supabase` ya está en `exclude` |

No se crean archivos adicionales. No se modifica ningún frontend.

---

## `docs/supabase/intel-gather/index.ts` — Estructura completa

### Imports y constantes

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = { ... };  // mismo patrón que otras functions
const SUPABASE_URL = "https://uocwxwvcrnkfnnoyjzyb.supabase.co";
const SUPABASE_DASHBOARD = "https://supabase.com/dashboard/project/uocwxwvcrnkfnnoyjzyb/editor";
const SUBREDDITS = ["Colombia", "bogota", "medellin", "digitalnomad"];
const APIFY_ACTOR = "trudax~reddit-scraper";
const NOTIFICATION_EMAIL = "mspin.dj@gmail.com";
```

### Tipos

```typescript
interface RedditPost {
  title: string;
  url: string;              // permalink completo (https://reddit.com/r/...)
  score: number;            // upvotes
  subreddit: string;        // nombre sin "r/"
}

interface InsertResult {
  inserted: number;
  titles: string[];         // títulos de los 5 primeros insertados
}
```

### Firma de funciones

```typescript
// REQ-02: valida los 3 secrets requeridos
// Retorna void. Lanza Error("Missing env: VAR_NAME") si falta alguno.
function validateEnv(): void

// REQ-03, REQ-04, REQ-05: llama Apify, espera hasta 120s, retorna items crudos
// actorId: "trudax~reddit-scraper"
// Lanza Error si el run no termina SUCCEEDED o si waitForFinish expira
async function runApifyActor(token: string): Promise<RedditPost[]>

// REQ-07: consulta content_ideas y retorna el Set de URLs existentes
async function getExistingUrls(serviceKey: string): Promise<Set<string>>

// REQ-06 + REQ-07 + REQ-08: filtra y hace bulk INSERT
// posts: resultados de Apify ya parseados
// existingUrls: Set para dedup rápido
// Retorna { inserted: N, titles: [...top 5] }
async function insertIdeas(
  posts: RedditPost[],
  existingUrls: Set<string>,
  serviceKey: string
): Promise<InsertResult>

// REQ-09: email de éxito con count + top 5 titles + link al dashboard
async function sendSuccessNotification(
  result: InsertResult,
  brevoKey: string
): Promise<void>

// REQ-10: email de error con el mensaje del error
async function sendErrorNotification(
  error: Error,
  brevoKey: string
): Promise<void>

// Handler principal
Deno.serve(async (req: Request) => { ... })
```

---

## Lógica de `runApifyActor`

### Input al actor

```json
{
  "startUrls": [
    { "url": "https://www.reddit.com/r/Colombia/hot/" },
    { "url": "https://www.reddit.com/r/bogota/hot/" },
    { "url": "https://www.reddit.com/r/medellin/hot/" },
    { "url": "https://www.reddit.com/r/digitalnomad/hot/" }
  ],
  "maxItems": 30,
  "maxPostCount": 30,
  "skipComments": true,
  "proxy": { "useApifyProxy": true, "apifyProxyGroups": ["RESIDENTIAL"] }
}
```

Notas del schema:
- `sort` aplica solo al campo `searches[]`, no a `startUrls`. Para `startUrls` el sort va en la URL (`/hot/`).
- `proxy` es el único campo **required** por el actor.
- `skipComments: true` evita scrapear comentarios — solo nos interesan posts.

### Endpoint con waitForFinish

```
POST https://api.apify.com/v2/acts/{actorId}/runs?waitForFinish=120
Authorization: Bearer {APIFY_TOKEN}
```

La respuesta incluye `data.defaultDatasetId`. Si `data.status !== "SUCCEEDED"` → lanzar error.

### Fetch del dataset

```
GET https://api.apify.com/v2/datasets/{datasetId}/items?clean=true&format=json
Authorization: Bearer {APIFY_TOKEN}
```

### Mapeo defensivo del item

El output del actor puede variar. Mapear así:

```typescript
{
  title: item.title ?? item.name ?? "Sin título",
  url: item.url ?? item.link ?? "",
  score: Number(item.score ?? item.upvotes ?? 0),
  subreddit: item.community ?? item.subreddit ?? extractFromUrl(item.url),
}
```

Descartar items donde `url === ""` después del mapeo.

---

## Lógica de `insertIdeas`

Pasos:
1. Filtrar `score < 10` (REQ-06)
2. Filtrar URLs ya en `existingUrls` (REQ-07)
3. Construir array de rows para INSERT:

```typescript
{
  source: "reddit",
  origin: `r/${post.subreddit}`,
  title: post.title.slice(0, 500),
  url: post.url,
  score: post.score,
  content_type: "image",
  status: "pending",
}
```

4. Si array vacío → retornar `{ inserted: 0, titles: [] }` (no hacer POST vacío)
5. POST a `{SUPABASE_URL}/rest/v1/content_ideas` con:
   - Header `Prefer: return=minimal`
   - Header `apikey: {serviceKey}`
   - Header `Authorization: Bearer {serviceKey}`

---

## Lógica de `sendSuccessNotification` (REQ-09)

**Subject:** `☕ {N} ideas nuevas para Me Gusta Colombia`

**Body (HTML):**
```
<h2>{N} ideas nuevas listas para revisar</h2>
<p>Fuente: Reddit (r/Colombia, r/bogota, r/medellin, r/digitalnomad)</p>
<h3>Top 5 títulos:</h3>
<ol>
  <li>Título 1</li>
  ...
</ol>
<p><a href="{SUPABASE_DASHBOARD}">→ Abrir dashboard de Supabase</a></p>
```

Si `result.inserted === 0`, subject: `☕ 0 ideas nuevas — nada nuevo esta semana`.

**Endpoint Brevo:**
```
POST https://api.brevo.com/v3/smtp/email
api-key: {BREVO_API_KEY}
```

---

## Lógica de `sendErrorNotification` (REQ-10)

**Subject:** `🚨 intel-gather falló — {error.message}`

**Body:** mensaje del error + timestamp UTC.

---

## Handler principal — flujo

```typescript
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    validateEnv();                                    // REQ-02
    const { APIFY_TOKEN, BREVO_API_KEY, SUPABASE_SERVICE_ROLE_KEY } = getEnvs();

    const posts = await runApifyActor(APIFY_TOKEN);   // REQ-03/04/05
    const existingUrls = await getExistingUrls(SUPABASE_SERVICE_ROLE_KEY); // REQ-07
    const result = await insertIdeas(posts, existingUrls, SUPABASE_SERVICE_ROLE_KEY); // REQ-06/08
    await sendSuccessNotification(result, BREVO_API_KEY); // REQ-09

    return new Response(
      JSON.stringify({ ok: true, inserted: result.inserted }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    try {
      const brevoKey = Deno.env.get("BREVO_API_KEY");
      if (brevoKey) await sendErrorNotification(error, brevoKey); // REQ-10
    } catch (_) { /* no lanzar desde el catch */ }

    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
```

**Excepción a REQ-02:** Si `BREVO_API_KEY` falta y el error ocurre durante `validateEnv`, el error notification nunca se envía — ese es el comportamiento aceptable (no hay cómo notificar sin la key).

---

## pg_cron — SQL para el trigger (REQ-01)

Correr una vez después del deploy en el SQL editor de Supabase:

```sql
SELECT cron.schedule(
  'intel-gather-weekly',
  '0 8 * * 1',   -- lunes 8am UTC
  $$
  SELECT net.http_post(
    url := 'https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/intel-gather',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

Verificar con: `SELECT * FROM cron.job WHERE jobname = 'intel-gather-weekly';`

---

## Supabase Secrets — configurar ANTES del deploy

| Secret | Cómo obtenerlo |
|--------|---------------|
| `APIFY_TOKEN` | Notion → Credenciales (ya existe en `~/.claude/settings.json`) |
| `BREVO_API_KEY` | Notion → Credenciales → Brevo |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → Settings → API → service_role |

Vía dashboard: `supabase.com/dashboard/project/uocwxwvcrnkfnnoyjzyb/settings/functions`

---

## Decisiones explícitas

| Decisión | Elegida | Descartada | Razón |
|----------|---------|-----------|-------|
| Estrategia de espera Apify | `waitForFinish=120` en el run POST | Polling manual con retries | Una sola request, más simple, Deno no tiene estado entre llamadas |
| Bulk insert | Un solo POST con array | INSERT por fila en loop | Menos roundtrips, `content_ideas` tiene índice en url |
| Deduplicación | Fetch previo de todas las URLs + Set.has() | ON CONFLICT DO NOTHING | Más explícito, permite loggear cuántos se saltaron |
| Subreddit en origin | `r/Colombia` (con prefijo) | Solo `Colombia` | Consistente con la convención del sistema y legible en dashboard |

---

## Pendientes antes de lanzar implementer

- [x] Confirmar que `trudax~reddit-scraper` acepta `startUrls` como array — ✅ confirmado via Apify MCP
- [ ] Deploy command: `supabase functions deploy intel-gather --no-verify-jwt`
