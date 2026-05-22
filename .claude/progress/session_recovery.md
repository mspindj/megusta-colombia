# session_recovery.md — Recuperación de contexto

> La próxima sesión lee este archivo ANTES que cualquier otro.

---

## Estado al 2026-05-21

### Tarea en curso
Ninguna. SDD harness recién instalado.

### Próxima tarea prioritaria
`intel-gather-edge-function` (sdd, high priority) — la cola `content_queue` está vacía desde Apr 28. Urgente retomar publicación.

### Contexto operativo clave
- `APIFY_TOKEN` configurado en `~/.claude/settings.json` como env var — **requiere reiniciar Claude Code para activarse**
- Tabla `content_ideas` creada y lista en Supabase (`uocwxwvcrnkfnnoyjzyb`)
- Make free tier registrado pero se decidió **no usar** — automatización va en Supabase Edge Functions directamente
- Render.com registrado para servidor Remotion (Fase 2, bloqueada por `colombia-reel-template`)
- `content_queue` tiene 9 posts, todos publicados. Último: Apr 28.

### Decisiones de arquitectura tomadas
1. Automatización en Supabase Edge Functions + pg_cron, no en Make ni n8n
2. Render.com para Remotion render server (opción B), no Remotion Lambda AWS (opción A)
3. GHL descartado para Me Gusta Colombia en esta etapa (es CRM, no content automation)
4. Reddit + IG como fuentes de intel: `r/Colombia`, `r/bogota`, `r/medellin`, `r/digitalnomad` + `#colombiatravel`, `#bogota`, `#medellin`, `#cartagena`

### Archivos tocados esta sesión
- `~/.claude/settings.json` — APIFY_TOKEN agregado como env var
- Supabase DB — tabla `content_ideas` creada via migración
- `.claude/` — SDD harness completo instalado
