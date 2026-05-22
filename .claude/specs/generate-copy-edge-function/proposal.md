# Proposal: generate-copy Edge Function (idea aprobada → content_queue)

**Feature ID:** generate-copy-edge-function  
**Fecha:** 2026-05-22  
**Estado:** proposal_ready — esperando aprobación humana

---

## Qué se va a construir

Una Edge Function llamada `idea-to-queue` que se activa automáticamente cuando una idea en `content_ideas` cambia a `status = 'approved'`. La función toma el título y URL del post de Reddit, genera un caption de Instagram + hashtags via Claude Haiku, y lo inserta en `content_queue` con la próxima fecha de publicación disponible.

**Nota:** La función existente `generate-copy` genera copy por ciudad hacia Notion. Esta es una función distinta con un propósito distinto. No se toca `generate-copy`.

---

## Por qué

La pipeline de contenido está rota en el medio:

```
intel-gather (✅ listo) → content_ideas → [HUECO] → content_queue → auto-publish (✅ listo)
```

El queue lleva vacío desde el 28 de abril — 24 días sin publicar. El cuello de botella es ese hueco: cuando se aprueba una idea, alguien tiene que manualmente escribir el caption, calcular la fecha, e insertarla en la tabla. Eso nunca pasa.

Esta función cierra ese hueco: aprobar una idea en el dashboard de Supabase es todo lo que hace falta para que aparezca un post programado.

---

## Flujo completo post-implementación

```
Lunes 8am: intel-gather corre
  → 20-40 ideas nuevas en content_ideas (status=pending)

Humano revisa en dashboard (~5 min)
  → Cambia status a 'approved' en las ideas que le gustan

DB trigger detecta el cambio
  → Llama idea-to-queue con el idea_id

idea-to-queue:
  → Lee la idea (título, URL, origin)
  → Claude Haiku genera caption IG + hashtags
  → Calcula próximo slot libre (Lun/Mié/Vie/Dom)
  → INSERT en content_queue
  → auto-publish lo publica en su fecha
```

---

## Qué NO incluye este scope

- Copy para Facebook o Pinterest (solo Instagram por ahora)
- Generación de imagen para el post (se usa `content_type='image'` pero la imagen la sube Miguel manualmente o en fase futura)
- Revisión del copy antes de publicar (se confía en Haiku + el humano puede editar en el dashboard antes de la fecha)
- UI para aprobar ideas (siempre en el dashboard de Supabase)
- Modificar la función `generate-copy` existente

---

## Mecanismo de trigger propuesto

Un **trigger de base de datos** en `content_ideas` que detecta el cambio `status → 'approved'` y llama a la Edge Function via `net.http_post`. Es reactivo (dispara inmediatamente al aprobar), no requiere polling, y es consistente con el patrón ya usado en pg_cron.

---

## Cálculo de fecha de publicación

El cron de auto-publish corre lunes, miércoles, viernes y domingo a las 2pm UTC (jobid 7). La función debe calcular el **próximo slot libre** = próximo día de publicación después de la última fecha en `content_queue`. Si ya hay 3 ideas aprobadas ese día, pasa al siguiente slot.

---

## Riesgos identificados

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| Trigger se dispara dos veces si el status se actualiza dos veces | Media | Check: si la idea ya tiene `generated_copy` no regenerar |
| Haiku genera copy fuera de brand voice | Media | System prompt con reglas explícitas de voice.md |
| Queue se llena de posts para la misma fecha si se aprueban muchas ideas rápido | Alta | Calcular fecha dinámicamente según cantidad de posts ya en queue |
| La idea de Reddit no tiene suficiente contexto para generar buen copy | Baja | Prompt incluye título + URL + subreddit de origen |
