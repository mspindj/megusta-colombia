# Tasks — colombia-taxi-calculator

**Feature:** Mini-app calculadora de taxis Colombia  
**Fecha:** 2026-05-22  
**Orden de ejecución:** secuencial (cada task depende de la anterior para verificar)

---

## TASK-01 — Data layer: taxiData.ts

**Repo:** `colombia-intel-hub` (frontend, gestionado por Lovable)  
**Archivo objetivo:** `src/data/taxiData.ts`  
**Ejecutado por:** Lovable (incluido en el Lovable Prompt de design.md)

**Qué hace:**
- Crea el archivo con el tipo `TaxiRoute`, el const `TAXI_ROUTES` con las 8 rutas, el objeto `CIUDAD_CONFIG` y los 3 helpers (`formatCOP`, `calcMarkup`, `getRoutesByCity`)

**Criterio de completado:**
- El archivo existe en `src/data/taxiData.ts`
- TypeScript compila sin errores con este archivo
- `TAXI_ROUTES.length === 8`
- `getRoutesByCity("bogota").length === 3`
- `getRoutesByCity("medellin").length === 3`
- `getRoutesByCity("cartagena").length === 2`
- `calcMarkup(120000, 35000)` devuelve `243`
- `formatCOP(25000)` devuelve `"$25.000"`

---

## TASK-02 — UI componente TaxiCalculator

**Repo:** `colombia-intel-hub` (frontend, gestionado por Lovable)  
**Archivos objetivo:**
- `src/components/TaxiCalculator.tsx`
- `src/components/EmailCaptureModal.tsx`  
**Ejecutado por:** Lovable (incluido en el Lovable Prompt de design.md)

**Qué hace:**
- Crea el componente `TaxiCalculator` con los 4 elementos: CitySelector, RouteSelector, ResultCard y EmailCaptureButton
- El EmailCaptureButton y ResultCard solo aparecen después de seleccionar ruta
- Colores de ciudad aplicados según design.md
- El número de markup (`%`) es el elemento visualmente más grande del ResultCard

**Criterio de completado:**
- Al seleccionar "Bogotá" → aparecen las 3 rutas de Bogotá en el selector
- Al seleccionar ruta "Aeropuerto El Dorado → Zona Rosa / Usaquén" → ResultCard muestra "233%" (markup calculado de 120k/35k)
- Al cambiar de ciudad → RouteSelector se resetea y ResultCard desaparece
- EmailCaptureButton no aparece hasta que hay una ruta seleccionada
- Sin overflow horizontal en viewport de 320px

---

## TASK-03 — Modal de captura de email + integración Brevo

**Repo:** `colombia-intel-hub` (frontend) + Supabase proyecto `uocwxwvcrnkfnnoyjzyb` (backend)  
**Archivos objetivo:**
- `src/components/EmailCaptureModal.tsx` (frontend — Lovable)
- `supabase/functions/taxi-subscribe/index.ts` (backend — Claude Code)

**Sub-task 3a — Verificar función `subscribe` existente:**
- Revisar si `supabase/functions/subscribe/index.ts` acepta campos `source` y `ciudad`
- Si sí: agregar `source: "taxi-calculator"` y `ciudad` al call existente y usar ese endpoint
- Si no: crear nueva función `taxi-subscribe` con el spec de design.md

**Sub-task 3b — Crear/adaptar Edge Function:**
- Archivo: `supabase/functions/taxi-subscribe/index.ts`
- Sin JWT verification
- Body: `{ nombre, email, source, ciudad }`
- Llama a Brevo `POST /v3/contacts` con los campos especificados
- Devuelve 200 en éxito o si el contacto ya existe (409 de Brevo = 200 para el cliente)
- Secret usado: `BREVO_API_KEY` (ya existe en el proyecto)

**Sub-task 3c — Conectar modal con Edge Function:**
- `EmailCaptureModal.tsx` hace POST a la URL del endpoint
- Estados del botón: idle / loading / success / error
- Al success: dispara `fbq('track', 'Lead')` y cierra el modal después de 2s

**Criterio de completado:**
- Llenar el form con nombre y email válidos → el contacto aparece en Brevo con `source=taxi-calculator`
- Contacto ya existente → no muestra error al usuario
- Email inválido → el botón no se habilita (validación HTML5 o custom)
- Estado loading visible durante el POST
- Al éxito: modal cierra después de 2s con mensaje "Revisa tu email"
- Al error de red: texto de error accionable

---

## TASK-04 — Meta Pixel base code en index.html

**Repo:** `megusta-colombia` (repo local — este repo, NO colombia-intel-hub)  
**Archivo objetivo:** `index.html` (raíz del repo)  
**Ejecutado por:** Claude Code (edita directamente)

**Qué hace:**
- Inserta el snippet de Meta Pixel ID `1525809615712600` dentro del `<head>` del `index.html`
- El snippet va antes del cierre de `</head>`
- Incluye el `<noscript>` fallback

