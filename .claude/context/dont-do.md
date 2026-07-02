# dont-do.md — Decisiones descartadas. No volver a proponer.

---

## Herramientas / Integraciones

- **Reddit API directa** — acceso denegado permanente. Además: bloquea con 403 desde IPs de cloud (Supabase, Fly.io). No insistir.
- **Apify Reddit scraper (trial de pago)** — trial expirado 2026-05-26. Reemplazado 2026-07-01 por el actor pay-per-result oficial de Apify (`prodiger/reddit-scraper`, $5/mes gratis).
- **Apify Reddit Scraper directo** — probado en vivo 2026-07-01: bloqueado con 403 "Blocked by Reddit network security" incluso con proxy residential (default del actor). Reddit bloquea agresivamente cualquier IP de datacenter, sea Supabase, Fly.io o Apify. No reintentar con este actor.
- **HN Algolia API para intel-gather** — migrado ahí 2026-05-27, descartado 2026-07-01: las 8 queries travel-focused sobre Colombia (nómadas, expat, etc.) dan 0 hits con filtro `points>5` en 6 meses — HN no tiene volumen de discusión para temas de nicho de viajes. Reemplazado por Apify Google Search Scraper (`apify/google-search-scraper`) con queries `site:reddit.com` — rodea el bloqueo de Reddit buscando indexación de Google en vez de scrapear directo.
- **n8n** — no tiene free tier permanente. Supabase Edge Functions cubre todo.
- **Make (Integromat)** — evaluado y descartado por complejidad vs valor.
- **Pinterest Standard Access** — trial mode = pins no públicos. Requiere video demo OAuth que no vale ahora.
- **ElevenLabs / fal.ai TTS** — descartado. Gemini TTS es gratis con la Google API key.
- **Render.com para Remotion** — bloqueado hasta que exista `colombia-reel-template`. No proponer hasta entonces.
- **Lovable** — migrado a Next.js 2026-05-22. No usar para este proyecto. `colombia-intel-hub` (repo de Lovable) borrado.

## Arquitectura

- **Hardcodear contenido en Edge Functions** — la primera versión de auto-publish lo hacía. Descartado. Todo el contenido viene de la DB (`content_queue`, `content_ideas`).
- **Supabase Management API PATCH /functions/{slug}** — ROTO. Dice "version N ACTIVE" pero el código no se actualiza → BOOT_ERROR persistente. SIEMPRE usar MCP `deploy_edge_function`.
- **Asumir que no hay triggers Postgres sin verificar en DB** — CORRECCIÓN 2026-07-01: sí existe `on_idea_approved` (AFTER UPDATE en `content_ideas`, llama `idea-to-queue` via `pg_net.http_post` cuando `status` pasa a 'approved'). La nota anterior de este archivo decía que "no existía" — estaba desactualizada o el trigger se agregó después de mayo. El Server Action `approveIdea` TAMBIÉN llama a `idea-to-queue` explícitamente — hay doble disparo, inofensivo porque la function es idempotente (chequea `generated_copy`). Siempre correr `SELECT tgname FROM pg_trigger WHERE tgrelid = 'tabla'::regclass` antes de asumir que algo "nunca existió".
- **SUPABASE_SERVICE_ROLE_KEY para Storage** — el nuevo formato `sb_secret_*` es rechazado por Storage API con "Invalid Compact JWS". Usar siempre `SERVICE_ROLE_JWT` (JWT legacy, formato `eyJhbG...`).
- **Fonts WOFF2 en Satori** — Satori NO soporta WOFF2. Usar TTF/OTF. URL válida: `https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Bold.ttf`.
- **USER_TOKEN de Meta Graph API** — se rota y expira. Siempre usar PAGE_TOKEN guardado como `META_PAGE_TOKEN` en Supabase secrets.
- **Publicar en FB con el token actual** — el scope `pages_manage_posts` no está incluido. Solo IG funciona por ahora.
- **Rotación manual de pg_cron jobs** — las functions leen de DB directamente.
- **Publicación diaria** — descartada. 4 posts/semana lun/mié/vie/dom. Calidad > volumen.
- **NEXT_PUBLIC_ vars en un solo environment de Vercel** — deben estar en Production Y Preview. Si se agregan después del auto-deploy: `npx vercel deploy --prod --force`.
- **Proyecto Vercel `megusta-colombia`** — ese NO sirve megusta.com.co. El correcto es `megusta-com-co`. Verificar con `npx vercel inspect megusta.com.co`.
- **Next.js Edge Runtime con @supabase/ssr** — crash. El middleware no puede usar `createServerClient`. Solo `request.cookies` para cookie presence check.

## Copy / Contenido

- **Copy en español en posts de IG** — el target audience son English-speaking travelers pagando USD. El copy va en inglés. El español se usa solo como "insider vocabulary" drops con contexto inmediato.
- **"Vibrant"**, **"bustling"**, **"paradise"**, **"hidden gem"**, **"breathtaking"** — palabras prohibidas en cualquier copy del producto.
- **"off the beaten path"**, **"must-see"**, **"explore"**, **"discover"** — ídem, prohibidas.
- **Copy genérico de travel brand** — somos una briefing táctica, no una agencia de viajes.
- **Emojis en copy impreso** — no van en PDFs ni en el cuerpo de las guías de ciudad.

## UI / Diseño

- **PDFs en formato carta o A4** — mobile-first: 390x844px siempre.
- **Body text menor a 18px en PDFs** — los usuarios leen en celular. Si dudan: más grande, no más pequeño.
- **`bg-background/XX` de Tailwind v4 en hero overlays** — resuelve muy oscuro. Usar `style={{ background: "rgba(10,10,10,0.65)" }}`.
