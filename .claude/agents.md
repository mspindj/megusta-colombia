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

---

## 1. Mapa del repositorio

```
megusta-colombia/
├── src/app/              # Next.js 15 app router. Página principal: page.tsx
├── public/               # Assets estáticos de Next.js
├── PDFs/                 # Guías de ciudades — NO editar directamente
├── posts/                # Contenido de posts generados
├── music/                # Beats Ableton para Reels
├── social assets/        # Banners y templates de redes sociales
├── reference/            # Material de referencia — NO editar
├── docs/
│   ├── supabase/         # SQL migrations y configuración de Edge Functions
│   ├── emails/           # Templates de Brevo
│   └── reels/            # Scripts de Reels
├── editor-pro-max-main/  # Subproyecto Remotion — tiene su propio package.json
│   ├── src/compositions/ # Reels de Me Gusta (TaxiReel, FrontSeatReel, etc.)
│   └── src/templates/    # Templates genéricos (Instagram, TikTok, YouTube)
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
- Supabase Edge Functions → desplegadas via CLI o dashboard (ver docs/supabase/)
- Credenciales → Notion: https://www.notion.so/337e9543180181c4a2ace9189e2e16fe

---

## 2. Stack

| Capa | Tech | Nota clave |
|------|------|-----------|
| Frontend | Next.js 15 + Tailwind | App router, src/app/ |
| Video | Remotion 4.0.440 | editor-pro-max-main/, render local por ahora |
| Backend | Supabase Edge Functions | Deno runtime, NO en este repo |
| DB | Supabase PostgreSQL | Tablas: content_queue, content_ideas |
| Email | Brevo | 300 emails/día free tier |
| Publish | Meta Graph API | FB: 1068628786330276, IG: 17841480006391349 |
| Intel | Apify | Token en APIFY_TOKEN env var |
| AI copy | Claude Haiku | sk-ant en Notion → Supabase secrets |
| Scheduler | pg_cron | Corre en Supabase, no en este repo |

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
