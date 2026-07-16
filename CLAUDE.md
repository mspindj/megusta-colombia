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

### Contenido institucional — "todo es intel de calle" (regla desde 1 Jul 2026)
**Nunca acusar ni especular sobre instituciones** (policía, migración, gobierno, alcaldías).
El contenido describe lo que el visitante puede observar o necesita saber — no explica
por qué una institución actúa de cierta forma.

- ✅ Permitido: "El Hueco tiene más tráfico peatonal este año", "Transmilenio en la noche
  se siente distinto que en la mañana", "hay más gente en la calle en Laureles ahora"
  (observación neutral, verificable, sin atribuir motivo institucional)
- ❌ Prohibido: "la policía rota cada 90 días para evitar negocios paralelos", "los
  agentes cobran por dejar pasar", cualquier afirmación sobre corrupción, sobornos, o
  motivos internos de una institución — aunque venga de un hilo de Reddit o blog
- **Fuente única no alcanza.** Si una idea viene de un solo post/hilo sin verificar y
  toca a una institución, se descarta o se reescribe quitando la acusación — no se
  publica solo porque "lo dice Reddit"
- **Por qué:** riesgo legal/reputacional real si la afirmación es falsa, y no aporta al
  ángulo del producto (intel práctico para moverte en el país, no denuncia política)
- **Cómo se aplica:**
  - `intel-gather`: `BLOCKED_KEYWORDS` filtra títulos con "corrupt", "bribe", "payoff",
    "extortion", "dirty cops" antes de que lleguen a `content_ideas`
  - `idea-to-queue`: el system prompt de Haiku tiene instrucción explícita de no hacer
    afirmaciones sobre instituciones, solo observación de calle
  - Caso real: idea `24cb0db9` (Medellín 2026, afirmaba que la policía rotaba para
    evitar "negocios paralelos") se descartó del queue el 1 Jul por esta regla

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

### Jornada 6 Jun 2026 — Diagnóstico de conversión + rediseño landing

**Revisión de campaña (3 días corriendo):**
- CTR: **13.67%** (9x el objetivo de 1.5%)
- CPC: **109 COP** (~$0.026 USD, 14x más barato que el target)
- Gasto: 87,234 COP en 3 días (en presupuesto)
- LPVs: 679 landing page views reales
- Ad ganador: `MG_Ad3_NoDarPapaya` con 15.67% CTR (Meta le está dando 79% del presupuesto)
- Ad débil: `MG_Ad1_TaxiHook` — solo 253 impresiones, Meta lo está starveando solo

**Conversión: 0%** — descubierto auditando Brevo lista 3 vía API.
- Lista 3 solo tiene 4 contactos, los 4 son tests propios (3 de abr 3 + capi-test de jun 5)
- 679 LPVs reales → 0 suscriptores nuevos
- Método de audit: `GET https://api.brevo.com/v3/contacts?listId=3&limit=100&sort=desc` con API key de Notion (Credenciales page)

**Diagnóstico — el problema NO era el ad, era la landing:**
- El form de email magnet estaba en la sección **5 de 9** (enterrado)
- Tráfico frío de IG ad veía `$17` como primer CTA antes de cualquier oferta gratuita
- Mismatch crítico: el ad promete intel táctico gratis, la landing pedía $17 de entrada

**Rediseño implementado (commit 58f3d27, live en Vercel):**
1. **Form de email embebido en el hero (above the fold)** — CTA primario ahora es "GET FREE CHEAT SHEET →" con input de email. Los botones de $17/$37 se demotaron a CTA secundario debajo de un divisor "OR BUY THE FULL GUIDE", en `size="default"` con borde sutil (`border-white/30 text-white/70`).
2. **Sticky mobile bottom bar** — aparece tras scrollear 600px (reutiliza `showBackToTop` state), fixed al fondo, solo `md:hidden`. Un input + botón "FREE →" en h-10. Friction mínima.
3. **Sección `#free-intel` rediseñada** — ahora muestra mockup visual del PDF (5 bullets del contenido: airport hacks, taxi prices, sim card, safe zones, day-1 moves) + form al lado como segundo touchpoint.

**Tools utilizados en el rediseño:**
- `ui-ux-pro-max` skill → framework de patterns (Lead Magnet + Form recomendado)
- `21st-dev/magic` MCP → inspiración de hero con email capture + testimonial cards
- `notion-fetch` MCP → credenciales Brevo (vivían en Credenciales & API Keys page)

