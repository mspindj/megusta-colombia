@AGENTS.md

# Me Gusta Colombia — Project CLAUDE.md

## Cómo hablarle a Miguel

**Tuteo colombiano. Nada de voseo argentino, nada de paisa cerrado.**

- ✅ "te lo dejo listo", "puedes verificar", "necesitas renovar el token", "mira esto", "lo pusheé al main"
- ❌ "querés", "andá", "vos tenés", "pifié", "joya", "che", "dale"
- ❌ "parcero", "qué hubo pues", "berraco", "muy bacano" (paisa, no neutro)

El usuario es de Bogotá / Colombia urbano. Tutea pero sin marcadores regionales fuertes.
Tono profesional pero directo, sin formalidad excesiva ("usted"). Vocabulario neutro
colombiano funciona: "listo", "chévere" (con moderación), "te queda funcionando", "lo dejé".

**Anglicismos técnicos OK** ("deploy", "trigger", "queue", "scope", "merge") — son del oficio.

## Stack Técnico

| Capa | Herramienta | Notas |
|------|------------|-------|
| **Frontend** | Next.js 15 App Router + shadcn/ui + Framer Motion | Repo: github.com/mspindj/megusta-colombia. Deploy via Vercel (auto en push a main) |
| **Landing** | megusta.com.co | Vercel → github.com/mspindj/megusta-colombia |
| **Email marketing** | Brevo (free tier, 300/día) | 4 emails en automation, Supabase Edge Function como proxy |
| **Payments** | Gumroad | $17/city, $37 bundle, $0 cheat sheet |
| **Backend/Infra** | Supabase (free tier) | Edge Functions + pg_cron + Storage |
| **Design** | Figma (Maito Agency Pro) | Archivo principal: WyUX7XUzmdrkjfcMI9DkSt |
| **Video** | Editor Pro Max (Remotion) | En editor-pro-max-main/ |
| **Audio** | Ableton Live 12 (MCP) + Gemini TTS | Beat custom + voiceover AI |
| **Social** | Meta Graph API | FB Page + IG @megustacomco |
| **Copy generation** | Claude API (Haiku) via Supabase Edge Function | Trigger on_idea_approved → idea-to-queue |
| **CMS/Docs** | Notion | Command Center + Copy Bank + Reddit Opportunities |

## Convenciones del Proyecto

### Frontend — Next.js workflow
- Claude Code edita directamente `src/` — push a main = deploy automático en Vercel
- Lovable ya NO se usa para este proyecto (migrado 2026-05-22)
- `colombia-intel-hub` (repo de Lovable) borrado — toda la lógica está en este repo

### PDFs — SIEMPRE mobile-first
- Formato: 390x844px (iPhone 14 Pro), NO US Letter/A4
- minHeight 844 con HUG para que el contenido no se corte
- Body text: 18px mínimo, line-height 28px
- Los usuarios leen en el celular en el aeropuerto

### Diseño — Design System
- Background: #0a0a0a, Cards: #141414
- Gold: #d4a843, Gold-dim: #b89645 (labels)
- Body text: #aaaaaa (AAA 7.6:1 contrast)
- Bogotá: #e85d4f (rojo), Medellín: #3cc878 (verde), Cartagena: #46a0d7 (azul)
- Font: Geist Sans + Geist Mono (Next.js default)
- CSS vars en `src/app/globals.css` — usar `--color-gold`, `--color-bg-dark`, etc.
- Hero overlay: `rgba(10,10,10,0.65)` — NO usar `bg-background/85` (Tailwind v4 lo resuelve como muy oscuro)

### IG Carousels — Reglas anti-penalización
- Máximo 20-30 palabras por slide
- Headlines: 64-96px (se lee en feed a 1/3 del tamaño)
- NO cards con body text — solo headlines y frases cortas
- Una idea por slide, el detalle va en el caption
- Meta penaliza imágenes text-heavy con menos alcance

### Reels — Pipeline
- Gemini TTS (voice "Orus") → Ableton (beat 90 BPM) → Remotion (video) → Supabase Storage → Meta API
- El mismo beat se reutiliza para todos los Reels
- Mapas tácticos de fondo con Ken Burns zoom + overlay 82%
- Componentes reutilizables en ReelComponents.tsx

### Publicación — Frecuencia
- 4 posts/semana: Lunes (image), Miércoles (Reel), Viernes (image), Domingo (Reel)
- NO diario — calidad > volumen. Los Reels tienen 7-14 días de alcance orgánico
- Siempre incluir megusta.com.co como CTA
- Hashtags: 10-15 por post, mix de branded + niche + city-specific

