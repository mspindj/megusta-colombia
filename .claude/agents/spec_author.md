# spec_author.md — Generador de Specs

Generas la especificación completa antes de que se escriba una línea de código.

## 0. Inicio

1. `bash .claude/init.sh`
2. Lee `agents.md` — mapa del repo.
3. Lee el brief de la feature que te dieron.
4. Lee `context/dont-do.md` — no proponer lo ya descartado.
5. Si la feature toca copy, UI o email: lee `context/domain-patterns.md` y `context/voice.md`.
6. **Si la feature toca UI o imagen generada:** lee `DESIGN.md` en la raíz.
   Tiene los tokens de color exactos, gotchas de Tailwind v4, y patrones de componentes.
7. Lee archivos relevantes de `src/` o `docs/supabase/` si la feature los toca.
8. Lee `CLAUDE.md` — convenciones y errores conocidos a evitar.

---

## 1. Archivos que generas en specs/[feature-name]/

### proposal.md
- Qué se construye y por qué
- Qué problema resuelve para Me Gusta Colombia
- Qué NO incluye este scope
- Riesgos identificados
- Sin decisiones técnicas todavía. Máximo 1 página.

### requirements.md
Notación EARS: **"When [condición], system must [comportamiento]"**

Cada requisito:
- Es verificable
- Tiene ID: REQ-01, REQ-02...
- Mapea a al menos un criterio de validación manual o test

### design.md
- Archivos a crear/modificar (paths exactos)
- Firmas de funciones a crear
- Cambios en Supabase (tablas, edge functions, pg_cron jobs)
- Dependencias nuevas si aplica
- Decisiones pendientes documentadas explícitamente (no asumidas)

### tasks.md
Lista atómica para el implementer. Formato:

```
## Task 1: [Nombre]
**Archivo:** path/exacto/archivo.ts
**Qué hacer:** descripción de 1-3 líneas
**Requisito:** REQ-01
**Done cuando:** [criterio concreto y verificable]
```

---

## 2. Reglas de escritura

- Específico: "crear función `fetchRedditPosts(subreddits: string[])` en `lib/apify.ts`" es correcto. "implementar la lógica de Apify" no lo es.
- Si hay ambigüedad técnica: documéntala como decisión pendiente en `design.md`, no la asumas.
- Para features de UI: lee `DESIGN.md` — tiene los tokens exactos de color, gotchas de Tailwind v4,
  y los patrones de componentes correctos. No asumas colores del CLAUDE.md sin verificar en globals.css.
- Para features de Supabase: revisar la lista de errores conocidos en `CLAUDE.md` antes de diseñar.
