# Tier 1 — Automation Architecture

## Dos flujos a construir:
1. **Copy Generator** — genera variantes de copy por ciudad/canal con Claude API
2. **Reddit Monitor** — detecta posts sobre viajes a Colombia y notifica oportunidades

---

## Plataformas de Automatizacion Evaluadas

| Plataforma | Free Tier | Limite | Costo Pagado | Veredicto |
|-----------|-----------|--------|-------------|-----------|
| **n8n Cloud** | Solo trial (14 dias) | 1,000 ejecuciones | €24/mo starter | Ya lo tenemos pero NO tiene free tier permanente |
| **n8n Self-hosted** | Ilimitado | Sin limites | Solo hosting (~$5/mo) | Mejor opcion si hospedamos nosotros |
| **Make.com** | 1,000 ops/mes | 2 escenarios activos, 15min minimo | $10.59/mo | Muy limitado en free |
| **Pipedream** | 100 creditos/dia | 3 workflows activos | $29/mo | Poco para lo que necesitamos |
| **Supabase pg_cron + Edge Functions** | Incluido en free tier | 500K edge function invocations/mo | Ya lo tenemos | GRATIS, ya configurado |

### Recomendacion: Supabase (ya lo tenemos)

Supabase free tier incluye:
- pg_cron para scheduling (cada minuto hasta anual)
- Edge Functions (500K invocations/mo gratis)
- Base de datos Postgres incluida
- NO necesitamos otro servicio de automatizacion

Para los 2 flujos de Tier 1, Supabase es suficiente y GRATIS.

---

## APIs Necesarias

| Servicio | Uso | Costo | Acciones |
|----------|-----|-------|----------|
| **Claude API (Haiku 3)** | Generar copy | ~$0.25/1M input tokens | Crear cuenta API en console.anthropic.com |
| **Reddit API** | Monitorear posts | Gratis (100 req/min) | Crear app en reddit.com/prefs/apps |
| **Brevo API** | Ya configurado | Gratis | Ya tenemos |
| **Notion API** | Guardar resultados | Gratis | Crear integration en notion.so/my-integrations |

### Costos estimados mensuales

**Copy Generator:** ~50 generaciones/mes x ~500 tokens cada una = 25K tokens
- Haiku 3: $0.25/1M input + $1.25/1M output ≈ **$0.03/mes**

**Reddit Monitor:** ~720 scans/mes (cada hora) x 1 request = 720 requests
- Reddit API: **$0/mes** (muy por debajo del limite)

**Total Tier 1: ~$0.03/mes** (practicamente gratis)

---

## Arquitectura por Flujo

### Flujo 1: Copy Generator

```
pg_cron (semanal, lunes 9am)
  → Edge Function: generate-copy
    → Claude API (Haiku 3): genera 5 variantes
      - Pinterest pin description
      - Reddit comment/post
      - Facebook post
      - Instagram caption
      - Email subject line
    → Guarda en Notion database
    → (Opcional) Notifica por email via Brevo
```

**Edge Function:** `generate-copy`
**Secrets:** `ANTHROPIC_API_KEY`, `NOTION_API_KEY`
**Trigger:** pg_cron cada lunes a las 9:00 AM
**Output:** 5 variantes de copy por ciudad guardadas en Notion

### Flujo 2: Reddit Monitor

```
pg_cron (cada 2 horas)
  → Edge Function: reddit-monitor
    → Reddit API: busca posts recientes con keywords
      Keywords: "colombia travel", "bogota first time", "medellin tips",
               "cartagena tourist", "visiting colombia", "colombia solo travel"
      Subreddits: r/colombia, r/travel, r/solotravel, r/digitalnomad,
                  r/bogota, r/medellin
    → Filtra: solo posts de <24hrs, >3 upvotes
    → Guarda en Notion database (URL, titulo, subreddit, score)
    → Notifica por email (Brevo) con los mejores posts
```

**Edge Function:** `reddit-monitor`
**Secrets:** `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `NOTION_API_KEY`, `BREVO_API_KEY`
**Trigger:** pg_cron cada 2 horas
**Output:** Posts relevantes en Notion + email de notificacion

---

## Servicios Necesarios (Registro)

### 1. Claude API — console.anthropic.com
- Crear cuenta (o usar existente)
- Agregar credito minimo ($5 — dura meses con Haiku 3)
- Generar API key
- Guardar en Supabase secrets como `ANTHROPIC_API_KEY`

### 2. Reddit API — reddit.com/prefs/apps
- Crear "script" app (tipo personal use)
- Nombre: "Me Gusta Colombia Monitor"
- Redirect URI: http://localhost (no se usa)
- Obtener: client_id + client_secret
- Guardar en Supabase secrets como `REDDIT_CLIENT_ID` y `REDDIT_CLIENT_SECRET`

### 3. Notion API — notion.so/my-integrations
- Crear internal integration
- Nombre: "Me Gusta Automations"
- Obtener: Internal Integration Token
- Compartir las databases de Notion con la integration
- Guardar en Supabase secrets como `NOTION_API_KEY`

### 4. Supabase — Ya configurado
- Solo agregar los secrets nuevos a Edge Functions
- Crear las 2 Edge Functions
- Configurar pg_cron jobs

---

## Notion Databases Necesarias

### DB: Content Copy Bank
| Campo | Tipo |
|-------|------|
| City | Select (Bogota, Medellin, Cartagena) |
| Channel | Select (Pinterest, Reddit, FB, IG, Email) |
| Copy | Rich Text |
| Generated | Date |
| Used | Checkbox |

### DB: Reddit Opportunities
| Campo | Tipo |
|-------|------|
| Title | Title |
| URL | URL |
| Subreddit | Select |
| Score | Number |
| Comments | Number |
| Found | Date |
| Responded | Checkbox |
| Notes | Rich Text |

---

## Pasos de Implementacion

1. **Registrar APIs** — Claude, Reddit, Notion (10 min cada una)
2. **Crear databases en Notion** — Copy Bank + Reddit Opportunities
3. **Agregar secrets en Supabase** — todas las API keys
4. **Deploy Edge Function: generate-copy**
5. **Deploy Edge Function: reddit-monitor**
6. **Configurar pg_cron** — schedules para ambos flujos
7. **Test** — ejecutar manualmente y verificar resultados

---

## Fuentes
- [n8n Pricing](https://n8n.io/pricing/)
- [Make.com Pricing](https://www.make.com/en/pricing)
- [Pipedream Pricing](https://pipedream.com/pricing)
- [Reddit API Wiki](https://support.reddithelp.com/hc/en-us/articles/16160319875092-Reddit-Data-API-Wiki)
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Supabase Cron](https://supabase.com/docs/guides/cron)
- [Supabase Edge Functions Scheduling](https://supabase.com/docs/guides/functions/schedule-functions)
