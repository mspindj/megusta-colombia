@AGENTS.md

# Me Gusta Colombia — Project CLAUDE.md

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
3. **Reddit API**: denegaron acceso. No insistir. Descartado.
4. **Pinterest API**: Trial mode = pins no públicos. Standard access requiere video demo de OAuth.
5. **Meta Graph API**: el token del Graph API Explorer es USER token. Para publicar necesitas PAGE token (obtenido via /me/accounts)
6. **Gemini TTS**: output es PCM L16 a 24kHz mono. Convertir a WAV antes de usar.
7. **Remotion**: los WAV de Ableton son 44.1kHz stereo, los de Gemini son 24kHz mono — Remotion los mezcla sin problema.
8. **Hero overlay en Tailwind v4**: `bg-background/85` resuelve muy oscuro. Usar `style={{ background: "rgba(10,10,10,0.65)" }}` directamente.
9. **Supabase secrets**: NO guardar tokens en archivos que se commitean. `.mcp.json` en .gitignore.
10. **colombia-intel-hub**: repo borrado. No intentar acceder. Todo está en megusta-colombia.

## Decisiones de Arquitectura

1. **Next.js en vez de Lovable**: Migrado 2026-05-22. Lovable consumía créditos en Birdie Club. Next.js + Vercel = deploy automático sin límites.
2. **Supabase en vez de n8n**: n8n cloud no tiene free tier permanente. Supabase pg_cron + Edge Functions es gratis e ilimitado para nuestro volumen.
3. **Supabase Edge Function como proxy de Brevo**: evita exponer API key en el frontend.
4. **Reddit descartado**: API denegada. Contenido se enfoca en Meta (FB + IG) + Email.
5. **Editor Pro Max para video**: Remotion renderiza localmente. No se puede automatizar el rendering en cron — se hace en batch y se sube a Storage.
6. **Gemini TTS en vez de fal.ai/ElevenLabs**: gratis con la Google API key del usuario, calidad comparable.
7. **4 posts/semana en vez de diario**: calidad > volumen. Los Reels tienen alcance orgánico de 7-14 días.
8. **Taxi calculator sin Maps API**: precios hardcodeados por ruta — más rápido, sin costo, suficiente para el MVP.

## Estado Actual (22 May 2026)

### Completado
- Landing page live en megusta.com.co (Next.js, Vercel, GitHub)
- Lead magnet funnel: form → Supabase subscribe → Brevo → 4 email sequence
- Arrival Cheat Sheet PDF (Figma, mobile-first, WCAG AA/AAA) en Gumroad $0
- 3 guías de ciudades rediseñadas en Figma (BOG 38pp, MDE 26pp, CTG 26pp)
- intel-gather Edge Function: pg_cron lunes 8am → Apify Reddit → content_ideas
- idea-to-queue Edge Function: trigger on_idea_approved → Haiku → imagen Satori → content_queue
- taxi-subscribe Edge Function: captura email con source=taxi-calculator + ciudad
- /taxi page: calculadora de taxis con 8 rutas, 3 ciudades, modal de captura
- Meta Pixel 1525809615712600 instalado en layout.tsx (PageView global + Lead en taxi)
- Meta Ad Account act_12667938 activo, secrets en Supabase
- Migración completa Lovable → Next.js (colombia-intel-hub borrado)
- SDD harness completo en .claude/ (agents, context, specs, feature_list)

### Pendiente
- DNS propagado → smoke test completo de /taxi (email → Brevo → confirmación)
- Privacy policy page en megusta.com.co
- Pinterest Standard Access (requiere video demo)
- Producir guía de Cali (4ta ciudad)
- content_queue: agregar nuevos posts (pipeline intel-gather → idea aprobada → auto-queue)
- colombia-reel-template (Remotion parametrizado)
- remotion-render-server (bloqueado por reel-template)

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
