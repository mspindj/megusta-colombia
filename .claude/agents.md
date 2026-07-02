# agents.md — Entry Point del SDD Harness
## Me Gusta Colombia

> **LEE ESTO PRIMERO.** Todos los agentes leen este archivo antes de cualquier acción.

---

## 0. Antes de empezar

1. `bash .claude/init.sh` — si falla, para. No continúes.
2. Lee `progress/session_recovery.md` — puede haber trabajo en curso.
3. Lee `feature_list.json` — para saber qué está activo, pendiente o bloqueado.
4. Lee los archivos de `context/` relevantes para tu tarea:
   - **Siempre:** `context/dont-do.md`
   - **Si tocas copy, email o UI:** también `context/voice.md` y `context/domain-patterns.md`
   - **Si eres implementer:** también `context/corrections.md`
5. **Si la feature toca UI o imagen generada:** también `DESIGN.md` (raíz del proyecto)

---

## 1. Mapa del repositorio

```
megusta-colombia/
├── DESIGN.md             # Sistema de diseño — leer antes de cualquier UI
├── src/app/              # Next.js 15 app router
│   ├── page.tsx          # Landing principal
│   ├── taxi/             # Calculadora de taxis (live)
│   ├── dashboard/        # Dashboard de contenido (live, auth requerida)
│   │   ├── page.tsx      # Server component — lista content_ideas
│   │   ├── actions.ts    # Server Actions: approveIdea, deleteIdea, signOut
│   │   └── IdeaRow.tsx   # Client component — row con acciones
│   └── auth/             # Login con email/password
├── public/               # Assets estáticos
├── docs/
│   ├── supabase/         # Source de Edge Functions (leer antes de tocarlas)
│   │   ├── intel-gather/  # Cron lunes 8am UTC → HN Algolia → content_ideas
│   │   ├── idea-to-queue/ # approve → Haiku + Satori + Storage → content_queue
│   │   ├── auto-publish/  # Cron lun/mié/vie/dom 14:00 UTC → IG via meta-publish
│   │   ├── meta-publish/  # Abstracción Meta Graph API (FB + IG)
│   │   └── taxi-subscribe/ # Captura email desde /taxi
│   └── emails/           # Templates Brevo
├── editor-pro-max-main/  # Remotion — tiene su propio package.json
│   └── src/compositions/ # TaxiReel, FrontSeatReel, etc.
├── CLAUDE.md             # Instrucciones del proyecto — leer siempre
└── .claude/
    ├── agents.md         # ← estás aquí
    ├── agents/           # Definiciones de agentes
    ├── context/          # Leer antes de trabajar
    │   ├── domain-patterns.md  # Audiencia, patrones de contenido, convenciones
    │   ├── corrections.md      # Log de errores ya cometidos (no repetir)
    │   ├── dont-do.md          # Decisiones descartadas (no re-proponer)
    │   └── voice.md            # Tono, micro-copy, reglas de escritura
    ├── specs/            # Una carpeta por feature
    ├── progress/         # Estado de sesión activa
    └── feature_list.json # Lista maestra de features
```

**Lo que NO está en este repo:**
- Credenciales → Notion: https://www.notion.so/337e9543180181c4a2ace9189e2e16fe
- Edge Functions deployadas: se despliegan via MCP `deploy_edge_function`. NUNCA via Management API PATCH (está roto — ver `context/dont-do.md`).

---

## 2. Stack

| Capa | Tech | Nota clave |
|------|------|-----------|
| Frontend | Next.js 15 + Tailwind | App router, src/app/. Claude Code edita directamente → git push = deploy Vercel |
| Video | Remotion 4.0.440 | editor-pro-max-main/, render local, sube a Supabase Storage |
| Backend | Supabase Edge Functions | Deno runtime. Source en docs/supabase/ |
| DB | Supabase PostgreSQL | Tablas principales: content_queue, content_ideas |
| Email | Brevo | 300 emails/día free tier |
| Publish | Meta Graph API | FB: 1068628786330276, IG: 17841480006391349 |
| Intel | HN Algolia API | Público, sin auth. 8 queries travel-focused. Reddit bloqueado. Apify trial expirado. |
| AI copy | Claude Haiku | claude-haiku-4-5-20251001 vía Supabase secret ANTHROPIC_API_KEY |
| Scheduler | pg_cron | Corre en Supabase. intel-gather: lunes 8am UTC. auto-publish: lun/mié/vie/dom 14:00 UTC |

---

## 3. Estados de tareas

```
pending → proposal_ready → spec_ready → in_progress → done
```

Una tarea **no se marca `done`** si `npx tsc --noEmit` falla.

---

## 4. Roles

| Agente | Responsabilidad |
|--------|----------------|
| `leader` | Orquesta el flujo. Decide qué agente activar y cuándo pausar. |
| `spec_author` | Solo en `sdd`. Genera proposal → requirements → design → tasks. |
| `implementer` | Ejecuta `tasks.md`. Contexto mínimo. Sin historial del padre. |
| `reviewer` | Valida contra spec, no contra el código. |

---

## 5. La memoria real está en archivos

El chat es volátil. Si necesitas saber el estado de algo:
- `progress/session_recovery.md` → qué se hizo y qué falta
- `specs/[feature]/` → decisiones técnicas tomadas
- `feature_list.json` → estado global
- `CLAUDE.md` → convenciones del proyecto

Nunca asumas que recuerdas algo de una sesión anterior.