### Supabase — Edge Functions
- Proyecto: uocwxwvcrnkfnnoyjzyb
- Todas las functions sin JWT verification (públicas o llamadas por pg_cron)
- Secrets se configuran via Supabase dashboard o Management API
- Management API token en `.mcp.json` (local, en .gitignore — NO commitear)
- Edge Functions source en `docs/supabase/*/index.ts` — deploy via Management API curl

### Meta API
- FB Page ID: 1068628786330276
- IG Business Account ID: 17841480006391349
- Ad Account: act_12667938
- Meta Pixel ID: 1525809615712600 (instalado en layout.tsx)
- Secrets en Supabase: META_PAGE_TOKEN, META_USER_TOKEN, META_PIXEL_ID, META_AD_ACCOUNT_ID
- Para IG image posts: la imagen debe ser URL pública directa (no redirects)
- Para IG Reels: media_type=REELS, video debe estar procesado (esperar status FINISHED)
- IG no permite borrar posts via API

### Tono / Voz — TUITEO (no voceo)
- Ver `.claude/context/voice.md` para reglas completas
- Una idea por oración. Si entraría en 280 caracteres, está bien.
- Números específicos siempre. Sin calificativos vacíos. Sin signos de exclamación.

## Errores Conocidos a Evitar

1. **Figma layoutSizingHorizontal="FILL"**: solo se puede setear DESPUÉS de appendChild a un auto-layout frame
2. **Figma Folder names**: no pueden tener espacios ("Me Gusta Colombia" → "MeGustaColombia")
3. **Reddit API**: denegaron acceso. No insistir. Descartado. Reddit también bloquea con 403 desde IPs de cloud (Fly.io, Supabase).
4. **Pinterest API**: Trial mode = pins no públicos. Standard access requiere video demo de OAuth.
5. **Meta Graph API**: el token del Graph API Explorer es USER token. Para publicar necesitas PAGE token (obtenido via /me/accounts)
6. **Gemini TTS**: output es PCM L16 a 24kHz mono. Convertir a WAV antes de usar.
7. **Remotion**: los WAV de Ableton son 44.1kHz stereo, los de Gemini son 24kHz mono — Remotion los mezcla sin problema.
8. **Hero overlay en Tailwind v4**: `bg-background/85` resuelve muy oscuro. Usar `style={{ background: "rgba(10,10,10,0.65)" }}` directamente.
9. **Supabase secrets**: NO guardar tokens en archivos que se commitean. `.mcp.json` en .gitignore.
10. **colombia-intel-hub**: repo borrado. No intentar acceder. Todo está en megusta-colombia.
11. **Next.js Edge Runtime + @supabase/ssr**: CRASH. El middleware NO puede usar `createServerClient` de `@supabase/ssr` — Edge Runtime no soporta las APIs que usa. Usar solo `request.cookies` para verificar presencia de sesión.
12. **NEXT_PUBLIC_ vars en Vercel**: se embeben en el BUILD, no en runtime. Si se agregan después del auto-deploy, el sitio las ve como `undefined`. Solución: agregar vars → `npx vercel deploy --prod --force`.
12b. **DOS proyectos Vercel** (¡crítico!): existen `megusta-colombia` Y `megusta-com-co`. El que sirve megusta.com.co es `megusta-com-co`. Verificar SIEMPRE con `npx vercel inspect megusta.com.co` antes de tocar env vars. Para linkear al correcto: `npx vercel link --project megusta-com-co --yes`.
13. **Apify Reddit scraper** (`trudax~reddit-scraper`): trial expirado. No usar. intel-gather migrado a HN Algolia API.
14. **content_ideas source constraint**: la constraint `content_ideas_source_check` inicialmente solo permitía 'reddit', 'instagram', 'manual'. Alterada para incluir 'hackernews'.
15. **content_ideas.content_type constraint**: por defecto solo permitía 'image'/'reel'. Alterada para incluir 'carousel' (2026-05-27).
16. **Supabase Management API PATCH /functions/{slug} está ROTO** (2026-05-27): el endpoint responde "version N ACTIVE" pero el código no se actualiza → BOOT_ERROR persistente. SIEMPRE usar el MCP `deploy_edge_function` o el SDK CLI, NUNCA el endpoint PATCH directo.
17. **Satori NO soporta WOFF2** — solo TTF/OTF. Fuentes válidas: `https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Bold.ttf` (y Black). Las URLs de fontsource con `.woff2` rompen con "Unsupported OpenType signature wOF2".
18. **Supabase migró sus API keys** (2026-05-27): el `SUPABASE_SERVICE_ROLE_KEY` inyectado en Edge Functions es ahora el formato nuevo `sb_secret_*` (41 chars, NO es JWT). Storage API rechaza ese formato con "Invalid Compact JWS" — REQUIERE el JWT legacy (`eyJhbG...`). Solución: setear un secret separado con nombre `SERVICE_ROLE_JWT` (sin prefijo `SUPABASE_` porque la Management API rechaza esos nombres). REST API sí acepta ambos formatos.
19. **META_PAGE_TOKEN expira frecuentemente** — ocurrió el 2026-05-22 y de nuevo el 2026-05-29. Causa raíz: si se guarda un USER token corto (expira en 1-2h) o un USER token long-lived (~60 días) en vez de un PAGE token, el pipeline se rompe silenciosamente. **Solución permanente**: obtener un PAGE token long-lived (no expira) siguiendo el flujo de 4 pasos: (1) Graph API Explorer → Generate Access Token (User Token corto), (2) exchange por User Token long-lived vía `/oauth/access_token?grant_type=fb_exchange_token&client_id=APP_ID&client_secret=APP_SECRET&fb_exchange_token=USER_TOKEN`, (3) `/me/accounts` → tomar el `access_token` de la página Me Gusta Colombia, (4) ese PAGE token va al secret `META_PAGE_TOKEN` en Supabase. APP_ID y APP_SECRET están en Meta for Developers → app Me Gusta Colombia → Configuración básica.
20. **approveIdea NO disparaba pipeline** (descubierto y arreglado 2026-05-27): el Server Action solo hacía UPDATE. Ahora invoca `idea-to-queue` con `AbortSignal.timeout(500)` fire-and-forget. NO confiar en triggers Postgres invisibles — código explícito > magia.
21. **Meta Ads API — presupuestos en COP son en pesos directos, NO centavos**: Para cuentas USD, Meta espera el valor × 100 (centavos). Para cuentas COP, espera el valor en pesos directamente. $7 USD/día = ~30,000 COP → pasar `30000`, NO `3000000`. Pasar 2,800,000 en una cuenta COP = $666 USD/día.
22. **auto-publish Edge Function NO está conectado a la tabla content_queue**: tiene un array CONTENT_QUEUE hardcoded en el código. Para publicar la tabla real, usar `meta-publish` directamente. Reescribir auto-publish es deuda pendiente.

