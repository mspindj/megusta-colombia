# Requirements — colombia-taxi-calculator

**Feature:** Mini-app calculadora de taxis Colombia  
**Página:** `megusta.com.co/taxi`  
**Fecha:** 2026-05-22  
**Estado:** spec_ready

---

## Funcionales

---

## REQ-01 — Selector de ciudad
**Tipo:** Funcional  
**Descripción:** El usuario elige entre Bogotá, Medellín y Cartagena. El selector es el primer elemento visible de la calculadora. Al cambiar la ciudad se resetean los selectores de origen y destino.  
**Criterio de aceptación:**
- Tres opciones visibles: Bogotá, Medellín, Cartagena
- Cada ciudad usa su color de marca: `#e85d4f`, `#3cc878`, `#46a0d7`
- Cambiar ciudad limpia la selección de origen y destino
- Ciudad seleccionada queda visualmente activa (borde/fondo del color de ciudad)

---

## REQ-02 — Selector de origen y destino
**Tipo:** Funcional  
**Descripción:** Una vez elegida la ciudad, el usuario selecciona una ruta de una lista de opciones predefinidas. Las rutas se presentan como pares origen → destino en un selector dropdown o botones de selección.  
**Criterio de aceptación:**
- Solo se muestran rutas disponibles para la ciudad seleccionada
- Las opciones son las 8 rutas hardcodeadas (ver design.md)
- No hay campo de texto libre — solo selección de opciones predefinidas
- Si no hay ciudad seleccionada, los selectores de ruta están deshabilitados
- El placeholder comunica la acción: "Selecciona una ruta"

---

## REQ-03 — Tarjeta de resultado
**Tipo:** Funcional  
**Descripción:** Al seleccionar una ruta válida, se muestra inmediatamente la tarjeta de resultado con el precio justo versus el precio turista. La tarjeta es el elemento visual más impactante de la página.  
**Criterio de aceptación:**
- Precio justo: rango en COP (ej. $8.000 – $12.000)
- Precio turista: rango en COP (ej. $25.000 – $40.000)
- Diferencia en porcentaje calculada como `((turista_max / justo_max) - 1) * 100`, redondeada a número entero
- Nota contextual si existe (`nota` en la data)
- El contraste visual entre ambos precios es el hero: precio turista debe verse grande, en color de alerta o gold

---

## REQ-04 — CTA con captura de email
**Tipo:** Funcional  
**Descripción:** Debajo de la tarjeta de resultado, hay un CTA que invita al usuario a recibir el briefing completo de la ciudad seleccionada. El CTA abre un modal con un formulario de nombre y email.  
**Criterio de aceptación:**
- El CTA no aparece hasta que el usuario haya visto un resultado
- El texto del CTA incluye el nombre de la ciudad seleccionada: "Recibe el briefing completo de Bogotá"
- El modal contiene: campo nombre (requerido), campo email (requerido, validación formato), botón de submit
- El modal se puede cerrar sin enviar el formulario

---

## REQ-05 — Integración Brevo al submit del form
**Tipo:** Funcional  
**Descripción:** Al enviar el formulario, los datos se envían a Supabase Edge Function que registra el contacto en Brevo con el tag `source=taxi-calculator` y el nombre de la ciudad.  
**Criterio de aceptación:**
- POST a Supabase Edge Function (endpoint definido en design.md)
- El contacto queda en Brevo con los campos: nombre, email, source=taxi-calculator, ciudad seleccionada
- Si el submit es exitoso: el modal muestra confirmación ("Revisa tu email")
- Si hay error: mensaje de error accionable ("No se pudo guardar tu email. Intentá de nuevo.")
- El botón de submit muestra estado loading mientras espera la respuesta

---