**Snippet exacto a insertar:** ver sección "Meta Pixel — implementación" en design.md

**Criterio de completado:**
- `index.html` contiene el string `fbq('init', '1525809615712600')`
- El snippet está dentro del `<head>`, antes de `</head>`
- El `<noscript>` fallback está presente
- `fbq('track', 'PageView')` está en el snippet (se dispara en cada carga de página)

**Verificación:**
```bash
grep -n "1525809615712600" /Users/nowheretraveler/Documents/dev/megusta-colombia/index.html
```
Debe devolver al menos 2 líneas (init + noscript).

---

## TASK-05 — Página /taxi en el router + SEO

**Repo:** `colombia-intel-hub` (frontend, gestionado por Lovable)  
**Archivos objetivo:**
- `src/pages/TaxiCalculatorPage.tsx`
- `src/App.tsx` (o el archivo de routing del proyecto)

**Ejecutado por:** Lovable (incluido en el Lovable Prompt de design.md)

**Qué hace:**
- Crea `TaxiCalculatorPage` con `<Helmet>` para los meta tags de SEO
- Conecta el estado compartido entre `TaxiCalculator` y `EmailCaptureModal`
- Agrega la ruta `/taxi` al router principal

**Criterio de completado:**
- `megusta.com.co/taxi` carga el componente `TaxiCalculator` sin 404
- `<title>` en la pestaña del browser es "Calculadora de Taxis Colombia — Precio Justo vs Precio Turista | Me Gusta Colombia"
- `<meta name="description">` tiene el texto especificado
- La ruta no requiere autenticación

---

## TASK-06 — Deploy y verificación

**Ejecutado por:** usuario (deploy en Lovable) + Claude Code (verificación del Pixel en megusta.com.co)

**Sub-task 6a — Deploy Lovable:**
- El usuario hace deploy desde Lovable del código generado en TASK-01, 02, 03b (modal), 05
- URL de verificación: `https://megusta.com.co/taxi`

**Sub-task 6b — Deploy Edge Function:**
- Si se creó nueva función `taxi-subscribe`:
  ```bash
  supabase functions deploy taxi-subscribe --project-ref uocwxwvcrnkfnnoyjzyb
  ```
- Verificar que `BREVO_API_KEY` está disponible en los secrets del proyecto

**Sub-task 6c — Verificar Pixel activo:**
- Instalar Meta Pixel Helper en Chrome
- Navegar a `megusta.com.co/taxi`
- Verificar: Pixel Helper muestra `PageView` al cargar
- Completar el form de email → Pixel Helper muestra `Lead`

**Sub-task 6d — Smoke test del flujo completo:**
1. Ir a `megusta.com.co/taxi`
2. Seleccionar "Medellín"
3. Seleccionar "Aeropuerto Rionegro → El Poblado"
4. Verificar que el ResultCard muestra precio justo y precio turista correctos
5. Hacer click en "Recibe el briefing completo de Medellín"
6. Completar el form con datos de prueba
7. Verificar que el contacto llega a Brevo con tag `source=taxi-calculator`
8. Verificar que el evento `Lead` aparece en Meta Pixel Helper

**Criterio de completado:**
- Los 8 pasos del smoke test pasan sin errores
- El Pixel muestra `PageView` en la carga y `Lead` en el submit
- El contacto de prueba aparece en Brevo con los campos correctos
- Sin errores en la consola del browser

---

## Dependencias entre tasks

```
TASK-01 (data) ──────┐
                      ├──→ TASK-02 (UI componentes) ──→ TASK-05 (ruta + SEO) ──┐
TASK-03a (verificar) ─┘                                                          ├──→ TASK-06 (deploy)
TASK-03b (edge fn) ───────────────────────────────────────────────────────────────┘
TASK-04 (pixel) ─────────────────────────────────────────────────────────────────┘
```

TASK-01, TASK-03a y TASK-04 pueden ejecutarse en paralelo.  
TASK-02 requiere TASK-01 completado.  
TASK-05 requiere TASK-02 completado.  
TASK-06 requiere TASK-03b, TASK-04 y TASK-05 completados.

---

## Notas de implementación

- **Lovable vs Claude Code:** TASK-01, 02, 03c, 05 van por Lovable (usar el Lovable Prompt de design.md). TASK-03b y TASK-04 los ejecuta Claude Code directamente.
- **Edge Function taxi-subscribe:** si se descubre que la función `subscribe` existente ya acepta `source` y `ciudad`, TASK-03b se reduce a adaptar el call desde el modal — no crear nueva función.
- **Meta Pixel en index.html:** este es el único archivo de frontend que Claude Code edita directamente, porque el `index.html` del repo local (`megusta-colombia`) se usa para alojar el Pixel fuera del alcance de Lovable.

---

*Última actualización: 2026-05-22*