## Decisiones de Arquitectura

1. **Next.js en vez de Lovable**: Migrado 2026-05-22. Lovable consumía créditos en Birdie Club. Next.js + Vercel = deploy automático sin límites.
2. **Supabase en vez de n8n**: n8n cloud no tiene free tier permanente. Supabase pg_cron + Edge Functions es gratis e ilimitado para nuestro volumen.
3. **Supabase Edge Function como proxy de Brevo**: evita exponer API key en el frontend.
4. **Reddit descartado**: API denegada. Contenido se enfoca en Meta (FB + IG) + Email.
5. **Editor Pro Max para video**: Remotion renderiza localmente. No se puede automatizar el rendering en cron — se hace en batch y se sube a Storage.
6. **Gemini TTS en vez de fal.ai/ElevenLabs**: gratis con la Google API key del usuario, calidad comparable.
7. **4 posts/semana en vez de diario**: calidad > volumen. Los Reels tienen alcance orgánico de 7-14 días.
8. **Taxi calculator sin Maps API**: precios hardcodeados por ruta — más rápido, sin costo, suficiente para el MVP.
9. **intel-gather: HN Algolia API en vez de Reddit/Apify**: Reddit bloqueado, Apify trial expirado. HN Algolia (`hn.algolia.com/api/v1/search`) es gratis, sin auth, funciona desde cloud IPs. Queries: "colombia", "medellin", "bogota", "cartagena colombia", "digital nomad colombia".
10. **Dashboard auth: email/password en vez de magic link**: Supabase Free SMTP tiene rate limiting y los mails caen en spam. Email fijo `hola@megusta.com.co` hardcodeado en el form, solo se pide contraseña.
11. **Middleware simplificado**: solo verifica cookie `sb-*-auth-token`. La validación real de sesión ocurre en el Server Component (`supabase.auth.getUser()`).
12. **Vercel env vars para todas las environments**: agregar NEXT_PUBLIC_ vars solo a Production no es suficiente — también agregarlas a Preview (`npx vercel env add VAR preview "" --value "..." --yes`).
13. **Pipeline trigger en código, no en Postgres**: descubierto 27 May que el "trigger on_idea_approved" nunca existió. Decisión: el Server Action `approveIdea` dispara la function explícitamente con fetch + `AbortSignal.timeout(500)`. Razones: (a) debuggeable, (b) no requiere pg_net, (c) la function ya es idempotente.
14. **Schedule de publicación**: 4 posts/semana en días lun(1)/mié(3)/vie(5)/dom(0) UTC. Coherente con el PUBLISH_DAYS de idea-to-queue. Si se atrasa el queue, redistribuir las publish_date — NO bombardear Meta con backlog.