## REQ-06 — Meta Pixel — base code en index.html
**Tipo:** Funcional  
**Descripción:** El base code del Pixel 1525809615712600 está incluido en el `<head>` del `index.html` del repo. Esto garantiza que `PageView` se dispara automáticamente en cada visita, incluyendo `/taxi`, sin depender del código React.  
**Criterio de aceptación:**
- El snippet de Pixel ID `1525809615712600` existe en el `<head>` de `index.html`
- El snippet es el estándar de Meta (no custom, no tag manager)
- El evento `PageView` se dispara automáticamente al cargar cualquier página

---

## REQ-07 — Meta Pixel — evento Lead
**Tipo:** Funcional  
**Descripción:** Al completar exitosamente el submit del formulario de email, el componente React dispara el evento `Lead` del Meta Pixel via `fbq('track', 'Lead')`.  
**Criterio de aceptación:**
- `fbq('track', 'Lead')` se llama exactamente una vez por submit exitoso
- NO se llama si el submit falla o si el servidor devuelve error
- Se llama después de recibir respuesta exitosa de la Edge Function, no antes

---

## REQ-08 — Ruta `/taxi` en el router
**Tipo:** Funcional  
**Descripción:** La calculadora es accesible en `megusta.com.co/taxi` como ruta independiente dentro del router de React.  
**Criterio de aceptación:**
- URL `/taxi` renderiza el componente `TaxiCalculator`
- La ruta no requiere autenticación
- La navegación desde la home hacia `/taxi` funciona sin recarga

---

## REQ-09 — SEO meta tags en /taxi
**Tipo:** Funcional  
**Descripción:** La página `/taxi` tiene meta tags específicos para capturar búsquedas orgánicas de precios de taxis en Colombia.  
**Criterio de aceptación:**
- `<title>`: "Calculadora de Taxis Colombia — Precio Justo vs Precio Turista | Me Gusta Colombia"
- `<meta name="description">`: "Bogotá: el taxi del aeropuerto cuesta $8.000 si sabés regatear. Turistas pagan $80.000. Calculá el precio justo antes de llegar."
- Open Graph tags: `og:title`, `og:description`, `og:url`

---

## No Funcionales

---

## REQ-10 — Mobile-first, 320px mínimo
**Tipo:** No funcional  
**Descripción:** El componente se diseña primero para pantallas de 320px de ancho. El flujo completo (selector → resultado → CTA → modal → confirmación) debe funcionar en un iPhone SE sin scroll horizontal.  
**Criterio de aceptación:**
- Sin overflow horizontal en 320px
- Tap targets ≥ 44px de alto
- El modal es full-screen en mobile o bottom sheet

---

## REQ-11 — Design system consistente
**Tipo:** No funcional  
**Descripción:** El componente usa el design system establecido del proyecto sin introducir colores, tipografías ni tamaños fuera del sistema.  
**Criterio de aceptación:**
- Background: `#0a0a0a`, Cards: `#141414`, Gold: `#d4a843`, Body text: `#aaaaaa`
- Colores de ciudad: Bogotá `#e85d4f`, Medellín `#3cc878`, Cartagena `#46a0d7`
- Sin colores fuera de este set

---

## REQ-12 — Precios hardcodeados, sin backend para la calculadora
**Tipo:** No funcional  
**Descripción:** Los precios de las rutas son un const TypeScript dentro del bundle del frontend. No requieren llamada a API ni Supabase para mostrar resultados. La única llamada de red en la calculadora es el submit del form.  
**Criterio de aceptación:**
- El resultado aparece de forma inmediata al seleccionar la ruta (sin loading state)
- El const de datos está en un archivo separado (`taxiData.ts`) fuera del componente principal

---

## REQ-13 — Sin dependencias de Google Maps u otras APIs de terceros
**Tipo:** No funcional  
**Descripción:** La calculadora no integra APIs de geolocalización ni mapas. Los precios son rangos por ruta predefinida, no cálculos dinámicos por distancia.  
**Criterio de aceptación:**
- Sin imports de `@googlemaps`, `mapbox`, `leaflet` u equivalentes
- Sin llamadas de red para mostrar el resultado de precio

---

*Última actualización: 2026-05-22*
