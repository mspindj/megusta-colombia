# Fixes aplicados a la automation de Brevo — julio 2026

Cada archivo es el HTML completo y corregido de un paso de la automation real
(la que de verdad envía, no las copias standalone huérfanas — ver error #36
en el CLAUDE.md del proyecto). Pegar en Brevo: abrir el paso, editor de
código (no el de bloques), seleccionar todo, borrar, pegar el archivo
completo, guardar y activar.

| Archivo | Busca en Brevo el paso con subject | Estado |
|---|---|---|
| `day-00-cheat-sheet-id15.html` | "Your cheat sheet." | Ya aplicado (15 Jul) — fix del botón de descarga muerto (`{{CHEAT_SHEET_PDF_URL}}` → link real de Gumroad) |
| `day-05-city-picker-id18.html` | "Bogotá, Medellín, or Cartagena?" | Ya aplicado (15 Jul) — fix del botón del bundle (storefront genérico → `/l/explorer-bundle`) |
| `day-10-follow-up-id26.html` | "Meant to follow up" | **Pendiente de aplicar** — fix de unsubscribe |
| `day-12-laureles-id19.html` | "You'll probably book El Poblado." | **Pendiente de aplicar** — incluye el P.S. + botón agregado el 15 Jul MÁS el fix de unsubscribe |
| `day-16-sim-card-id20.html` | "SIM card in 30 minutes of landing." | **Pendiente de aplicar** — incluye el P.S. + botón agregado el 15 Jul MÁS el fix de unsubscribe |
| `day-19-budget-id21.html` | "What a week actually costs." | **Pendiente de aplicar** — fix de unsubscribe |
| `day-21-final-pitch-id27.html` | "Last one on this" | **Pendiente de aplicar** — fix de unsubscribe |
| `day-23-where-are-you-going-id22.html` | "Where are you going?" | **Pendiente de aplicar** — fix de unsubscribe |

## El bug de fondo (por qué hay que pegar el HTML completo y no solo cambiar un link)

Todos estos templates usaban `{{unsubscribeLink}}`, que no es un merge tag real
de Brevo — el botón de "Unsubscribe" nunca funcionó desde el día 10 en adelante.
Se cambió a `{{ unsubscribe }}` (el tag que sí funciona, comprobado con la única
desuscripción real registrada en 90 días, que fue justamente en el día 1).

Detalle completo en el CLAUDE.md del proyecto, jornada "24 Jul 2026 (noche)".