## Estado Actual (2 Jun 2026)

### Completado
- Landing page live en megusta.com.co (Next.js, Vercel, GitHub)
- Lead magnet funnel: form → Supabase subscribe → Brevo → 4 email sequence
- Arrival Cheat Sheet PDF (Figma, mobile-first, WCAG AA/AAA) en Gumroad $0
- 3 guías de ciudades rediseñadas en Figma (BOG 38pp, MDE 26pp, CTG 26pp)
- intel-gather Edge Function v8: pg_cron lunes 8am → HN Algolia API → content_ideas (migrado desde Apify Reddit — trial expirado)
- idea-to-queue Edge Function: trigger on_idea_approved → Haiku → imagen Satori → content_queue
- taxi-subscribe Edge Function: captura email con source=taxi-calculator + ciudad
- /taxi page: calculadora de taxis con 8 rutas, 3 ciudades, modal de captura
- Meta Pixel 1525809615712600 instalado en layout.tsx (PageView global + Lead en taxi)
- Meta Ad Account act_12667938 activo, secrets en Supabase
- Migración completa Lovable → Next.js (colombia-intel-hub borrado)
- SDD harness completo en .claude/ (agents, context, specs, feature_list)
- DESIGN.md creado en raíz — design system reference completo para agents
- Dashboard `/dashboard` live: login con contraseña → tabla content_ideas → Aprobar/Borrar ideas
  - Login: `hola@megusta.com.co` + password (email fijo, solo pedir contraseña)
  - Auth: Supabase email/password, cookie `sb-*-auth-token`, server-side getUser()
  - Server Actions: approveIdea, deleteIdea, signOut
  - Middleware simplificado (Edge Runtime, solo cookie presence check)
  - Env vars: NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel (Production + Preview)
- Notificaciones intel-gather → `hola@megusta.com.co`
- **Dashboard mejorado (27 May)**: columna "Tipo" con badge image/carousel/reel + expandable con `notes` (pillar/CTA/psicología) para dar contexto a Haiku al generar copy.
- **intel-gather v9 (27 May)**: queries TRAVEL-FOCUSED (`colombia digital nomad`, `medellin coworking`, etc.) + filtro de 18 keywords amarillistas (cartel, narco, kidnap, shakira, petro, farc, etc.).
- **idea-to-queue v11 ANDA (27 May)**: re-deployada vía MCP. Fonts cambiados a Noto Sans TTF. Secret `SERVICE_ROLE_JWT` para Storage. Prompt enriquecido con `notes` + `content_type`. Parsing tolerante (regex `\{[\s\S]*\}`).
- **approveIdea pipeline (27 May)**: ahora dispara `idea-to-queue` con `AbortSignal.timeout(500)` fire-and-forget. Antes solo hacía UPDATE.
- **22 ideas curadas en content_ideas** desde `docs/content-plan-30-days.md` (Bogotá 4, Medellín 4, Cartagena 3, General 11). Notes con pillar+CTA+psicología.
- **21 posts generados en content_queue** (27 May, batch process): Haiku copy + Satori image. Calidad excelente. Hooks tipo "Tu cara te vende en Bogotá", "Taxi 80k vs 25k: cuánto te están robando".
- **Queue redistribuido**: 21 posts schedule lun/mié/vie/dom desde 2026-05-27 hasta 2026-07-01.
- **META_PAGE_TOKEN renovado (27 May)** — el viejo había expirado el 22 May. Token nuevo funciona para IG (FB requiere scope adicional `pages_manage_posts`, deuda menor).
- **Primer post LIVE en IG (27 May)** — `idea-54c471be-a4a` "Intel de emergencia" publicado a las 12:02pm COL. ID: `18129189619592586`. Quedó en español (error mío del prompt — corregido).
- **20 posts REGENERADOS en inglés (27 May)** — descubrimos que el target son extranjeros (Gumroad USD, lead magnet EN, hashtags EN). Cambié el prompt a EN con frases español como insider vocabulary ("no dar papaya", "parce"). Hooks ejemplo: *"Your face either protects you or exposes you."* / *"Gringos pay $15 for a $3 taxi ride"* / *"Reddit's five years old. Our intel is current."*
- **auto-publish reescrita v9 (27 May)** — antes leía de array hardcoded en código. Ahora lee de tabla `content_queue` (`published=false AND publish_date<=today ORDER BY date ASC LIMIT 1`). Publica via meta-publish, marca `published=true` + `ig_post_id`. Sólo IG por ahora.
- **Cron auto-publish-rotate VIVO** — schedule `0 14 * * 1,3,5,0` (9am COL lun/mié/vie/dom). Cierra el loop end-to-end: aprobar idea → Haiku copy + Satori imagen → content_queue → auto-publish → IG.
- **idea-to-queue v13** — prompt en inglés + fix de `nextPublishDate` (MAX(lastDate, today)) + tolerancia a JSON con texto extra de Haiku.
- **content_ideas constraints arregladas** — content_type acepta 'carousel' (no solo image/reel). status acepta 'in_progress' (antes la function fallaba en silencio actualizando status).

