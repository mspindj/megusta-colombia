@AGENTS.md

# Me Gusta Colombia — Project CLAUDE.md

## Stack Técnico

| Capa | Herramienta | Notas |
|------|------------|-------|
| **Frontend** | Vite + React + shadcn/ui + Framer Motion | Repo: github.com/mspindj/colombia-intel-hub. Lovable es el "cerebro" del front — darle prompts, no editar código directamente |
| **Landing** | megusta.com.co | Deploy via Lovable |
| **Email marketing** | Brevo (free tier, 300/día) | 4 emails en automation, Supabase Edge Function como proxy |
| **Payments** | Gumroad | $17/city, $37 bundle, $0 cheat sheet |
| **Backend/Infra** | Supabase (free tier) | Edge Functions + pg_cron + Storage |
| **Design** | Figma (Maito Agency Pro) | Archivo principal: WyUX7XUzmdrkjfcMI9DkSt |
| **Video** | Editor Pro Max (Remotion) | En editor-pro-max-main/ |
| **Audio** | Ableton Live 12 (MCP) + Gemini TTS | Beat custom + voiceover AI |
| **Social** | Meta Graph API | FB Page + IG @megustacomco, token permanente |
| **Copy generation** | Claude API (Haiku) via Supabase Edge Function | pg_cron lunes 9am |
| **CMS/Docs** | Notion | Command Center + Copy Bank + Reddit Opportunities |

## Convenciones del Proyecto

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
- Font: Inter (Sans) + Roboto Mono (labels)
- Todos los colores verificados WCAG AA/AAA

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

### Lovable — Workflow
- Lovable maneja el frontend. Claude Code maneja contenido/email/infra
- Para cambios de frontend: producir un prompt detallado, guardarlo en docs/, y el usuario lo pega en Lovable
- NUNCA editar el código del repo local esperando que se depliegue

### Supabase — Edge Functions
- Proyecto: uocwxwvcrnkfnnoyjzyb
- Todas las functions sin JWT verification (públicas o llamadas por pg_cron)
- Secrets se configuran via Lovable o dashboard de Supabase
- No tenemos acceso directo al MCP de Supabase (cuenta diferente) — usamos Lovable o CLI

### Meta API
- FB Page ID: 1068628786330276
- IG Business Account ID: 17841480006391349
- Token permanente (never expires) — guardado en Supabase secrets como META_PAGE_TOKEN
- Para IG image posts: la imagen debe ser URL pública directa (no redirects)
- Para IG Reels: media_type=REELS, video debe estar procesado (esperar status FINISHED)
- IG no permite borrar posts via API

## Errores Conocidos a Evitar

1. **Figma layoutSizingHorizontal="FILL"**: solo se puede setear DESPUÉS de appendChild a un auto-layout frame
2. **Figma Folder names**: no pueden tener espacios ("Me Gusta Colombia" → "MeGustaColombia")
3. **Brevo env var en Lovable**: debe ser BUILD secret, no runtime secret (Vite inyecta en build time)
4. **Reddit API**: denegaron acceso. No insistir. Descartado.
5. **Pinterest API**: Trial mode = pins no públicos. Standard access requiere video demo de OAuth.
6. **Meta Graph API**: el token del Graph API Explorer es USER token. Para publicar necesitas PAGE token (obtenido via /me/accounts)
7. **Gemini TTS**: output es PCM L16 a 24kHz mono. Convertir a WAV antes de usar.
8. **Remotion**: los WAV de Ableton son 44.1kHz stereo, los de Gemini son 24kHz mono — Remotion los mezcla sin problema.

## Decisiones de Arquitectura

1. **Supabase en vez de n8n**: n8n cloud no tiene free tier permanente. Supabase pg_cron + Edge Functions es gratis e ilimitado para nuestro volumen
2. **Supabase Edge Function como proxy de Brevo**: evita exponer API key en el frontend de Lovable
3. **Reddit descartado**: API denegada. El contenido se enfoca en Meta (FB + IG) + Pinterest + Email
4. **Editor Pro Max para video**: Remotion renderiza localmente. No se puede automatizar el rendering en cron — se hace en batch y se sube a Storage
5. **Gemini TTS en vez de fal.ai/ElevenLabs**: gratis con la Google API key del usuario, calidad comparable
6. **4 posts/semana en vez de diario**: con 21 followers en FB, calidad > volumen. Los Reels tienen alcance orgánico de 7-14 días

## Estado Actual (17 Apr 2026)

