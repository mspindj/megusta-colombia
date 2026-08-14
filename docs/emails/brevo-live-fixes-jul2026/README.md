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

---

## Revisión del 13/08/2026: el paquete estaba incompleto

Se revisaron los seis pendientes antes de pegarlos en Brevo. El arreglo del
unsubscribe estaba bien en los seis, pero había dos cosas más:

**1. Cuatro CTA de $17 seguían apuntando al storefront genérico**, que es el
mismo bug que este README dice haber arreglado el 15 de julio en el día 5. Eran
botones dorados (`#d4a843`, el CTA primario del DESIGN.md) hacia
`megustacomco.gumroad.com` a secas: el lector aterrizaba en una tienda con cinco
productos sin saber cuál era el suyo.

Afectados: `day-10`, `day-16`, `day-19`, `day-21`.

Ahora van a `megusta.com.co/#cities`, conservando sus UTM. Se eligió la sección
de ciudades de la propia página y no el bundle porque el botón de $17 no puede
tener destino fijo (son tres ciudades) y ahí el lector elige con contexto. El
botón del bundle de $37 nunca estuvo roto y no se tocó.

**2. Cuatro archivos traían `utm_campaign=TEMPLATE_NAME` y `utm_id=TEMPLATE_ID`
sin rellenar**, incluidos los DOS QUE YA ESTÁN APLICADOS EN BREVO (`day-00` y
`day-05`). Todo su tráfico llegaba a analítica bajo una campaña llamada
literalmente "TEMPLATE_NAME", mezclando correos distintos.

Rellenados con la convención de los que sí tenían nombre:

| Archivo | utm_campaign | utm_id |
|---|---|---|
| `day-00-cheat-sheet-id15.html` | Lead Magnet Cheat Sheet D0 | 15 |
| `day-05-city-picker-id18.html` | Lead Magnet City Picker | 18 |
| `day-19-budget-id21.html` | Lead Magnet Budget D19 | 21 |
| `day-23-where-are-you-going-id22.html` | Lead Magnet Where Are You Going D23 | 22 |

**Ojo: `day-00` y `day-05` hay que volver a pegarlos en Brevo.** Ya estaban
aplicados con el marcador adentro.

### Estado tras la revisión

Los ocho archivos pasan: `{{ unsubscribe }}` correcto, cero `unsubscribeLink`,
cero marcadores `TEMPLATE_`, cero enlaces al storefront genérico, y el HTML
cierra en todos.

### Inconsistencia anotada, sin tocar

`day-10-follow-up-id26.html` usa `utm_id=14` y `day-21-final-pitch-id27.html`
usa `utm_id=15`, cuando sus nombres de archivo dicen id26 e id27. No se corrigió
porque no se sabe cuál de los dos números es el bueno: el del nombre o el que
ya está corriendo en Brevo. Verificar contra la automatización antes de cambiar.