### Jornada 2 Jun 2026 — Recovery del pipeline

- **META_PAGE_TOKEN volvió a expirar** (2026-05-29) — 3 posts no se publicaron (may 29, 31, jun 1).
- **Token renovado** en Supabase secrets por el usuario. Pipeline reactivado.
- **Post may 29 publicado manualmente** (idea-dcc1f59c, ig_id: 18132585997602491) — *"Your face is your first security system in Bogotá."*
- **Queue se auto-repara**: los posts de may 31 y jun 1 tienen publish_date pasado, serán publicados por el cron en sus próximas fires (mié 4 y vie 6 Jun).
- **Problema raíz identificado**: el token guardado en Supabase era un USER token (corta duración) en vez de un PAGE token permanente. Pendiente reemplazarlo con el flujo de 4 pasos descrito en el error #19.

### Pipeline en piloto automático
Estado al 2 Jun 2026: **11 posts publicados** (9 de abril + 2 de mayo), **19 pendientes** hasta 1 Jul.

Si algo falla, el row de `content_queue` queda con `published=false` + `error` poblado.

### Pendiente
- **⚠️ URGENTE: obtener PAGE token long-lived** (no expira) y reemplazar el actual en Supabase. Ver error #19 para el flujo completo. APP_ID y APP_SECRET en Meta for Developers → Me Gusta Colombia app.
- Renovar `META_PAGE_TOKEN` con scope `pages_manage_posts` cuando se quiera publicar también en FB (no urgente, IG es el canal principal).
- Reescribir `nextPublishDate` para que respete días libres ya ocupados sin pisarlos (hoy si ya hay un post en día X, el siguiente cae en X+1).
- Privacy policy page en megusta.com.co
- Pinterest Standard Access (requiere video demo)
- Producir guía de Cali (4ta ciudad)
- colombia-reel-template (Remotion parametrizado)
- remotion-render-server (bloqueado por reel-template)
- Cuando se acabe el queue (después de 1 Jul): aprobar más ideas desde el dashboard (intel-gather ya está corriendo semanal lunes 8am con queries travel-focused).

## Comandos Frecuentes

```bash
# Frontend
npm run dev           # Dev server local
npm run build         # Build de producción
git push origin main  # Deploy automático via Vercel

# Supabase — SQL en dashboard
# supabase.com/dashboard/project/uocwxwvcrnkfnnoyjzyb/sql/new

# Deploy Edge Function via Management API
curl -X POST "https://api.supabase.com/v1/projects/uocwxwvcrnkfnnoyjzyb/functions" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "slug": "NOMBRE", "name": "NOMBRE", "body": "...", "verify_jwt": false }'

# Editor Pro Max (Remotion)
cd editor-pro-max-main
npm run dev
npx remotion render TaxiReel out/taxi-reel.mp4 --codec h264

# Meta API - publicar en FB
curl -X POST "https://graph.facebook.com/v21.0/1068628786330276/photos" \
  --data-urlencode "url=IMG_URL" \
  --data-urlencode "caption=TEXT" \
  --data-urlencode "access_token=$META_PAGE_TOKEN"

# Meta API - publicar Reel en IG (2 pasos)
# 1. POST /17841480006391349/media (media_type=REELS, video_url=URL)
# 2. Esperar status=FINISHED
# 3. POST /17841480006391349/media_publish (creation_id=CONTAINER_ID)
```

## Credenciales
Todas en Notion: https://www.notion.so/337e9543180181c4a2ace9189e2e16fe
NO guardar credenciales en este archivo ni en archivos commiteados.

---
*Última actualización: 22 May 2026*
