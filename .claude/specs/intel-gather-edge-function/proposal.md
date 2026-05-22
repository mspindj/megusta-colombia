# Proposal: intel-gather Edge Function

**Feature ID:** intel-gather-edge-function
**Fecha:** 2026-05-21
**Estado:** proposal_ready — esperando aprobación humana

---

## Qué se va a construir

Una Supabase Edge Function llamada `intel-gather` que corre automáticamente cada lunes a las 8am, scrapea Reddit con Apify buscando preguntas y conversaciones relevantes sobre viajes a Colombia, filtra los resultados por relevancia, y los inserta en la tabla `content_ideas` para revisión humana. Al terminar, envía un email de notificación con el conteo de ideas encontradas.

## Por qué

El `content_queue` lleva vacío desde el 28 de abril — más de 3 semanas sin publicar. El cuello de botella principal no es la publicación (está automatizada) sino la **ideación de contenido**: saber qué crear cada semana requiere investigar manualmente qué preguntan los turistas sobre Colombia.

Reddit es la fuente de mayor intención: los posts de `r/Colombia`, `r/bogota`, `r/medellin` y `r/digitalnomad` son preguntas reales de viajeros que son exactamente el cliente objetivo de Me Gusta Colombia. Un post con 50 upvotes sobre "taxis en Bogotá" es una señal directa de que ese contenido tiene demanda.

## Qué NO incluye este scope

- Scraping de Instagram (segunda fuente, se agrega en una iteración posterior)
- Generación automática de copy (es `generate-copy-edge-function`, feature separada)
- Aprobación automática de ideas (siempre pasa por revisión humana)
- Frontend para revisar ideas (se revisa directo en el dashboard de Supabase)

## Flujo en producción

```
pg_cron (lunes 8am UTC)
    → POST /functions/v1/intel-gather
        → Apify: correr Reddit actor con 4 subreddits
        → Esperar resultados (polling o webhook)
        → Filtrar: score >= 10, sin duplicados
        → INSERT content_ideas (source=reddit, status=pending)
    → Brevo: email a mspin.dj@gmail.com
        → "X ideas nuevas listas para revisar"
        → Link directo al dashboard de Supabase
```

## Riesgos identificados

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| APIFY_TOKEN no configurado como Supabase secret | Alta | Agregar como primer paso antes de deploy |
| Output schema del actor de Reddit cambia | Media | Mapeo defensivo con valores por defecto |
| pg_cron ya tiene 7 jobs activos — posible conflicto de scheduling | Baja | Verificar jobids existentes antes de crear el nuevo |
| Duplicados si el cron corre dos veces | Media | Check de URL duplicada antes de INSERT |