### Completado
- Landing page live en megusta.com.co
- Lead magnet funnel: form → Supabase → Brevo → 4 email sequence
- Arrival Cheat Sheet PDF (Figma, mobile-first, WCAG AA/AAA) en Gumroad $0
- 3 guías de ciudades rediseñadas en Figma (BOG 38pp, MDE 26pp, CTG 26pp)
- Gumroad assets: banners + product images para 4 productos
- Pinterest pin templates (5 carousels redesigned for IG)
- Content plan de 30 días documentado
- Copy generator automatizado (Claude Haiku, pg_cron lunes)
- Meta publish + monitor Edge Functions deployed
- Auto-publish DB-driven (Lee de content_queue, no postIds hardcodeados)
- IG Reels fix: polling hasta FINISHED en vez de sleep fijo
- pg_cron jobid 7 (auto-publish-rotate): lun/mié/vie/dom 2pm UTC, sin rotación manual
- content_queue tabla en Supabase con 9 posts programados hasta Apr 28
- Todos los Reels en Storage: reel-02 a reel-05 + taxi
- Profile pic + FB Cover diseñados

### Cola de contenido activa (content_queue)
| Fecha | ID | Tipo | Estado |
|-------|----|------|--------|
| Abr 14 | day4-phone-tip | image | ✅ publicado |
| Abr 16 | reel-02-frontseat | video | ✅ publicado (FB only, IG fix en nueva versión) |
| Abr 18 | day8-phrases | image | ⏳ cron vie 18 |
| Abr 20 | reel-03-emergency | video | ⏳ cron dom 20 |
| Abr 21 | day5-bogota-face | image | ⏳ cron lun 21 |
| Abr 23 | reel-04-poblado | video | ⏳ cron mié 23 |
| Abr 25 | day10-gringo-prices | image | ⏳ cron vie 25 |
| Abr 27 | reel-05-papaya | video | ⏳ cron dom 27 |
| Abr 28 | day13-redflag | image | ⏳ cron lun 28 |

### Pendiente
- Borrar post duplicado de Taxi en IG (manual) y FB (API o manual)
- Agregar semana 5 a content_queue antes del 28 (solo INSERT en Supabase, sin tocar pg_cron)
- Privacy policy page en megusta.com.co
- Pinterest Standard Access (requiere video demo)
- Producir guía de Cali (4ta ciudad)
- Tier 3: Content repurposer, calendario editorial, video pipeline escalable

## Comandos Frecuentes

```bash
# Supabase
# SQL en dashboard: supabase.com/dashboard/project/uocwxwvcrnkfnnoyjzyb/sql/new

# Editor Pro Max (Remotion)
cd editor-pro-max-main
npm run dev                    # Preview en browser
npx remotion render TaxiReel out/taxi-reel.mp4 --codec h264  # Render a MP4

# Gemini TTS
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=$GOOGLE_API_KEY" ...

# Meta API - publicar en FB
curl -X POST "https://graph.facebook.com/v21.0/1068628786330276/photos" --data-urlencode "url=IMG_URL" --data-urlencode "caption=TEXT" --data-urlencode "access_token=$PAGE_TOKEN"

# Meta API - publicar Reel en IG (2 pasos)
# 1. Crear container: POST /17841480006391349/media (media_type=REELS, video_url=URL)
# 2. Esperar status=FINISHED
# 3. Publicar: POST /17841480006391349/media_publish (creation_id=CONTAINER_ID)

# Upload a Supabase Storage
curl -X POST "https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/upload-image" -F "file=@archivo.png" -F "fileName=nombre.png"
```

## Credenciales
Todas en Notion: https://www.notion.so/337e9543180181c4a2ace9189e2e16fe
NO guardar credenciales en este archivo.

## pg_cron — Rotación semanal de postIds

Los cron jobs de auto-publish tienen postIds hardcodeados. Cada lunes hay que:
1. Correr `docs/supabase/check-published-posts.sql` para ver qué se publicó
2. Unschedule los jobs viejos: `SELECT cron.unschedule(JOB_ID);`
3. Crear nuevos con los postIds de la semana siguiente (ver `fix-cron-week2.sql` como plantilla)

### Semana 1 (Apr 11-13) — PUBLICADO
| Día | Post ID | Contenido |
|-----|---------|-----------|
| Vie 11 | (manual) C1-01-Hook | Brand intro |
| Vie 11 | day2-pin-bogota | Taxi price $40 vs $8 |

### Semana 2 (Apr 14-20) — PROGRAMAR
| Día | Post ID | Contenido | Plataforma |
|-----|---------|-----------|------------|
| Lun 14 | day4-apps | Phone lost tip | FB + IG |
| Mie 16 | (manual) Reel 2 FrontSeat | Front seat script | FB + IG |
| Vie 18 | day8-phrases | Front seat phrases | FB + IG |
| Dom 20 | (manual) Reel 3 Emergency | 123 emergency | FB + IG |

### Semana 3 (Apr 21-27) — SIGUIENTE
| Día | Post ID | Contenido | Plataforma |
|-----|---------|-----------|------------|
| Lun 21 | day5-bogota-face | Bogota Face Protocol | IG |
| Mie 23 | (manual) Reel 4 Poblado | El Poblado paradox | FB + IG |
| Vie 25 | day10-gringo-prices | Gringo lunch prices | FB + IG |
| Dom 27 | (manual) Reel 5 Papaya | No dar papaya | FB + IG |

---
*Última actualización: 17 Apr 2026*
