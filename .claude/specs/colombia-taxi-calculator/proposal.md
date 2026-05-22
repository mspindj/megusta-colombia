# Proposal: Calculadora de Taxis Colombia

**Feature ID:** colombia-taxi-calculator  
**Fecha:** 2026-05-22  
**Estado:** proposal_ready — esperando aprobación humana

---

## Qué se va a construir

Una página en `megusta.com.co/taxi` con una calculadora interactiva que muestra el precio justo de un taxi entre dos puntos de Colombia, versus el precio que le cobran al turista. El usuario ingresa ciudad + barrio de origen + destino, ve el contraste de precios, y al final se le pide el email para recibir el briefing completo de seguridad. Meta Pixel instalado desde el primer día para capturar la audiencia y hacer retargeting.

## Por qué

El hook más compartido del proyecto es "Locales pagan $8. Turistas pagan $40. Mismo taxi." — es el insight que más resuena porque es verificable y específico. Una calculadora interactiva convierte ese insight en una **herramienta**, que:

1. Tiene shareable value (la gente la comparte porque es útil)
2. Captura intención altísima: alguien que busca "taxi precio Bogotá" ya está planeando un viaje
3. Construye la lista de Brevo con leads calificados (van a Colombia próximamente)
4. Crea una audiencia de Pixel para retargeting con el briefing de $17

Sin Pixel desde el inicio, cada visita orgánica se pierde. Con Pixel, construimos la audiencia aunque aún no paguemos pauta.

## Flujo en producción

```
Usuario llega a megusta.com.co/taxi
    → Selecciona ciudad (Bogotá / Medellín / Cartagena)
    → Ingresa origen y destino (texto libre o selector de barrios populares)
    → Ve resultado: "Precio justo: $8.000 COP / Precio turista: $32.000 COP"
    → CTA: "Recibe el briefing completo de $CIUDAD"
        → Modal con form: nombre + email
        → Submit → Supabase Edge Function → Brevo automation
        → Redirect o confirmación: "Revisa tu email"
Meta Pixel registra PageView + Lead event en el submit
```

## Qué NO incluye este scope

- Integración con Google Maps / cálculo dinámico por distancia real (los precios son rangos por zona, no cálculo GPS)
- Soporte de más ciudades (Cali, Barranquilla) — se agrega después como expansión
- Sistema de reseñas o feedback de precios
- Pago directo en la página (el upsell va por email, no en la calculadora)
- Dashboard de admin para actualizar precios (los precios van hardcodeados en el primer ciclo)

## Stack

- **Frontend:** Lovable (Vite + React + shadcn/ui) — Claude Code produce el prompt, usuario lo pega en Lovable
- **Meta Pixel:** Script tag en el `<head>`, eventos: `PageView` (automático) + `Lead` (al submit del form)
- **Backend email capture:** Supabase Edge Function existente o nueva ruta en `subscribe` function
- **Email automation:** Brevo — misma lista de leads, automation existente o rama nueva por source=taxi

## Precio de los datos

Los rangos de precios se extraen del corpus existente del proyecto (briefings, Notion) + conocimiento directo. No requieren scraping. Se hardcodean para el MVP y se actualizan manualmente si cambian.

| Ciudad | Zona | Precio justo | Precio turista |
|--------|------|-------------|----------------|
| Bogotá | Aeropuerto → Zona Rosa | $25.000 | $80.000–$120.000 |
| Bogotá | Candelaria → Chapinero | $8.000 | $25.000–$40.000 |
| Medellín | Aeropuerto → El Poblado | $50.000 (taxi) / $90.000 (Uber negro) | $150.000+ |
| Medellín | Centro → El Poblado | $8.000–$12.000 | $30.000–$40.000 |
| Cartagena | Aeropuerto → Bocagrande | $15.000–$20.000 | $50.000–$80.000 |
| Cartagena | Getsemaní → Centro Hist. | $5.000 | $15.000–$20.000 |

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Meta Pixel requiere token Meta válido | El PAGE_TOKEN en Supabase secrets está inválido. Bloqueante para configurar Business Manager + Pixel. Resolución: usuario renueva token antes de que arranque el spec |
| Lovable puede cambiar el markup y romper el Pixel event | El Pixel script va en el `<head>` del `index.html` — fuera de los componentes React que Lovable modifica |
| Los precios se desactualicen | Primera versión hardcodeada, se documenta como "verificados mayo 2026" — bajo riesgo en el corto plazo |

## Métricas de éxito

- Pixel acumula ≥ 500 visitantes en los primeros 30 días (threshold mínimo para retargeting en Meta)
- Conversión form: ≥ 10% de visitantes dejan email
- Al tener ≥ 1000 en el Pixel: lanzar primer lookalike + retargeting campaign de $5/día

---

**Prerequisito desbloqueante:** META_PAGE_TOKEN válido en Supabase secrets.  
Una vez que el token esté renovado, arrancar con requirements.md → design.md → tasks.md.
