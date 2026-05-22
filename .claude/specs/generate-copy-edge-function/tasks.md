# Tasks: idea-to-queue Edge Function

**Feature ID:** generate-copy-edge-function  
**Archivo objetivo:** `docs/supabase/idea-to-queue/index.ts`

---

## TASK-01 — Scaffolding, tipos y validateEnv

**Archivo:** `docs/supabase/idea-to-queue/index.ts`  
**REQs:** REQ-03

Crear el archivo con:
- Import `jsr:@supabase/functions-js/edge-runtime.d.ts`
- Imports npm: `satori` de `npm:satori@0.11.2`, `initWasm` y `Resvg` de `npm:@resvg/resvg-wasm@2.4.1`
- Constantes: `CORS_HEADERS`, `SUPABASE_URL`, `STORAGE_BUCKET = "content"`, `PUBLISH_DAYS = [0,1,3,5]`
- Variable módulo: `let wasmReady = false` + función `ensureWasm()` que fetcha el WASM de unpkg y setea el flag
- Interfaces: `ContentIdea` y `GeneratedCopy` (con campos `caption`, `hashtags`, `hook`)
- `validateEnv()`: lanza `Error("Missing env: VAR_NAME")` si falta `ANTHROPIC_API_KEY` o `SUPABASE_SERVICE_ROLE_KEY`
- Handler skeleton `Deno.serve(...)` con OPTIONS check y try/catch vacío

Al terminar: actualizar `progress/current.md` con TASK-01 ✅.

---

## TASK-02 — `fetchIdea`

**Archivo:** `docs/supabase/idea-to-queue/index.ts`  
**REQs:** REQ-04, REQ-05

Implementar `async function fetchIdea(id, serviceKey): Promise<ContentIdea>`:

1. GET a `${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}&select=id,title,url,origin,score,generated_copy&limit=1`
2. Headers: `apikey: serviceKey`, `Authorization: Bearer serviceKey`
3. Si el array devuelto está vacío → lanzar `Error("Idea not found: " + id)`
4. Retornar `rows[0]` casteado a `ContentIdea`

Al terminar: actualizar `progress/current.md`.

---

## TASK-03 — `generateCopy`

**Archivo:** `docs/supabase/idea-to-queue/index.ts`  
**REQs:** REQ-06, REQ-07, REQ-08

Implementar `async function generateCopy(idea, anthropicKey): Promise<GeneratedCopy>`:

1. POST a `https://api.anthropic.com/v1/messages` con headers `x-api-key`, `anthropic-version: 2023-06-01`
2. Modelo: `claude-haiku-4-5-20251001`, `max_tokens: 700`
3. System prompt (copiar exacto de design.md — no parafrasear):
   ```
   You are a copywriter for Me Gusta Colombia (megusta.com.co).
   We sell tactical 72-hour survival guides for travelers visiting Colombian cities.
   Tone: direct, no-BS, insider knowledge. NOT a tourist brand.
   NEVER use: "vibrant", "bustling", "paradise", "rich culture", "hidden gem".
   Write like a local friend giving a voice note, not a brand.
   Use specific numbers and prices when available.
   Short sentences. Active voice.
   ```
4. User prompt con: título, URL, origin, score del idea — pedir JSON `{caption, hashtags, hook}` (ver design.md para prompt exacto)
5. Extraer `data.content[0].text`, parsear con `JSON.parse()`
6. Si parse falla → `Error("Haiku response not valid JSON: " + text.slice(0, 200))`
7. Truncar `caption` a 2200 chars si supera ese límite
8. Retornar `GeneratedCopy`

Al terminar: actualizar `progress/current.md`.

---

## TASK-04 — `loadFonts` y `generateImage`

**Archivo:** `docs/supabase/idea-to-queue/index.ts`  
**REQs:** REQ-09, REQ-10

Implementar `loadFonts()`:
- Fetch paralelo de Inter 700 e Inter 900 desde jsDelivr:
  - `https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff2`
  - `https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-900-normal.woff2`
- Si cualquier fetch falla → retornar array vacío (Satori usará fallback)
- Retornar array con objetos `{name: "Inter", weight: 700|900, style: "normal", data: ArrayBuffer}`

Implementar `generateImage(hook, origin, score): Promise<Uint8Array>`:
1. Llamar `await ensureWasm()`
2. Llamar `await loadFonts()`
3. Calcular `fontSize`: `hook.length > 45 ? 64 : hook.length > 30 ? 72 : 84`
4. Llamar `satori(...)` con el template JSX de design.md (estructura exacta: brand label, origin, headline, divider, CTA)
5. `new Resvg(svg, { fitTo: { mode: "width", value: 1080 } })`
6. Retornar `resvg.render().asPng()`

**Nota crítica:** Satori en Deno NO acepta JSX sintáctico. Usar la forma de objeto `{ type: "div", props: { ... } }` exactamente como está en design.md.

Al terminar: actualizar `progress/current.md`.

---

## TASK-05 — `uploadToStorage`

