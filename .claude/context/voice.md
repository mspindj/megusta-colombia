# voice.md — Cómo habla Me Gusta Colombia

> Los agentes leen este archivo antes de generar cualquier copy, email subject, notificación, estado vacío, label de botón o mensaje de error.

---

## Principio central

Somos el amigo local que te tuitea la info antes de que llegues.
Una idea. Una línea. Sin setup.

**No somos:** una agencia de viajes, una marca corporativa, una guía genérica.
**Somos:** inteligencia táctica de alguien que vivió en Colombia y sabe cómo no cometer errores.

---

## Formato: tuiteo, no voceo

**[Actualizado 2026-05-22]** El tono pasó de "voice note" a "tweet". Mismo contenido, más comprimido.

| Antes (voceo) | Ahora (tuiteo) |
|---------------|----------------|
| "Este es el error que comete el 80% de los turistas en El Dorado." | "80% de los turistas pagan $32 extra en El Dorado." |
| "Si llegás al aeropuerto y no sabés a dónde ir, lo primero que vas a hacer es..." | "Llegaste al aeropuerto. Paso 1: ignora a todo el que se te acerque." |
| "Descubrimos que hay una diferencia significativa entre el precio que pagan los locales..." | "Locales pagan $8. Turistas pagan $40. Mismo taxi." |

**Regla de oro del tuiteo:** si no entraría en 280 caracteres, está largo.

---

## Tono por contexto

| Contexto | Tono | Ejemplo correcto | Ejemplo incorrecto |
|----------|------|------------------|--------------------|
| Hook de post | Shock / pérdida | "Perdiste $32 en el aeropuerto y ni te diste cuenta." | "¡Descubre los mejores tips de Colombia!" |
| Body de email | Conversacional insider | "Este es el error que comete el 80% de los turistas en El Dorado." | "Nos complace compartir esta información con usted." |
| CTA | Directo, sin presión | "Léelo en el avión: megusta.com.co" | "¡Compra ahora y no te lo pierdas!" |
| Notificación de sistema | Funcional, sin relleno | "☕ 3 ideas nuevas para revisar" | "¡Excelentes noticias! Tu agente de contenido encontró..." |
| Error de sistema | Claro, accionable | "intel-gather falló: APIFY_TOKEN no configurado." | "Ha ocurrido un error inesperado. Por favor intente más tarde." |
| Estado vacío | Honesto | "Nada nuevo esta semana en los subreddits." | "No se encontraron resultados." |
| Subject de email | Número o pérdida específica | "El taxi de $40 que todos pagan en Bogotá" | "Novedades de Me Gusta Colombia" |

---

## Reglas de escritura

1. **Una idea por oración.** Si tiene dos ideas, son dos oraciones.
2. **Números específicos siempre.** "$8" no "barato". "30 posts" no "muchos posts".
3. **Voz activa.** "El taxista te cobra $40" no "Se cobra $40 al turista".
4. **Sin calificativos vacíos.** "Mejor", "increíble", "perfecto" no dicen nada.
5. **El CTA va primero o segundo**, no al final de un muro de texto.
6. **Sin signos de exclamación** en copy serio. Un amigo no te grita.
7. **Máximo 3 oraciones por párrafo.** Si son 4, parte en dos párrafos.

---

## Palabras de la marca

Usar con naturalidad cuando apliquen:
- **"No dar papaya"** — el principio de seguridad central del producto
- **"Intel" / "inteligencia táctica"** — lo que vendemos, no "guía" ni "tips"
- **"Briefing"** — para describir el formato (no "guía de viaje")
- **"El juego"** — como en "entender el juego local"
- **"Markup gringo"** — el precio diferenciado que pagan los turistas

---

## Micro-copy de sistema (emails de Edge Functions)

Los emails automáticos son funcionales, no marketing. Tono: café de la mañana, no newsletter.

- **Subjects de éxito:** `☕ {N} ideas nuevas para Me Gusta Colombia` — emoji de café, número real, sin exclamación
- **Subjects de error:** `🚨 intel-gather falló — {mensaje corto}` — claro, no alarmista
- **Sender siempre:** `Me Gusta Colombia <hello@megusta.com.co>`
- **Link al dashboard:** texto del link = "→ Abrir dashboard de Supabase", no "haz clic aquí"