**Bug encontrado durante el build local:**
- `Cannot find module '../lightningcss.darwin-arm64.node'` — bug conocido de npm con optional deps (issue npm/cli#4828)
- Solución correcta: `rm -rf node_modules package-lock.json && npm install`
- **NO commitear** `lightningcss-darwin-arm64` como dep explícita: es darwin-only, Vercel corre linux. Debe quedar como optional dep transitiva.

**Decisión:**
- Campaña se deja corriendo todo el fin de semana con daily budget 30k COP. No tiene fecha de fin (Meta corre indefinido hasta pausar manual).
- Worst case sábado+domingo: ~60k COP más. Sigue dentro del presupuesto semanal de ~210k COP (~$50 USD).
- **Próximo checkpoint: lunes 8 Jun** — verificar si el rediseño del hero aumentó la conversión a leads.

**Métricas a observar el lunes:**
- Suscriptores nuevos en Brevo lista 3 (objetivo: ≥1% conversion rate sobre LPVs = ~7-10 leads para los ~700-1000 LPVs proyectados al lunes)
- CTR de cada ad (estable o subiendo)
- Meta CAPI events_received (debería crecer en paralelo con suscriptores)

### Jornada 8 Jun 2026 — Pivote de objetivo Meta + reframe completo del hero

**Checkpoint del lunes (5 días de campaña):**
- Gasto acumulado: 142,455 COP
- LPVs: **1,254** (de 679 del viernes)
- CTR: 15.17% (subió de 13.67%)
- CPC: 96.58 COP (bajó de 109)
- **Conversiones: sigue en 0** sobre tráfico real

**Hallazgo principal — el form NO está roto:**
- Test end-to-end con Claude Preview (simulación de submit programático): input → submit → Brevo lista 3 → ✓ en 3 segundos
- Test directo a Edge Function via curl: `{"success":true}` 200 OK, contacto llegó a Brevo
- HTML de producción confirmado vía curl: el form está desplegado
- Backend, frontend, pipeline — todos verdes

**Diagnóstico real: tráfico de baja calidad.**
- CTR de 15% en IG es 10x el benchmark normal (1-2%)
- LPV rate 84% es altísimo (normal 50-70%)
- 0% conversion sobre 1,254 LPVs es estadísticamente extremo
- Breakdown por país: uno de los 5 países alcanzó CTR de 21.84% (firma de click farms)
- Patrón clásico: `OUTCOME_TRAFFIC` le dice a Meta "encuéntrame clicks baratos" → Meta optimiza para clicks, no para humanos con intención

**Pivote ejecutado — campaña nueva con OUTCOME_LEADS:**
- Vieja pausada: `52507937855697` (MG_Traffic_ColombiaVisitors_CheatSheet_Jun26)
- Nueva activa: `52512402757497` (MG_Leads_ColombiaVisitors_CheatSheet_Jun26)
- Ad set: `52512402834097` — optimization_goal=`OFFSITE_CONVERSIONS`, promoted_object={pixel_id:1525809615712600, custom_event_type:LEAD}
- Ads: solo los 2 ganadores duplicados con sus creative IDs (`992104946537315` NoDarPapaya + `1688225042216359` FaceHook)
- Sin Audience Network, sin Advantage+ audience, edad 25-45 (subida de 23-42)

**Iteraciones de copy del hero (3 versiones en el día):**

1. **Visual fix (commit ffda830):** mapas de fondo desaturados a `filter: saturate(0.4) brightness(0.55) contrast(0.9)` + overlay 0.78. El form dorado domina ahora.

2. **CRO quick wins (commit 7615877):** aplicado framework `page-cro`. Score inicial 67/100 = "Low Readiness". Cambios: headline localiza ("Colombia" en H1), CTA "GET FREE CHEAT SHEET" → "GET THE INTEL", mini PDF preview inline en el hero, `$17/$37` eliminados del hero, sub con specificity ("taxi prices, SIM card spots, scam patterns, safe zones"), background rotation pausa con `onFocus` en el input.

3. **Reframe insider/status (commit e4f7048):** descartado el frame amarillista "Don't get scammed your first 72 hours in Colombia" — pintaba Colombia como peligro. Reemplazo:
   - H1: **"Walk into Colombia like a local."**
   - Sub: "Real taxi rates, where to get a SIM in 5 minutes, which neighborhoods locals actually live in — everything the guidebooks miss. Free 72-hour briefing."
   - CTA: **"SKIP THE LEARNING CURVE →"**
   - Microcopy: "Real safe zones" → "Local neighborhoods" (consistencia con frame no-defensivo)

**Decisiones sobre A/B testing:**
- **NO se corre A/B test todavía.** A volumen actual (~180 LPVs/día) y conversion target 2-5%, capturamos 3-9 conversiones/día. Para detectar mejora >20% con 95% confianza → ~400-500 conversiones por variante = 5-6 meses por test. Inviable.
- **Sequential testing en su lugar:**
  - Semana 1 (8-14 Jun): Combo 2 ("Walk into Colombia like a local")
  - Semana 2 (15-21 Jun): Combo 4 ("Walk into Colombia like a local" + "Taxi prices that don't change when you say amigo") — más punchy, social-shareable
  - Semana 3 (22-28 Jun): el ganador con presupuesto subido
  - A/B test real solo cuando alcancemos 50+ conversiones/semana en una variante

**Aprendizajes del día:**

1. **0 leads sobre 1,254 LPVs NO significa form roto.** Significa que Meta optimizó para click farms. Verificar siempre el form end-to-end antes de asumir backend.
2. **Frame amarillista penaliza la marca, no solo el CTR.** "Don't get scammed in Colombia" pintaba el país como peligroso — narrativa post-Narcos que la generación ya combate. Frame insider/status ("walk in like a local") vende lo mismo sin defensa.
3. **`OUTCOME_TRAFFIC` es trampa en Meta.** Le pides clicks baratos, te los entrega — sin importar si son humanos con intención. `OUTCOME_LEADS` con Pixel + CAPI configurado es el camino correcto desde el día 1.
4. **CTR sospechosamente alto + LPV rate alto + 0 conversiones = firma de click farms.** Tres anomalías juntas, no atribuible a casualidad.
5. **`safe zones` en microcopy es un olor sutil.** Aunque positivo en superficie, mantiene el frame defensivo. Mejor "local neighborhoods" — sello status, no protección.

**Estado al cierre del 8 Jun:**
- Campaña Leads activa, learning phase iniciada
- Landing con reframe completo en producción (commit `e4f7048`)
- Brevo lista 3: 6 contactos (4 históricos + 2 de mis tests del día)
- Próximo checkpoint: **miércoles 10 Jun (48 horas)** — Brevo lista 3, CTR de la nueva campaña, primeros datos de cost-per-lead

### Errores conocidos a evitar (nuevo)

23. **Frame amarillista en copy.** Nunca usar "Don't get scammed", "evita robos", "peligros de [país]" en H1/CTAs principales. Vende status/competencia ("like a local", "ahead of the curve"), no protección. El miedo CTR-iza pero quema marca y atrae cohort de baja calidad.

24. **`OUTCOME_TRAFFIC` para lead magnets.** Meta optimiza por clicks baratos, no por humanos con intent. Síntoma: CTR 10x normal + 0 conversiones. Siempre arrancar campañas de lead magnet con `OUTCOME_LEADS` y Pixel event configurado, NUNCA con `OUTCOME_TRAFFIC`.

25. **A/B testing prematuro con bajo volumen.** Si capturás menos de 50 conversiones/semana por variante, los resultados son ruido estadístico. Sequential testing semana-a-semana es más honesto. A/B test real solo con volumen alto (>50 conv/sem/variante).

26. **0 conversiones ≠ form roto.** Antes de tocar código del frontend o backend, verificar end-to-end via curl o preview eval. La causa raíz frecuentemente está upstream (tráfico, oferta) o estructural (hero no above-the-fold).

### Jornada 19 Jun 2026 — Video ad + diagnóstico funnel email

**Meta campaña (Jun 8-19):**
- 26 leads reales Brevo (semana Combo 4: 16 leads en 5 días = 3.2/día, mejor semana)
- CPL ~$1.93 USD (Brevo), bien bajo target $3
- FaceHook ad pausado (bajo rendimiento, Meta lo había starveado)
- IntelAdReel (video) creado y subido como segundo ad activo

**Video ad creado:**
- `editor-pro-max-main/src/compositions/IntelAdReel.tsx` — 15s, 450 frames @30fps
- TTS generado con `scripts/generate-tts.py` (Gemini, voz Orus) → `intel-ad-voice.wav`
- Renderizado: `editor-pro-max-main/out/intel-ad-reel.mp4` (9.5 MB)
- Subido a Meta Ad Account, activo como `MG_LeadOpt_IntelAdReel_TaxiPrices`

**Diagnóstico Brevo email automation:**
- Confirmado vía `leads/logs-export.csv` (CSV exportado desde Brevo UI): automation SÍ funciona
- Email 1: 20 enviados, Email 2: 19, Email 3: 8, Email 4: 4
- Los 3 leads más antiguos (unchartedcurry, ryan.burdon, li.gayle) en step 10, esperando Email 5

### Jornada 25 Jun 2026 — Diagnóstico campaña + refuerzo funnel email

**Estado campaña Jun 8-25:**
- Spend total: 514,221 COP (~$125 USD)
- Leads Brevo reales: **34** (Jun 8-14: 9 | Jun 15-21: 18 | Jun 22-25: 5)
- NoDarPapaya: 48 leads Meta, CPL $1.90 USD, CTR 17.5% — winner absoluto
- IntelAdReel: 5 leads Meta, CPL $6.65 USD, CTR 2.76% — PAUSADO hoy

**Acciones ejecutadas:**
1. **IntelAdReel pausado** (ID: 52522978785297) — CPL 3.5x peor que NoDarPapaya, comía 27% del presupuesto
2. **PS de venta agregados a templates Brevo 10, 11, 12** — soft close al final de cada email de contenido
3. **2 nuevos templates creados en Brevo:**
   - ID 24: "Lead Magnet — 9. Follow Up D10" — subject "Meant to follow up" (Day 10)
   - ID 25: "Lead Magnet — 10. Final Pitch D21" — subject "Last one on this" (Day 21)
4. User agregó ambos templates a Automation #1 en Brevo

**Diagnóstico 0 ventas Gumroad:**
- Un solo pitch (Email 4, Day 8) en toda la secuencia era el problema estructural
- El funnel entregaba valor sin cerrar venta en emails 10-21
- Solución aplicada: PS en 3 emails de contenido + 2 emails nuevos con pitch explícito

**Funnel actual (10 emails, 4 momentos de venta):**
```
Día 0  → Cheat sheet (template 1)
Día 2  → Taxi intel (template 2)
Día 5  → Ciudad (template 3)
Día 8  → PITCH 1 (template 4)
Día 10 → PITCH 2 follow-up (template 24) ← nuevo
Día 12 → Laureles + PS venta (template 10) ← reforzado
Día 16 → SIM card + PS venta (template 11) ← reforzado
Día 19 → Budget + PS venta (template 12) ← reforzado
Día 21 → PITCH 3 final (template 25) ← nuevo
Día 23 → "Where are you going?" (template 13)
```

**Errores encontrados:**
- `IntelAdReel` (video) tuvo CTR 2.76% vs 17.5% del estático — el formato video no detiene el scroll en IG para esta audiencia
- Video ad generó 356 video views pero muy pocos clicks — engagement ≠ intent en este contexto

## Estado Actual (1 Jul 2026)

### Completado
- **Cuenta Meta reactivada (1 Jul)**: estaba en `UNSETTLED` desde ~26 Jun, medio de pago nuevo agregado.
- **intel-gather migrado a Apify Google Search Scraper (1 Jul)**: HN Algolia sin volumen. v17 deployada, 98 ideas nuevas en primera corrida.
- **Regla "todo es intel de calle" (1 Jul)**: nunca acusar instituciones sin verificar. Aplicada en intel-gather, idea-to-queue y CLAUDE.md.
- **Julio completo en content_queue (1 Jul)**: 17 posts, 3-31 jul, todos revisados con /humanizalo.
- **Copy review workflow con Juan Camilo (1 Jul)**: Google Doc compartido, esperando feedback.
- **Funnel email reforzado (25 Jun)**: PS de venta en emails 10/11/12 + 2 nuevos emails (Day 10 follow-up, Day 21 pitch final). 10 emails, 4 momentos de venta.
- **IntelAdReel video ad pausado (25 Jun)**: CPL $6.65 vs $1.90 NoDarPapaya. Presupuesto 100% a NoDarPapaya.
- **34 leads reales en Brevo lista 3** (al 25 Jun). Automation activa y funcionando correctamente.
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

### Jornada 3 Jun 2026 — Meta Ads primera campaña + fixes

**Meta Pixel Lead tracking arreglado:**
- `fbq('track', 'Lead', {content_name: 'Colombia Cheat Sheet'})` agregado al success callback de `handleLeadSubmit` en `page.tsx`. Antes solo disparaba en el taxi calculator.

**META_PAGE_TOKEN — token permanente obtenido:**
- Flujo de 4 pasos completado (User Token corto → long-lived → /me/accounts → Page Token permanente).
- Token permanente en Supabase. No expira salvo cambio de contraseña FB o revocación de permisos.

**Meta App publicada en modo Live:**
- La app estaba en Development mode — impedía crear ads.
- Creadas páginas legales: `/privacy`, `/terms`, `/data-deletion` (requeridas por Meta para publicar).
- App publicada en developers.facebook.com.

**Meta Ads MCP configurado:**
- `.mcp.json` con `meta-ads-mcp` + personal user token de Miguel (long-lived ~60 días).
- El ad account `act_12667938` vive en la cuenta personal de Miguel, NO en el Business Portfolio "Me Gusta". Por eso el system user token del Business Manager no lo veía.
- Pendiente: transferir el ad account al Business Portfolio para usar system user token permanente.

**Primera campaña Meta Ads ACTIVA (3 Jun 2026):**
- Campaign: `MG_Traffic_ColombiaVisitors_CheatSheet_Jun26` (ID: `52507937855697`)
- Ad Set: `IG_Travelers_EN_Broad_Jun26` (ID: `52507942363297`) — US/CA/GB/AU/DE, edad 23-42, solo Instagram, Advantage+ audience off
- Presupuesto: **30,000 COP/día (~$7 USD)** = ~$50 USD/semana
- Objetivo: OUTCOME_TRAFFIC → LINK_CLICKS → megusta.com.co
- 3 ads con imágenes del content_queue (Supabase Storage):
  - `MG_Ad1_TaxiHook` (ID: 52508006309097) — "Gringos pay $40. Locals pay $8."
  - `MG_Ad2_FaceHook` (ID: 52508006337497) — "Your face is your first security system."
  - `MG_Ad3_NoDarPapaya` (ID: 52508006359697) — "No dar papaya. Don't make yourself a target."
- Revisar resultados el jueves 6 Jun: CTR objetivo >1.5%, CPC objetivo <1,500 COP

**Errores encontrados y aprendizajes:**
- `targeting_optimization` fue eliminado por Meta → no incluir en targeting spec
- Con CBO activo en campaña, el ad set NO puede tener budget propio
- Meta no acepta `image_url` en `link_data` → hay que subir imagen primero a `/adimages` y usar el hash
- Imágenes se suben como multipart binary (`-F file=@path`), no como URL
- COP usa pesos directos en la API (no centavos) — ver error #21

### Jornada 2 Jun 2026 — Recovery del pipeline

- **META_PAGE_TOKEN volvió a expirar** (2026-05-29) — 3 posts no se publicaron (may 29, 31, jun 1).
- **Token renovado** en Supabase secrets por el usuario. Pipeline reactivado.
- **Post may 29 publicado manualmente** (idea-dcc1f59c, ig_id: 18132585997602491) — *"Your face is your first security system in Bogotá."*
- **Queue se auto-repara**: los posts de may 31 y jun 1 tienen publish_date pasado, serán publicados por el cron en sus próximas fires (mié 4 y vie 6 Jun).
- **Problema raíz identificado**: el token guardado en Supabase era un USER token (corta duración) en vez de un PAGE token permanente. Pendiente reemplazarlo con el flujo de 4 pasos descrito en el error #19.

### Pipeline en piloto automático
Estado al 2 Jun 2026: **11 posts publicados** (9 de abril + 2 de mayo), **19 pendientes** hasta 1 Jul.

Si algo falla, el row de `content_queue` queda con `published=false` + `error` poblado.

### Jornada 5 Jun 2026 — CAPI + activación ads

**Ads activados:**
- Los 3 ads estaban PAUSED (creados así intencionalmente para revisión). Activados vía API. Pasaron a estado "Processing" → "Active" en Ads Manager.

**Meta CAPI implementado (subscribe Edge Function v22):**
- SHA-256 del email vía Web Crypto API nativa de Deno (sin dependencias)
- Fire-and-forget después de Brevo exitoso (no bloquea el response)
- Secret `META_CAPI_ACCESS_TOKEN` en Supabase (token personal long-lived de Miguel)
- Source URL tomada del header `Referer` automáticamente
- Solo para suscriptores nuevos (no duplicados)
- Testeado end-to-end: `events_received: 1` confirmado en Meta Events Manager

**Brevo IP restriction desactivada:**
- Brevo bloqueaba IPs dinámicas de Supabase Edge Functions
- Solución: deshabilitar "Blocking unauthorized IP addresses" para API keys en Brevo → Security
- La API key ya provee autenticación suficiente

**Pipeline completo al 5 Jun:**
```
Form submit → subscribe v22
  ├── Brevo → lista 3
  └── Meta CAPI → Lead event (email SHA-256, fire-and-forget)
```

### Jornada 3 Jul 2026 (tarde) — Diagnóstico funnel: 0 ventas Gumroad pese a leads

**Miguel reportó leads llegando pero 0 compras en Gumroad.** Diagnóstico con datos reales de Brevo API (`/v3/smtp/statistics/events`), no asunciones:

- 50 leads en lista 3 (16 nuevos desde el 25 Jun, coherente con Meta: 16 leads del 1-3 Jul post-reactivación de cuenta, CPL ~$1.85 USD)
- Deliverability y opens normales (25-60% open rate según el email)
- **En los 4 emails de venta (día 8, 10, 19, 21) combinados: 53 entregados, 1 solo click en 4 semanas** — y ese click fue a la landing page, no a Gumroad. Cero clicks confirmados llegando a Gumroad desde cualquier pitch.

**Causa raíz encontrada revisando el HTML real de los templates (Brevo API, no la UI):** en los emails de día 8, 10 y 21, el botón dorado PRINCIPAL (el más visible, `background-color:#d4a843`, texto "Get Your City's Guide — $17" / "Get the guide — $17") apuntaba a `megusta.com.co/#cities` (la landing page) en vez de a Gumroad directo. Solo el botón secundario (outline, menos visible) iba a Gumroad — y ni siquiera al producto específico, solo al storefront genérico en vez de `/l/explorer-bundle`. Estábamos mandando a la gente con mayor intención de compra de vuelta a la landing, agregando fricción justo en el peor momento. El template de día 19 ("What a week actually costs") no tenía este bug — su botón principal ya iba directo a Gumroad.

**Fix identificado y enviado a Miguel para aplicar manualmente** (ver limitación de API abajo): swap de destinos en los 3 templates —
- Botón principal "$17" → `https://megustacomco.gumroad.com` (storefront, antes iba a la landing)
- Botón secundario "$37 bundle" → `https://megustacomco.gumroad.com/l/explorer-bundle` (producto específico, antes iba al storefront genérico)

**Bono — mismo hallazgo de framing amarillista que ya se había corregido en el hero (8 Jun, regla #23):** el copy del template de día 8 abre con "It's midnight... someone's grabbing your bag" — el mismo frame de miedo/scam que se descartó para la landing. Pendiente de reescribir con el frame insider/status, no se tocó esta jornada (prioridad fue el bug de routing).

**Links reales de Gumroad** (extraídos de `src/`, útiles para cualquier corrección futura de copy/emails):
- `https://megustacomco.gumroad.com/l/bogota72hours` ($17)
- `https://megustacomco.gumroad.com/l/medellin-survival-vault` ($17)
- `https://megustacomco.gumroad.com/l/cartagena-survival-vault` ($17)
- `https://megustacomco.gumroad.com/l/explorer-bundle` ($37, las 3 ciudades)
- `https://megustacomco.gumroad.com/l/colombia-arrival-cheat-sheet` ($0, lead magnet)

### Jornada 3 Jul 2026 — Copy review de Juan Camilo aplicado

**Juan Camilo revisó los 17 posts en el Google Doc.** Se compararon sus 17 posts pegados contra el estado real de `content_queue`/`content_ideas` y se aplicaron 11 correcciones reales (typos, gramática, 2 sets de hashtags reescritos, 3 CTAs `megusta.com.co` que faltaban):

- Post 1 (aecd38b2): "Rappi guy" → "delivery guy"
- Post 2 (00cf27d5): "instant" → "instantly"
- Post 3 (897a6de1): coma agregada ("7pm, in the other")
- Post 5 (20b775b8): hashtags reescritos (10 tags nuevos, quitó #CartagenaBocagrande/#ColombiaReal, agregó #IslasDelRosario/#TravelTips/#BudgetTravel)
- Post 6 (01488d45): CTA `megusta.com.co` agregado (faltaba en `content_queue` Y `content_ideas` — el fix de la jornada anterior no había tomado en este post)
- Post 7 (dbb4351f): "ATM in El Centro" → "at El Centro"; "Cartagena operates" → "operate" (concordancia)
- Post 11 (081e9817): "That's papaya" → "That's dar papaya"; arregló una cláusula rota ("aren't paranoid... because they're paranoid" → tautología sin sentido, corregido a "aren't paranoid about crime. They're aware...")
- Post 13 (83c2838c): "Santa Marta if you want beach" → "a beach"
- Post 14 (a16441bc): "working remote" → "remotely"; CTA `megusta.com.co` agregado en `content_queue` (content_ideas ya lo tenía)
- Post 16 (f962b4aa): "cable car is 2,850" → "cable car up is 2,850"; CTA `megusta.com.co` agregado en `content_queue`
- Post 17 (5d3e89e0): hashtags reescritos (agregó #ColombianSlang/#COLtravel/#ColombiaLife/#BogotaExpat, quitó #BogotaCafe/#BogotaTravel/#ColombiaLanguage)

**Hallazgo — bug del fix de CTA de la jornada anterior:** los posts 14 y 16 tenían el CTA agregado en `content_ideas.generated_copy` pero NO en `content_queue.caption` (la tabla que realmente publica el cron). El post 6 no tenía el CTA en ninguna de las dos tablas. Conclusión: cuando se corrige copy post-generación, **hay que verificar `content_queue` explícitamente**, no asumir que se propagó desde `content_ideas`.

**Sin aplicar — necesita tu confirmación:** en el texto que pegaste, 7 de los 17 posts (07-13, 07-15, 07-17, 07-19, 07-20, 07-24, 07-27) aparecen SIN hashtags al final, mientras que en 3 de ellos (07-15, 07-17, 07-19) tampoco hay ningún otro cambio de copy. Esto no tiene el patrón de una edición real de Juan Camilo (él sí reescribió hashtags completos en los posts 5 y 17, no los borró en seco) — parece más un artefacto de copiar/pegar desde el Google Doc. **Dejé los hashtags existentes intactos en esos 7 posts** en vez de borrarlos, para no perder alcance por un posible error de pegado. Confírmame con Juan Camilo si de verdad quiere quitar hashtags de esos posts específicos antes de que yo los toque.

### Jornada 7 Jul 2026 — Prototipo de footage real para Reels (reemplazo parcial del mapa vectorial)

**Motivo:** el enfoque 100% mapa vectorial + Ken Burns estaba quedando monótono. Investigación + prototipo para mezclar footage real royalty-free de las 3 ciudades.

**Fuente elegida: Pexels.** Gratis, licencia permite uso comercial sin atribución (solo prohíbe revender el clip sin modificar o implicar que una persona en el video endorsa el producto), API con filtro `orientation=portrait` nativo para vertical. Pixabay queda como respaldo secundario (no verificado su filtro de orientación).

**Truco sin API key (funciona, pero es manual):** `https://www.pexels.com/download/video/{id}/` redirige 302 directo al mp4 real en `videos.pexels.com` sin necesidad de auth. Usado para armar la librería inicial mientras Miguel genera una API key real en pexels.com/api (pendiente, ver abajo).

**Librería curada en `editor-pro-max-main/public/assets/megusta/footage/`** (14 clips, ~191MB total tras normalizar — original bajado pesaba 949MB, algunos clips traían bitrate absurdo como 139 Mbps en 4K):
- Bogotá: `bogota-drone.mp4` (aérea con niebla), `bogota-carrera7.mp4`, `bogota-plaza-bolivar.mp4`, `bogota-ciclovia.mp4` (gente en bici, domingo), `bogota-centro-cenital.mp4`
- Medellín: `medellin-cablecar.mp4`, `medellin-comuna13.mp4` (graffiti, colorido), `medellin-sabaneta.mp4`, `medellin-itagui.mp4`
- Cartagena: `cartagena-street.mp4` (vertical nativo, la mejor calidad de las 3 ciudades), `cartagena-san-diego.mp4`, `cartagena-street-life.mp4`, `cartagena-tuktuk-plaza.mp4`, `cartagena-plaza-restaurant.mp4`

**Normalización aplicada a todos los clips:** `ffmpeg -vf scale=... -an -c:v libx264 -crf 23` — máximo 1920px en el lado largo (no hace falta 4K para un output de 1080x1920), sin audio (se silencia igual en el componente), faststart. Reduce el peso 5-10x sin pérdida visible tras el grading oscuro.

**Componente nuevo: `CityFootageBackground`** en `editor-pro-max-main/src/compositions/ReelComponents.tsx` (junto a `MapBackground`). Mismo tratamiento visual que ya usa la landing (`saturate(0.4) brightness(0.55) contrast(0.9)` + overlay oscuro, default 0.78) para que el corte entre mapa vectorial y footage real no se sienta como un salto de estilo. Prop `overlayOpacity` ajustable por escena.

**Composición de prueba: `FootageTest.tsx`** (registrada en Root.tsx, NO toca ningún Reel en producción) — 7 escenas mezclando mapa + footage de las 3 ciudades + CTA. Render de prueba en `out/footage-test.mp4`. Veredicto visual: funciona bien, especialmente Bogotá (drone con niebla) y Cartagena (vertical nativo). Único defecto encontrado: `medellin-cablecar.mp4` tiene un cable cruzando el cuadro en algunos frames — recortar a otro momento del clip antes de usarlo en producción.

**Decisiones de Miguel para producción:**
1. Footage real como base visual; el mapa vectorial se reserva para momentos donde aporta información real (rutas de taxi, comparación de barrios) — no reemplazo total.
2. Miguel generó una API key gratis de Pexels (`pexels.com/api`) — guardada en Notion (Credenciales & API Keys, sección propia de Miguel al final de la página). Verificada con una query real contra `api.pexels.com/v1/videos/search`, funciona.
3. Ampliar la librería ahora (ya hecho arriba, 14 clips) en vez de esperar con solo 3.

**Ajuste de grading (mismo día):** el overlay oscuro inicial (0.78, calcado de `MapBackground`) tapaba demasiado el footage real — Miguel lo señaló al ver el render. Bajado a `overlayOpacity=0.5` por defecto (0.6 en escenas de CTA) y aflojado el filtro CSS de `saturate(0.4) brightness(0.55) contrast(0.9)` a `saturate(0.55) brightness(0.85) contrast(1.0)`. El mapa vectorial (`MapBackground`) no se tocó — sigue con su grading original, solo aplica a `CityFootageBackground`.

### Jornada 7 Jul 2026 — Primer anuncio de video en producción (NoDarPapayaVideoAd)

**Contexto:** Miguel preguntó si valía la pena rotar el creativo actual (`MG_Ad3_NoDarPapaya`, activo desde el 8 jun, ~29 días). Diagnóstico con datos reales de Meta antes de recomendar nada:
- CTR semana 1 (8-14 jun): 16.3% → semana 2 (15-24 jun): **18.75%** — subiendo, no bajando. Cero señal de fatiga.
- Frecuencia se mantuvo baja todo el periodo (~1.1-1.5) — Meta seguía encontrando audiencia nueva, no repitiendo a los mismos usuarios.
- El único hueco real es 25-30 jun (cero delivery), que coincide exactamente con la suspensión de cuenta por pago pendiente.
- El salto de CPL visto 4-7 jul (~$3.01 vs ~$1.85 anterior) es consistente con el patrón típico de Meta post-reactivación (el algoritmo pierde señal de optimización tras una interrupción de pago) — no con fatiga de creativo.
- **Conclusión: no reemplazar NoDarPapaya** (sigue siendo el único ganador comprobado), pero sí agregar una **segunda variante en paralelo** ya que llevaba 29 días sin ninguna pieza corriendo junto a ella para comparar — buena práctica de Meta tener 2-3 ads activos por ad set.

**Pieza producida: `NoDarPapayaVideoAd.tsx`** — versión en video del MISMO copy ganador de la imagen estática (`MG_Ad3_NoDarPapaya`: "No dar papaya. Don't make yourself a target... Phone out at night, counting cash in public, expensive watch visible — all dar papaya. Free guide: what to avoid in Bogotá, Medellín, and Cartagena"), NO un mensaje nuevo. La única variable que cambia es el formato (video vs. imagen estática) y el fondo (footage real de las 3 ciudades vs. sin imagen real) — aísla la variable a probar en vez de repetir el error del viejo `IntelAdReel` (que cambiaba mensaje Y formato a la vez, y perdió con CPL $6.65 vs $1.90).

- 17s / 510 frames @ 30fps, voz sola (sin beat, mismo estilo que `IntelAdReel`)
- Voiceover generado con Gemini TTS (`scripts/generate-tts.py`, voz Orus) → `voice-nodarpapaya-v2.wav`
- 4 escenas: hook (Bogotá drone) → lista de "dar papaya" (Cartagena calle) → oferta (Medellín Comuna 13) → CTA (Bogotá drone, overlay más oscuro para legibilidad del botón)
- Render final en `editor-pro-max-main/out/nodarpapaya-video-ad.mp4`

**Publicado en Meta (7 Jul, con aprobación explícita de Miguel):**
- Video subido a la cuenta vía `/act_12667938/advideos` → `video_id: 1158614787339867`
- Creative creado vía Graph API directo (el MCP `create_ad_creative` dio "Invalid parameter" — construir el `object_story_spec.video_data` a mano funcionó, mismo patrón que ya se documentó para imágenes: el MCP no siempre alcanza, Graph API directo sí) → `creative_id: 1285003180151302`
- Ad creado en el ad set `52512402834097` (mismo de NoDarPapaya) → `MG_LeadOpt_NoDarPapayaVideo`, id `52537448401297`, activado
- Ahora corren 2 variantes en paralelo en el mismo ad set: `MG_LeadOpt_NoDarPapaya` (imagen, ganador histórico) y `MG_LeadOpt_NoDarPapayaVideo` (video, footage real)

### Jornada 9 Jul 2026 — Pinterest rechazado + fix de leads duplicados

**Pinterest: acceso Trial de la app existente (App ID 1558821) rechazado.** Diagnóstico:
- El acceso Trial en sí requiere aprobación con demo (no es automático como decía la documentación previa) — mismo criterio que Standard: mostrar flujo OAuth completo + integración real, no wireframes.
- La app rechazada quedó bloqueada: sin App Secret disponible, sin reenvío posible ("hay que crear la solicitud" — confirmado por Miguel). Hasta el token de solo-lectura ("Generar token") devolvió error `"Your application consumer type is not supported"` — bloqueo total, no solo de escritura.
- Causa más probable: nunca se completó/grabó un flujo OAuth real antes de la solicitud original — el campo Redirect URI estaba vacío, lo cual hace imposible que existiera un demo real.
- **Decisión de Miguel: crear app nueva y reintentar**, esta vez en el orden correcto — configurar Redirect URI primero, hacer el flujo OAuth real, grabarlo, y recién ahí enviar la solicitud. Quedó pendiente que Miguel cree la app y comparta el nuevo App ID/Secret para retomar.
- Nota de costo-beneficio planteada: Pinterest es canal secundario con proceso de aprobación documentado como opaco (rechazos repetidos sin motivo en la comunidad de developers, incluso con apps nuevas bien configuradas) — Meta+IG sigue siendo el canal probado.

**Bug real encontrado y corregido: leads duplicados en el correo de notificación.** Miguel reportó que los correos de "Nuevo lead" llegaban dos veces. Diagnóstico con datos reales de Brevo (`campaign_analytics_get_email_event_report`), no asunción:
- De ~19 leads en los últimos 14 días, solo 2 tenían notificación duplicada (`Mastainferno89@gmail.com` con 12s de diferencia, `campbellmatt772@gmail.com` con 14min) — no es un bug sistemático que duplique TODO, es intermitente.
- Causa raíz en `docs/supabase/subscribe/index.ts`: el código detectaba "ya suscrito" chequeando si Brevo devolvía el código de error `duplicate_parameter` en el POST a `/v3/contacts`. Pero el request usa `updateEnabled: true` — y con ese flag, Brevo NUNCA devuelve `duplicate_parameter` para un contacto existente, hace merge/update y devuelve éxito (201) igual que si fuera nuevo. Esa rama de detección de duplicados era código muerto desde que se escribió.
- Efecto real: cualquier visitante que se suscribe dos veces (ej. llena el form del hero, después el de la sticky bar sin darse cuenta que ya se había registrado) dispara una segunda notificación Y un segundo evento Lead de Meta CAPI — contaminando también el conteo de Leads que ve Meta Ads Manager con conversiones repetidas del mismo contacto.
- **Fix aplicado (v26 desplegada):** nueva función `contactAlreadyInList()` que hace un `GET /v3/contacts/{email}` ANTES del POST, chequeando si el contacto ya está en `listIds` de la lista 3 — ese es el chequeo real de duplicado, independiente del comportamiento de `updateEnabled`. Verificado en vivo: email existente (`avres03@gmail.com`) no generó nueva notificación; email nuevo de prueba sí generó una sola.

### Jornada 11 Jul 2026 — Chequeo de pauta + fix completo del Pixel duplicado

**Comparativo NoDarPapaya (imagen) vs NoDarPapayaVideo, 7-11 jul:** imagen con CTR 15.26%/CPL ~$4.08, video con CTR 2.96%/CPL ~$3.58 pero recibiendo más presupuesto de Meta (video views altos). El video no repite el fracaso del viejo `IntelAdReel` ($6.65 CPL) — va a la par o mejor. Se deja corriendo para seguir comparando.

**Encontrado al revisar los números: brecha de leads Meta vs Brevo creció a 75%** (8 leads reportados por Meta vs solo 2 contactos nuevos reales en Brevo lista 3, mismo periodo). Causa: el fix del 9 jul corrigió que Brevo/CAPI no se duplicaran en el backend, pero el Pixel del navegador seguía disparando `fbq('track','Lead')` en cada respuesta `success:true` — incluyendo resubmits de un email ya suscrito, ya que la función seguía devolviendo éxito para no romper la UX. Meta contaba esos resubmits como leads nuevos, inflando el conteo y el CPL reportado.

**Fix completo aplicado y desplegado:**
- `subscribe` (v27) y `taxi-subscribe` (v8) ahora devuelven `isDuplicate` en el JSON de respuesta
- `taxi-subscribe` tenía el mismo bug de fondo (`updateEnabled:true` nunca devuelve `duplicate_parameter`) — no se había tocado en el fix del 9 jul, corregido ahora con el mismo patrón
- Frontend (`page.tsx` + `EmailCaptureModal.tsx`): el Pixel de Meta (`fbq('track','Lead')`) solo se dispara cuando `isDuplicate` es `false`
- Verificado en vivo con curl: email existente → `isDuplicate:true`; email nuevo → `isDuplicate:false`; mismo email dos veces → segunda vez `isDuplicate:true`
- Commit `289f15b`, deploy automático de Vercel en camino tras el push

### Jornada 15 Jul 2026 — Respaldo de Apify para intel-gather

**Cuenta de respaldo agregada:** `hola@miguelespinosa.co` (username `maito_tech`), datos en Notion (`🔐 Credenciales & APIs` → Apify, bajo "Maito Tech S.A.S."). Esta misma key ya estaba asignada al agente global `newsletter-kb` — ahora comparte pool de créditos con `intel-gather` de este proyecto. No es un problema para el caso de uso (respaldo, no uso simultáneo pesado), pero queda anotado por si algún día hay que diagnosticar consumo de créditos raro.

- Secret `APIFY_TOKEN_BACKUP` creado en Supabase (Management API, mismo patrón que siempre).
- `intel-gather` (v19) reescrito con fallback real: si la cuenta principal (`APIFY_TOKEN`) devuelve 401/402/403 (sin créditos, token inválido/revocado), reintenta automáticamente con la de respaldo. NO reintenta en otros códigos de error (400, 5xx) porque esos fallarían igual con cualquier token.
- Si se usó el respaldo, el correo de notificación de `intel-gather` incluye una advertencia visible pidiendo revisar/recargar la cuenta principal — así no queda corriendo en modo respaldo sin que Miguel se entere.
- **Verificado en vivo, y no en teoría:** la primera corrida post-deploy activó el fallback de inmediato porque la cuenta principal ya estaba sin crédito (`402 not-enough-usage-to-run-paid-actor`, `$0.003228` restantes del tier gratis de $5/mes). Con el respaldo: 99 resultados, 21 ideas nuevas insertadas. Sin el fix, esta corrida habría fallado por completo.
- El crédito gratis de Apify se resetea mensualmente — probablemente la cuenta principal vuelva a tener saldo a inicio del próximo ciclo. Si el consumo sigue agotándola seguido, considerar plan pago en la cuenta principal en vez de depender del respaldo cada vez.

### Jornada 15 Jul 2026 (tarde) — Reformulación con los skills de Hormozi ($100M Leads / Money Models)

**Diagnóstico:** megusta no tenía un money model real, solo una oferta suelta (Attraction → intento de venta única de $17-37, sin upsell, downsell ni continuity). Por el marco de Hormozi eso significa que la adquisición nunca se auto-financia (Client-Financed Acquisition: 30-day gross profit ≥ CAC) — cada lead se paga de bolsillo, apostando a un margen delgado.

**Reformulación completa propuesta (secuencia Attraction → Upsell → Downsell → Continuity):**
1. Attraction (ya existe): el PDF gratis está bien, pero el primer pitch de venta llega hasta el día 8 del email — deja enfriar la intención de compra.
2. Upsell (falta): no hay order bump post-compra real (comprar Bogotá y que se ofrezca agregar las otras 2 ciudades con descuento en el momento).
3. Downsell (falta): nadie que dice no al $17 tiene una oferta más barata (ficha rápida $5, plan de pago, versión reducida).
4. **Continuity (la palanca más grande, y la única no explorada aún):** `intel-gather` ya produce inteligencia fresca semanal — empaquetarla como membresía recurrente ("Colombia Insider", $5-9/mes) es la reformulación de mayor apalancamiento, pendiente de diseñar.

**Decisión de Miguel: empezar por Leads, no por el money model.** Prioridad: activar Warm Outreach (nunca se ha tocado pese a que Miguel tiene audiencia propia como DJ/Spin) + reforzar Post Content, antes de seguir dependiendo de Paid Ads — coherente con la secuencia de Hormozi (Warm Outreach → Post Content → Cold Outreach → Paid Ads, no los 4 a la vez).

**Hallazgo del audit de Post Content:** el contenido orgánico cumple Hook/Retain/Reward, pero el Give/Ask está desbalanceado — 100% Integrated (link discreto al final del caption), 0% Intermittent (piezas dedicadas solo a pedir). Tampoco se usan Stories para asks directos.

**Primeras 2 piezas Intermittent agregadas al queue** (vía `idea-to-queue`, source `manual`):
- `idea-84d9adc4-4af` (2026-08-02): ask directo por el PDF gratis — qué incluye exactamente, sin intel nueva, cierre con megusta.com.co. El copy de Haiku salió bien de una, sin corrección.
- `idea-0d4317f2-dc1` (2026-08-09): ask directo por la guía paga ($17/$37) — **primera publicación orgánica en el feed que promueve el producto pago directamente** (antes solo se empujaba vía email). El copy de Haiku no traía precio ni CTA (el system prompt de Haiku está diseñado para NO sonar a venta, así que resiste escribir asks directos) — reescrito a mano con precio explícito + megusta.com.co. Ojo: mi primer rewrite tenía una raya (—) — la regla de "nada de raya" también aplica a copy que yo mismo escribo, no solo a lo generado por Haiku — corregido.

### Jornada 15 Jul 2026 (noche) — Pauta pausada, reconstrucción de estrategia

**Decisión de Miguel: pausar la pauta de Meta mientras se reconstruye la estrategia.** Datos que motivaron la pausa (campaña `MG_Leads_ColombiaVisitors_CheatSheet_Jun26`, 8 jun-15 jul, 5.5 semanas): 1,023,542 COP (~$249 USD) gastados, 94 leads reportados por Meta, 62 suscriptores reales en Brevo, **4 descargas del PDF gratis en Gumroad, 0 ventas pagas**. Solo 6.5% de los leads reales reclamó el lead magnet que ya habían pedido — el cuello de botella está aguas abajo del anuncio (algo entre el opt-in y la descarga), no en targeting. Ningún ajuste de pauta arregla eso.

**Campaña pausada** (no borrada) vía MCP `pause_campaign`, id `52512402757497`. Balance restante en la cuenta: 120,134 COP. Fecha de pausa: 15 Jul 2026.

**Lógica de la decisión:** coherente con la secuencia de Hormozi ya adoptada el 15 Jul (tarde) — Paid Ads va de último en el Core Four, no se financia mientras el money model / conversión aguas abajo no esté probado. Seguir pagando por leads que un funnel roto no retiene es quemar plata en el síntoma equivocado.

### Jornada 15 Jul 2026 (noche, cont.) — Diagnóstico completo del funnel de email: causa raíz encontrada y corregida

**Causa raíz del 6.5% de reclamos de PDF: el botón principal del email 1 estaba muerto desde que se creó, el 16 de junio.** El botón "Download the PDF" usaba `href="{{CHEAT_SHEET_PDF_URL}}"` — una variable de merge que NUNCA se llenó, porque la función `subscribe` solo manda `email`, `listIds`, `updateEnabled` al crear el contacto en Brevo (verificado: `attributes: {}` vacío en contactos reales). Cada persona que abría el email y le daba clic al botón grande no llegaba a ningún lado. El único link que sí funcionaba era un texto chico al pie ("megusta.com.co"), por eso los pocos clicks registrados en Brevo iban ahí y nunca a Gumroad.

**Cómo se encontró el bug real vs. el documentado:** al revisar el automation completo se descubrió que existen DOS generaciones de templates en Brevo para los mismos "pasos" (ej. templates 5/6/7/8 vs. 15/16/17/18/19/20/21/22/26/27, todos nombrados "Automation #1_step_#N"). Cuando se edita/duplica un template dentro del editor de Automation, Brevo crea copias nuevas con otro ID — las correcciones documentadas en jornadas anteriores (25 Jun, 3 Jul) se aplicaron a menudo a la copia standalone vieja ("Lead Magnet — N. ...") que YA NO está conectada al automation real. Para identificar cuál es la secuencia realmente viva, se calculó el delta de días entre el email 1 y cada envío posterior por contacto real — así se mapeó la secuencia de 10 emails que de verdad se envía: día 0(id15) → día 2(id17) → día 5(id18) → día 8(id8) → día 10(id26) → día 12(id19) → día 16(id20) → día 19(id21) → día 21(id27) → día 23(id22).

**Bugs adicionales encontrados en esa secuencia real (todos corregidos, 15 Jul):**
- **Día 1 (id 15):** botón "Download the PDF" apuntaba a `{{CHEAT_SHEET_PDF_URL}}` (vacío) → corregido a `https://megustacomco.gumroad.com/l/colombia-arrival-cheat-sheet`.
- **Día 5 (id 18):** botón "Get the Explorer Bundle" apuntaba al storefront genérico en vez de `/l/explorer-bundle` → corregido.
- **Día 12 (id 19, Laureles/Medellín) y Día 16 (id 20, SIM card):** el fix de "PS de venta" documentado el 25 Jun se aplicó a los templates standalone huérfanos (10, 11), nunca llegó a los que realmente se envían. Los dos emails vivos no tenían NINGÚN botón ni ask de compra — 100% Give, 0% Ask, justo el hueco que el audit de Post Content ya había señalado en la parte orgánica también. Se les agregó un P.S. + botón (día 12 → link directo a `/l/medellin-survival-vault`, día 16 → storefront porque el contenido no es de una sola ciudad).

**Decisión de Miguel (15 Jul, noche):** los botones de $17 en día 8, 10, 19 y 21 siguen apuntando al storefront genérico de Gumroad, no a una ciudad específica — se deja así intencionalmente, porque el funnel no captura en ningún punto qué ciudad visita el lead, así que no hay dato para personalizar esos links. No es un bug, es una limitación de datos conocida y aceptada por ahora.

**Pendiente de verificar:** Miguel ya aplicó a mano los 4 fixes en Brevo (día 1, 5, 12, 16). Falta confirmar en unos días si el % de reclamos del PDF sube desde el 6.5% actual — ese es el indicador real de que el fix funcionó.

### Pendiente
- **Confirmar en unos días si sube el % de reclamos del PDF gratis** tras los fixes de email del 15 Jul (noche) — línea base: 4 de 62 (6.5%).
- **Diseñar el continuity model ("Colombia Insider")** — la reformulación de mayor apalancamiento identificada, aún sin explorar en detalle (pricing, qué incluye, cómo se conecta con `intel-gather`).
- **Armar el script de Warm Outreach** (Hinge Method: pedir referidos, no vender directo a la red personal de Miguel) — quedó ofrecido, no ejecutado.
- **Diseñar 2-3 templates de Stories para asks directos** — canal sin usar todavía.
- **Considerar upsell/downsell en el funnel de compra** (order bump post-$17, oferta barata para quien dice no) — identificado, no implementado.
- **Cuando Miguel cree la nueva app de Pinterest:** retomar con el App ID/Secret nuevo, configurar Redirect URI primero, grabar el demo real, enviar solicitud de Trial.
- **Revisar en unos días si el conteo de leads en Meta Ads Manager ahora coincide mejor con los contactos reales de Brevo** — confirmar que el fix del Pixel realmente cerró la brecha del 75%.
- **Revisar en 3-5 días si `MG_LeadOpt_NoDarPapayaVideo` compite con la imagen estática** — comparar CPL/CTR antes de decidir si escalar el formato video a otras ciudades/ángulos.
- **Recortar `medellin-cablecar.mp4`** para evitar el frame con el cable cruzando el cuadro, o reemplazarlo por otro clip.
- **Decidir el primer Reel de producción que use footage real** (candidato: uno de los posts de julio sobre Comuna 13, Ciclovía, o el walled city de Cartagena — todos tienen clip fuerte ya en la librería).
- **Confirmar con Juan Camilo si los 7 posts sin hashtags en su pegado (07-13/15/17/19/20/24/27) son una edición real o un artefacto de copy-paste** — ver jornada 3 Jul arriba.
- **Crear assets visuales (imágenes) de los 17 posts de julio** — el copy ya está en el queue, falta generar las imágenes Satori antes de que el cron los publique.
- **Revisar resultados de la campaña el jueves 6 Jun** — CTR, CPC, gasto real. Pausar ads con CTR < 0.8%.
- **Transferir ad account al Business Portfolio "Me Gusta"** para poder usar system user token permanente en meta-ads MCP (en lugar del personal user token que expira en ~60 días).
- **Renovar META_ACCESS_TOKEN en .mcp.json** antes de que expire (~60 días desde 3 Jun = ~2 Ago). Token es el personal user long-lived de Miguel.
- Renovar `META_PAGE_TOKEN` con scope `pages_manage_posts` cuando se quiera publicar también en FB (no urgente, IG es el canal principal).
- Reescribir `nextPublishDate` para que respete días libres ya ocupados sin pisarlos (hoy si ya hay un post en día X, el siguiente cae en X+1).
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

### Jornada 1 Jul 2026 — Recovery de cuenta Meta + migración intel-gather + copy review workflow

**Meta Ads: cuenta suspendida por pago pendiente.**
- `account_status` en `UNSETTLED` desde ~26 Jun — 5-6 días sin entrega real pese a que la campaña mostraba "ACTIVE"
- Balance pendiente 137,167 COP. Usuario agregó medio de pago nuevo, cuenta volvió a `ACTIVE`
- Leads perdidos estimados: ~15-20 durante el bloqueo (último lead real fue 25 Jun)

**Queue de contenido se había vaciado.** 30/30 posts publicados, cron no alcanzó a generar más porque intel-gather llevaba semanas sin traer nada (0 hits silenciosos, nadie lo notó).

**Diagnóstico: HN Algolia sin volumen.** Las 8 queries travel-focused sobre Colombia (nómadas, expat, etc.) daban 0 hits con filtro `points>5` en 6 meses — HN no tiene ese volumen de discusión para temas de nicho.

**Migración de fuente: HN Algolia → Apify Google Search Scraper.**
- Apify Reddit Scraper directo probado en vivo: bloqueado 403 incluso con proxy residential — Reddit bloquea datacenter IPs agresivamente, Apify no es excepción
- Google Search Scraper (`apify/google-search-scraper`) rodea el bloqueo buscando `site:reddit.com` — Google sí indexa los hilos aunque Reddit no deje scrapearlos directo
- 11 queries nuevas, cruzadas con modismos ya usados en el cheat sheet (no dar papaya, qué más, quiubo) para no repetir ángulos
- Costo real: ~$0.05/corrida sobre $5/mes gratis de Apify — holgado
- `intel-gather` v17 deployada. Constraint `content_ideas_source_check` alterada para aceptar `'google-search'`
- Primera corrida: 98 ideas nuevas insertadas

**Regla nueva: "todo es intel de calle" — no acusar instituciones.**
- Detectada una idea (Medellín 2026) que afirmaba que la policía rotaba cada 90 días "para evitar negocios paralelos" — acusación de corrupción sin verificar, fuente única de Reddit
- Regla documentada: nunca especular sobre motivos institucionales (policía, migración, gobierno), solo observación de calle verificable
- Aplicada en 3 capas: `CLAUDE.md` (documentación), `intel-gather` BLOCKED_KEYWORDS (bribe, corrupt cop, extortion...), system prompt de Haiku en `idea-to-queue` (instrucción explícita)
- El post problemático se descartó del queue

**Corrección de documentación: el trigger `on_idea_approved` SÍ existe.**
- La decisión #13 de este archivo (27 May) decía que el trigger "nunca existió". Falso — es un trigger Postgres real (`AFTER UPDATE ON content_ideas`) que llama `idea-to-queue` via `pg_net.http_post`
- Causó una carrera cuando se aprobaron 15 ideas en batch: el trigger procesó todo async antes de que mis llamadas manuales llegaran, y 3 posts cayeron en la misma fecha de publicación (bug de `nextPublishDate()` leyendo estado desviejo)
- Corregido en `dont-do.md` — nunca asumir que no hay triggers sin correr `SELECT tgname FROM pg_trigger`

**Julio completo: 17 posts en `content_queue` (3-31 jul), 21 ideas curadas y aprobadas del pool de 98.**
- Primeras 15: mezcla de ángulos (quiubo, CheckMig scam, SIM cards, Cartagena pricing, Islas del Rosario, 20 años expat)
- Últimas 6: variedad para no saturar (expat life Bogotá, Medellín positivo, visa nómada, Cartagena contra-narrativa, slang Bogotá, ciudades remote-work alternas)
- Todo el copy generado pasó por revisión `/humanizalo` antes de entrar al queue — encontrados y corregidos: contrastes binarios P15, un em dash, "Full stop." (P36), arco de revelación completo en el post de 20 años (P41+P43), 2 posts sin cierre `megusta.com.co`, 1 typo de gramática

**Workflow nuevo: copy review con Juan Camilo (director creativo, copywriter).**
- Notion descartado — invitarlo como member cuesta, y el flujo de guest le daba error
- Decisión: Google Doc con modo Sugerencias (mejor fit que Notion para revisión de copy — track changes real)
- Doc creado con los 17 posts + espacio de feedback por post, compartido con permiso "Comentador"
- Pendiente: crear assets visuales de los 17 posts mientras se espera el review de copy, para no frenar el calendario

### Errores conocidos a evitar (nuevo)

27. **Cuenta Meta puede estar "ACTIVE" en apariencia y bloqueada de verdad.** El campo `status` del ad/campaign no refleja el estado real de facturación. Siempre chequear `account_status` y `balance` del ad account (`act_XXX`) cuando el rendimiento cae en seco sin razón aparente.

28. **Fuentes de intel-gather pueden quedar secas en silencio.** `fetched:0` no es un error — el código lo trata como resultado válido y no alerta fuerte. Revisar periódicamente que el volumen de ideas nuevas sea razonable, no solo que la function "corra sin errores".

29. **Aprobar ideas en batch dispara el trigger async en paralelo.** Causa colisiones de fecha en `content_queue` porque `nextPublishDate()` lee el estado de la tabla en el momento de cada llamada. Revisar el queue después de cualquier aprobación masiva.

30. **No asumir que un trigger Postgres "no existe" sin verificarlo en la DB.** Documentación vieja puede quedar desactualizada si alguien agrega un trigger después. Verificar con `pg_trigger` antes de escribir "esto no existe" en CLAUDE.md.

31. **Copy pegado desde Google Docs en el chat puede perder hashtags al copiar (modo Sugerencias/Comentarios).** Detectado 3 Jul revisando el feedback de Juan Camilo: 7 de 17 posts aparecían sin hashtags en el texto pegado, sin ningún otro cambio de copy que lo justificara — resultó ser artefacto de copy-paste, no una edición real. **Regla:** antes de aplicar cualquier cambio de hashtags basado en texto pegado, verificar el conteo real en `content_queue` vía SQL (`length(caption) - length(replace(caption,'#',''))`) en vez de asumir que la ausencia en el pegado es intencional. Mantener 9-15 hashtags por post en toda generación futura (Haiku vía `idea-to-queue` ya apunta a ese rango — no bajar de ahí al aplicar ediciones manuales).

32. **Brevo Automation step templates NO se pueden editar vía API.** `GET /v3/smtp/templates/{id}` funciona perfecto (devuelve htmlContent completo) para cualquier template, incluidos los de pasos de Automation (`name: "Automation #1_step_#N"`). Pero `PUT /v3/smtp/templates/{id}` devuelve 404 `document_not_found` en esos mismos IDs, incluso con body mínimo — la API los trata como de solo lectura. Los templates standalone (no ligados a una Automation) sí se pueden editar vía PUT normalmente. Para cambios de copy/links en emails de una Automation: diagnosticar y preparar el fix exacto vía API (más rápido, más preciso), pero la aplicación final requiere pegarlo manualmente en el editor visual de Brevo.

33. **El MCP `meta-ads` no sirve para publicar creatives de video.** `create_ad_creative` con `video_id` da "Invalid parameter" sin más detalle — probablemente porque el video necesita `object_story_spec.video_data` con thumbnail (`image_url`/`image_hash`) y el tool no expone ese campo. Tampoco hay tool de subida de video (`upload_creative_asset` solo referencia assets ya alojados, no sube bytes). Flujo que sí funciona, todo por Graph API directo con el `META_ACCESS_TOKEN` de `.mcp.json`: (1) `POST /act_{id}/advideos` multipart con el archivo → `video_id`, (2) poll `GET /{video_id}?fields=status` hasta `video_status:"ready"`, (3) `GET /{video_id}?fields=picture,thumbnails` para sacar un thumbnail auto-generado, (4) `POST /act_{id}/adcreatives` con `object_story_spec` armado a mano (page_id + video_data con video_id/title/message/image_url/call_to_action), (5) `POST /act_{id}/ads` con `creative={"creative_id":...}` y `adset_id`. Mismo patrón que ya estaba documentado para imágenes (error de mayo: "Meta no acepta image_url en link_data, hay que subir a /adimages") — el MCP cubre lectura/analytics bien, pero para publicar creatives nuevos casi siempre hay que caer a Graph API crudo.

34. **`Brevo POST /v3/contacts` con `updateEnabled: true` NUNCA devuelve `duplicate_parameter`.** Con ese flag, un contacto existente se actualiza/mergea y responde 201 (éxito) en vez del error de duplicado. Cualquier lógica que dependa de ese código de error para detectar "ya suscrito" es código muerto. Para detectar duplicados reales con `updateEnabled: true`, hacer `GET /v3/contacts/{email}` ANTES del POST y chequear `listIds` — no confiar en el código de respuesta del POST.

35. **Pinterest Trial access también requiere demo de OAuth (no es automático).** La documentación vieja de este proyecto decía que solo Standard pedía video demo — falso, o cambió: Trial rechazado da el mismo criterio (flujo OAuth completo, integración real). Una app rechazada queda bloqueada por completo (ni siquiera tokens de solo-lectura funcionan: `"Your application consumer type is not supported"`) y NO se puede reenviar — hay que crear una app nueva. Configurar el Redirect URI ANTES de intentar cualquier flujo OAuth, o no habrá manera de completar/grabar un demo real.

36. **Brevo duplica templates cuando se editan/duplican dentro del editor de Automation.** Al modificar un paso del automation, Brevo a veces crea una copia nueva con otro ID en vez de editar el original in-place — el template viejo queda huérfano (ya no lo usa el automation) pero sigue existiendo y sigue siendo editable vía API, lo cual engaña: parece que el fix se aplicó porque el PUT/la edición funcionó, pero el automation real sigue mandando la versión vieja sin el fix. Pasó al menos 2 veces (25 Jun, 3 Jul) con los fixes de "PS de venta" y de links de Gumroad. **Cómo verificar cuál template es el que de verdad se envía:** no confiar en el nombre/ID documentado en jornadas anteriores — pedir el reporte de eventos `delivered` de los últimos 60-90 días, agrupar por `templateId` y por contacto, y calcular el delta de días entre el primer email y cada envío posterior. El template con el delta que coincide con el día esperado (ej. "día 8") es el que está vivo. Antes de dar cualquier fix por aplicado, confirmar contra ese mapeo real, no contra el nombre del template.

## Credenciales
Todas en Notion: https://www.notion.so/337e9543180181c4a2ace9189e2e16fe
NO guardar credenciales en este archivo ni en archivos commiteados.

---
*Última actualización: 15 Jul 2026 (tarde)*