**Archivo:** `docs/supabase/idea-to-queue/index.ts`  
**REQs:** REQ-11, REQ-12

Implementar `async function uploadToStorage(png, fileName, serviceKey)`:

1. POST a `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/posts/${fileName}`
2. Headers: `Authorization: Bearer serviceKey`, `Content-Type: image/png`, `x-upsert: "true"`
3. Body: el `Uint8Array` del PNG directamente
4. Si `!res.ok` → `Error("Storage upload failed: " + status + " " + await res.text())`

Al terminar: actualizar `progress/current.md`.

---

## TASK-06 — `nextPublishDate`

**Archivo:** `docs/supabase/idea-to-queue/index.ts`  
**REQs:** REQ-13

Implementar `async function nextPublishDate(serviceKey): Promise<string>`:

1. GET a `${SUPABASE_URL}/rest/v1/content_queue?select=publish_date&order=publish_date.desc&limit=1`
2. Si hay fila: base = esa fecha + 1 día (usando UTC). Si vacía: base = hoy + 1 día.
3. Avanzar `base` con `setUTCDate(+1)` hasta que `getUTCDay()` esté en `PUBLISH_DAYS`
4. Retornar `base.toISOString().split("T")[0]` → `"YYYY-MM-DD"`

Al terminar: actualizar `progress/current.md`.

---

## TASK-07 — `insertToQueue` y updates de `content_ideas`

**Archivo:** `docs/supabase/idea-to-queue/index.ts`  
**REQs:** REQ-14, REQ-15, REQ-16

Implementar `insertToQueue(idea, copy, imageFile, publishDate, serviceKey)`:
- POST a `${SUPABASE_URL}/rest/v1/content_queue` con `Prefer: return=minimal`
- Body: `{ id: "reddit-" + idea.id.slice(0,12), day: 0, publish_date: publishDate, platforms: ["instagram"], type: "image", image_file: imageFile, caption: copy.caption, published: false }`
- Si `!res.ok` → lanzar error

Implementar `markIdeaProcessed(id, copy, serviceKey)`:
- PATCH a `${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}`
- Body: `{ generated_copy: copy.caption, generated_hashtags: copy.hashtags, status: "in_progress" }`

Implementar `markIdeaFailed(id, error, serviceKey)`:
- PATCH a `${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}`
- Body: `{ notes: "[ERROR " + new Date().toISOString() + "] " + error.message }`

Al terminar: actualizar `progress/current.md`.

---

## TASK-08 — Conectar handler completo

**Archivo:** `docs/supabase/idea-to-queue/index.ts`  
**REQs:** todos

Conectar todas las funciones en `Deno.serve` siguiendo el handler exacto de design.md:
1. `validateEnv()` → obtener secrets
2. Parsear `idea_id` del body → error si no viene
3. `fetchIdea()` → check idempotencia (`generated_copy !== null`)
4. `generateCopy()` → `generateImage()` → `uploadToStorage()` → `nextPublishDate()` → `insertToQueue()` → `markIdeaProcessed()`
5. Response 200 con `{ ok, publish_date, image }`
6. Catch: `markIdeaFailed()` best-effort → response 500

Verificar que el archivo compile (no hay `tsc` en Deno, pero revisar que no haya referencias rotas ni imports faltantes).

Al terminar:
- Actualizar `progress/current.md`: TASK-08 ✅, función completa
- Actualizar `progress/history.md` con entrada de sesión

---

## TASK-09 — Deploy + SQL trigger

**Archivo:** no es código TypeScript — son operaciones de deploy

1. Deploy via Supabase Management API:
   ```
   POST https://api.supabase.com/v1/projects/uocwxwvcrnkfnnoyjzyb/functions
   Authorization: Bearer $SUPABASE_ACCESS_TOKEN
   body: { slug: "idea-to-queue", name: "idea-to-queue", body: <contenido del archivo>, verify_jwt: false }
   ```

2. Ejecutar SQL del trigger via Management API:
   ```
   POST https://api.supabase.com/v1/projects/uocwxwvcrnkfnnoyjzyb/database/query
   body: { query: <SQL del trigger del design.md> }
   ```

3. Verificar trigger:
   ```sql
   SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_idea_approved';
   ```

Al terminar:
- Actualizar `feature_list.json`: status `generate-copy-edge-function` → `"done"`
- Limpiar `progress/current.md`

---

## Instrucciones para el implementer

- Leer `context/dont-do.md` y `context/voice.md` antes de empezar
- Declarar archivo antes de tocarlo: `// TOCANDO: docs/supabase/idea-to-queue/index.ts`
- Solo crear `docs/supabase/idea-to-queue/index.ts` — no tocar ningún otro archivo hasta TASK-09
- Satori requiere objetos `{type, props}`, no JSX sintáctico — NO usar `<div>` syntax
- `@resvg/resvg-wasm` necesita `await initWasm(fetch(...))` antes de `new Resvg()`
- Para el deploy (TASK-09): usar `curl` con la Management API, no el CLI de Supabase
- Actualizar `progress/current.md` después de cada task
