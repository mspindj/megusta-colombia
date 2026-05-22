# history.md — Historial de sesiones

---

## 2026-05-22 — generate-copy-edge-function (idea-to-queue) — COMPLETO

- `docs/supabase/idea-to-queue/index.ts` creado y deployado — 9 TASKs implementados
- TASK-01: scaffolding, WASM init singleton, tipos ContentIdea/GeneratedCopy, validateEnv, handler skeleton
- TASK-02: fetchIdea — GET content_ideas por id, error si no existe
- TASK-03: generateCopy — POST Anthropic claude-haiku-4-5-20251001, max_tokens 700, system prompt con voz de marca, JSON parse, truncate caption a 2200 chars
- TASK-04: loadFonts (Inter 700+900 desde jsDelivr, fallback [] si falla) + generateImage (Satori objetos {type,props}, resvg-wasm, 1080x1080 PNG)
- TASK-05: uploadToStorage — POST Supabase Storage con x-upsert:true
- TASK-06: nextPublishDate — lee última fecha de content_queue, avanza +1 día hasta PUBLISH_DAYS [0,1,3,5]
- TASK-07: insertToQueue + markIdeaProcessed + markIdeaFailed
- TASK-08: handler completo con idempotencia (generated_copy !== null check), catch best-effort markIdeaFailed
- TASK-09: Deploy via Management API → status ACTIVE. Trigger on_idea_approved en DB verificado.

---

## 2026-05-21 — intel-gather Edge Function
- `docs/supabase/intel-gather/index.ts` creado — 10 REQs implementados
- TASK-01: scaffolding, constantes, tipos, validateEnv, handler skeleton
- TASK-02: runApifyActor — POST a Apify con waitForFinish=120, fetch dataset, mapeo defensivo
- TASK-03: getExistingUrls — GET content_ideas?select=url → Set<string>
- TASK-04: insertIdeas — filtro score≥10 + dedup URL + bulk POST a Supabase REST
- TASK-05: sendSuccessNotification + sendErrorNotification via Brevo
- TASK-06: handler conectado, catch con notificación best-effort, HTTP 500 en error
- **Pendiente deploy:** `supabase functions deploy intel-gather --no-verify-jwt` + configurar 3 secrets en dashboard + SQL pg_cron

---

## 2026-05-21 — Setup inicial
- Tabla `content_ideas` creada en Supabase (inline, sin spec)
- `APIFY_TOKEN` configurado en `~/.claude/settings.json`
- SDD harness diseñado y aprobado
- SDD harness instalado: `init.sh`, `agents.md`, `feature_list.json`, `agents/`, `progress/`
