# dont-do.md — Decisiones descartadas. No volver a proponer.

---

## Herramientas / Integraciones

- **Reddit API directa** — acceso denegado. Se usa Apify como proxy. No insistir.
- **n8n** — no está en el plan pago. Supabase Edge Functions cubre todo.
- **Make (Integromat)** — evaluado y descartado por complejidad vs valor. No proponer.
- **Pinterest Standard Access** — trial mode = pins no públicos. Requiere video demo de OAuth que no vale el esfuerzo ahora.
- **ElevenLabs / fal.ai TTS** — descartado. Se usa Gemini TTS (gratis con la Google API key del usuario).
- **Render.com para Remotion** — bloqueado hasta que exista `colombia-reel-template` parametrizado. No proponer como solución hasta que esa feature esté `done`.

## Arquitectura

- **Hardcodear contenido en Edge Functions** — la primera versión de auto-publish lo hacía. Descartado. Todo el contenido viene de la DB (`content_queue`, `content_ideas`).
- **Rotación manual de pg_cron jobs** — requería editar SQL cada semana. Descartado. Las functions leen de DB directamente.
- **Publicación diaria** — evaluada y descartada. 4 posts/semana. Calidad > volumen con audiencia pequeña.
- **USER_TOKEN de Meta Graph API** — se rota y expira. Siempre usar PAGE_TOKEN permanente guardado en Supabase secrets como `META_PAGE_TOKEN`.
- **Editar código del repo local para cambios de frontend** — Lovable maneja megusta.com.co. Claude Code no edita el repo esperando que el front se depliegue. Para cambios de front: producir prompt para Lovable.

## Copy / Contenido

- **"Vibrant"** — palabra prohibida en cualquier copy del producto.
- **"Bustling"** — igual, prohibida.
- **"Paradise"** — igual, prohibida.
- **Copy genérico de travel brand** — "explore Colombia's rich culture". No. Somos una briefing, no una agencia.
- **Emojis en copy impreso** — no van en PDFs ni en el cuerpo de las guías de ciudad.

## UI / Diseño

- **PDFs en formato carta o A4** — descartado. Mobile-first: 390x844px siempre.
- **Body text menor a 18px en PDFs** — los usuarios leen en celular. Si dudan: más grande, no más pequeño.
