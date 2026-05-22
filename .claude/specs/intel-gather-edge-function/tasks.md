# Tasks: intel-gather Edge Function

**Feature ID:** intel-gather-edge-function  
**Estado:** in_progress  
**Archivo objetivo:** `docs/supabase/intel-gather/index.ts`

---

## TASK-01 — Scaffolding del archivo

**Archivo:** `docs/supabase/intel-gather/index.ts`  
**REQs:** REQ-01, REQ-02

Crear el archivo con:
- Import `jsr:@supabase/functions-js/edge-runtime.d.ts`
- Constantes: `CORS_HEADERS`, `SUPABASE_URL`, `SUPABASE_DASHBOARD`, `SUBREDDITS`, `APIFY_ACTOR`, `NOTIFICATION_EMAIL`
- Tipos `RedditPost` e `InsertResult`
- Función `validateEnv()`: llama `Deno.env.get()` para `APIFY_TOKEN`, `BREVO_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`; si falta alguno lanza `new Error("Missing env: VAR_NAME")`
- Handler principal `Deno.serve(...)` con el skeleton: OPTIONS check, try/catch, llamadas a las funciones (stubs vacíos por ahora)

Al finalizar: actualizar `progress/current.md` con TASK-01 completada.

---

## TASK-02 — `runApifyActor`

**Archivo:** `docs/supabase/intel-gather/index.ts`  
**REQs:** REQ-03, REQ-04, REQ-05

Implementar `async function runApifyActor(token: string): Promise<RedditPost[]>`:

1. POST a `https://api.apify.com/v2/acts/trudax~reddit-scraper/runs?waitForFinish=120` con header `Authorization: Bearer {token}` y body:
```json
{
  "startUrls": [
    {"url": "https://www.reddit.com/r/Colombia/hot/"},
    {"url": "https://www.reddit.com/r/bogota/hot/"},
    {"url": "https://www.reddit.com/r/medellin/hot/"},
    {"url": "https://www.reddit.com/r/digitalnomad/hot/"}
  ],
  "maxItems": 30,
  "maxPostCount": 30,
  "skipComments": true,
  "proxy": {"useApifyProxy": true, "apifyProxyGroups": ["RESIDENTIAL"]}
}
```

2. Parsear respuesta. Si `data.status !== "SUCCEEDED"` → lanzar `Error(\`Apify run failed: \${data.status}\`)`.

3. GET al dataset: `https://api.apify.com/v2/datasets/{data.defaultDatasetId}/items?clean=true&format=json`

4. Mapear cada item defensivamente:
```typescript
{
  title: item.title ?? item.name ?? "Sin título",
  url: item.url ?? item.link ?? item.permalink ?? "",
  score: Number(item.score ?? item.upvotes ?? 0),
  subreddit: item.community ?? item.subreddit ?? "",
}
```

5. Descartar items donde `url === ""`. Retornar array de `RedditPost`.

Al finalizar: actualizar `progress/current.md` con TASK-02 completada.

---

## TASK-03 — `getExistingUrls`

**Archivo:** `docs/supabase/intel-gather/index.ts`  
**REQs:** REQ-07

Implementar `async function getExistingUrls(serviceKey: string): Promise<Set<string>>`:

1. GET a `https://uocwxwvcrnkfnnoyjzyb.supabase.co/rest/v1/content_ideas?select=url` con headers:
   - `apikey: {serviceKey}`
   - `Authorization: Bearer {serviceKey}`

2. Parsear JSON como `Array<{url: string}>`. Retornar `new Set(rows.map(r => r.url))`.

Al finalizar: actualizar `progress/current.md` con TASK-03 completada.

---

## TASK-04 — `insertIdeas`

**Archivo:** `docs/supabase/intel-gather/index.ts`  
**REQs:** REQ-06, REQ-07, REQ-08

Implementar `async function insertIdeas(posts, existingUrls, serviceKey): Promise<InsertResult>`:

1. Filtrar posts con `score < 10` (REQ-06)
2. Filtrar posts cuya `url` ya esté en `existingUrls` (REQ-07)
3. Si array vacío → retornar `{ inserted: 0, titles: [] }` sin hacer ningún fetch
4. Mapear a rows:
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
5. POST a `https://uocwxwvcrnkfnnoyjzyb.supabase.co/rest/v1/content_ideas` con:
   - Headers: `apikey`, `Authorization: Bearer`, `Content-Type: application/json`, `Prefer: return=minimal`
   - Body: JSON.stringify(rowsArray)
6. Retornar `{ inserted: rows.length, titles: rows.slice(0, 5).map(r => r.title) }`

Al finalizar: actualizar `progress/current.md` con TASK-04 completada.

---

## TASK-05 — `sendSuccessNotification` y `sendErrorNotification`

**Archivo:** `docs/supabase/intel-gather/index.ts`  
**REQs:** REQ-09, REQ-10

Implementar ambas funciones usando `POST https://api.brevo.com/v3/smtp/email` con header `api-key: {brevoKey}`.

**`sendSuccessNotification(result, brevoKey)`:**
- `to`: `[{ email: "mspin.dj@gmail.com", name: "Miguel" }]`
- `sender`: `{ email: "hello@megusta.com.co", name: "Me Gusta Colombia" }`
- Subject: `☕ ${result.inserted} ideas nuevas para Me Gusta Colombia`
  - Si `inserted === 0`: `☕ 0 ideas nuevas — nada nuevo esta semana`
- htmlContent: tabla con count + lista `<ol>` de top 5 títulos (usar `result.titles.map(...)`) + enlace al dashboard `https://supabase.com/dashboard/project/uocwxwvcrnkfnnoyjzyb/editor`

**`sendErrorNotification(error, brevoKey)`:**
- Subject: `🚨 intel-gather falló — ${error.message.slice(0, 80)}`
- htmlContent: mensaje completo del error + `new Date().toISOString()`

Al finalizar: actualizar `progress/current.md` con TASK-05 completada.

---

## TASK-06 — Completar handler y verificación final

**Archivo:** `docs/supabase/intel-gather/index.ts`  
**REQs:** todos

1. Conectar todas las funciones en `Deno.serve`:
```typescript
validateEnv();
const apifyToken = Deno.env.get("APIFY_TOKEN")!;
const brevoKey = Deno.env.get("BREVO_API_KEY")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const posts = await runApifyActor(apifyToken);
const existingUrls = await getExistingUrls(serviceKey);
const result = await insertIdeas(posts, existingUrls, serviceKey);
await sendSuccessNotification(result, brevoKey);
```

2. Asegurarse de que el catch llama `sendErrorNotification` solo si `brevoKey` está disponible, y retorna HTTP 500.

3. Revisar que el archivo completo sea TypeScript válido (sin `Deno` errors — este archivo vive en `docs/supabase/` que está excluido del tsconfig del proyecto Next.js).

4. El archivo NO tiene test unitario — la verificación es manual (ver tabla de criterios en requirements.md).

Al finalizar:
- Actualizar `progress/current.md`: feature completada, lista para deploy
- Actualizar `progress/history.md` con entrada de sesión
- Actualizar `feature_list.json`: status `intel-gather-edge-function` → `done`

---

## Instrucciones para el implementer

- Declarar cada archivo ANTES de editarlo: `// TOCANDO: docs/supabase/intel-gather/index.ts`
- NO crear archivos de test, README, ni modificar nada fuera de `docs/supabase/intel-gather/`
- NO modificar `tsconfig.json`, `feature_list.json` (excepto status al final), ni ningún otro archivo del proyecto
- NO instalar dependencias npm — Deno usa imports nativos
- Actualizar `progress/current.md` después de cada TASK completada
- Si TypeScript tiene errores en el archivo Deno, recordar que se resuelven con las anotaciones de tipo correctas para Deno (no hay `import type` de Node)
