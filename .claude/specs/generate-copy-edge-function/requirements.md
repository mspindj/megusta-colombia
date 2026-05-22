# Requirements: generate-copy-edge-function (idea-to-queue)

**Notación EARS:** "When [condición], system must [comportamiento]"  
**Scope actualizado:** copy + imagen generada automáticamente

---

## Trigger

**REQ-01:** When `content_ideas.status` is updated to `'approved'` and was previously any other value, the system must call `idea-to-queue` via `net.http_post` passing `{"idea_id": "<id>"}` in the body.

**REQ-02:** When the trigger fires but `content_ideas.generated_copy` is already non-null for that row, the Edge Function must skip all processing and return HTTP 200 con `{"skipped": true}` (idempotencia).

---

## Inicialización

**REQ-03:** When the Edge Function starts, the system must verify that `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are set; if any is missing, it must return HTTP 500 with `"Missing env: VAR_NAME"`.

---

## Lectura de la idea

**REQ-04:** When processing an `idea_id`, the system must fetch the row from `content_ideas` (campos: `id`, `title`, `url`, `origin`, `score`, `generated_copy`).

**REQ-05:** When the `idea_id` does not exist in `content_ideas`, the system must return HTTP 404 with `"Idea not found: <idea_id>"`.

---

## Generación de copy

**REQ-06:** When generating copy, the system must call `claude-haiku-4-5-20251001` with un system prompt que aplica el brand voice de Me Gusta Colombia: directo, insider, sin "vibrant"/"bustling"/"paradise", con precios específicos si los hay.

**REQ-07:** When calling Haiku, the user prompt must include: título del post, URL, subreddit de origen, y score de upvotes.

**REQ-08:** When Haiku responds, the system must parse un JSON con exactamente 3 campos:
- `caption`: texto del post IG, máx 2200 chars
- `hashtags`: 10-15 hashtags separados por espacios
- `hook`: titular de imagen, máx 8 palabras, directo y sin florituras (ej: "Airport taxi charged me $32 extra")

Si el parse falla → lanzar `Error("Haiku response not valid JSON: " + text.slice(0, 200))`.

---

## Generación de imagen

**REQ-09:** When copy is generated, the system must generate a 1080×1080 PNG using Satori (JSX → SVG) + resvg-wasm (SVG → PNG) with the following layout:
- Fondo: `#0a0a0a`
- Label brand: "ME GUSTA COLOMBIA" en `#d4a843`, letra espaciada, 18px
- Label origen: `{idea.origin} • {idea.score} upvotes` en `#b89645`, 20px
- Headline: `hook` en blanco, Inter Black, 80px (ajustar si hook > 40 chars)
- Divider: línea `#d4a843`, 120px ancho, 2px alto
- CTA: "megusta.com.co" en `#aaaaaa`, 24px

**REQ-10:** When loading fonts for Satori, the system must fetch Inter Bold (700) and Inter Black (900) from jsDelivr CDN (`cdn.jsdelivr.net/npm/@fontsource/inter`). If the font fetch fails → usar sans-serif fallback y continuar (no bloquear).

---

## Upload a Supabase Storage

**REQ-11:** When the PNG is generated, the system must upload it to Supabase Storage:
- Bucket: `content`
- Path: `posts/reddit-{idea_id}.png`
- Content-Type: `image/png`
- Si ya existe → overwrite (upsert)

**REQ-12:** When the upload succeeds, `image_file` en el INSERT a `content_queue` debe ser `"reddit-{idea_id}.png"` (solo el filename, igual que los posts existentes).

---

## Cálculo de fecha y publicación

**REQ-13:** When calculating the publish date, the system must:
1. Consultar `MAX(publish_date)` en `content_queue`
2. Si vacía: usar próximo Lun/Mié/Vie/Dom a partir de hoy
3. Calcular el siguiente slot después de esa fecha
4. Días válidos: domingo (0), lunes (1), miércoles (3), viernes (5)

**REQ-14:** When inserting into `content_queue`, the system must create una fila con:
- `id` = `"reddit-" + idea_id.slice(0, 12)`
- `day` = `0`
- `publish_date` = fecha calculada (REQ-13)
- `platforms` = `["instagram"]`
- `type` = `"image"`
- `image_file` = filename del PNG subido (REQ-12)
- `caption` = caption generado por Haiku
- `published` = `false`

**REQ-15:** When the INSERT succeeds, the system must update `content_ideas` con:
- `generated_copy` = caption
- `generated_hashtags` = hashtags
- `status` = `'in_progress'`

---

## Manejo de errores

**REQ-16:** When any step fails, the system must:
- Intentar actualizar `content_ideas.notes` con el error + timestamp (best-effort)
- Retornar HTTP 500 con `{"ok": false, "error": "mensaje"}`

---

## Criterios de validación manual

| REQ | Cómo verificar |
|-----|---------------|
| REQ-01 | Cambiar status a 'approved' en dashboard → logs muestran invocación de `idea-to-queue` |
| REQ-02 | Aprobar misma idea dos veces → solo 1 fila en content_queue |
| REQ-08 | El campo `hook` es ≤ 8 palabras y no contiene "vibrant"/"bustling" |
| REQ-09 | El PNG generado es 1080×1080, fondo negro, texto legible |
| REQ-11 | URL pública `https://uocwxwvcrnkfnnoyjzyb.supabase.co/storage/v1/object/public/content/posts/reddit-{id}.png` devuelve 200 |
| REQ-14 | `SELECT * FROM content_queue ORDER BY created_at DESC LIMIT 1` — todos los campos correctos |
| REQ-15 | La idea en content_ideas tiene `generated_copy` no-null, `status='in_progress'` |
