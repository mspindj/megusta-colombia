# Design — colombia-taxi-calculator

**Feature:** Mini-app calculadora de taxis Colombia  
**Fecha:** 2026-05-22

---

## Data Layer — taxiData.ts

Archivo: `src/data/taxiData.ts` (en el repo `colombia-intel-hub`)

```ts
export type TaxiRoute = {
  id: string
  ciudad: "bogota" | "medellin" | "cartagena"
  origen: string
  destino: string
  precioJusto: { min: number; max: number; moneda: "COP" }
  precioTurista: { min: number; max: number; moneda: "COP" }
  nota?: string
}

export const TAXI_ROUTES: TaxiRoute[] = [
  // BOGOTÁ
  {
    id: "bog-aeropuerto-zonarosa",
    ciudad: "bogota",
    origen: "Aeropuerto El Dorado",
    destino: "Zona Rosa / Usaquén",
    precioJusto: { min: 25000, max: 35000, moneda: "COP" },
    precioTurista: { min: 80000, max: 120000, moneda: "COP" },
    nota: "Acordá el precio ANTES de subir. Nunca aceptes el primer número.",
  },
  {
    id: "bog-candelaria-chapinero",
    ciudad: "bogota",
    origen: "La Candelaria",
    destino: "Chapinero",
    precioJusto: { min: 8000, max: 12000, moneda: "COP" },
    precioTurista: { min: 25000, max: 40000, moneda: "COP" },
    nota: "InDriver o Cabify desde Candelaria. Uber es irregular en esta zona.",
  },
  {
    id: "bog-zonarosa-usaquen",
    ciudad: "bogota",
    origen: "Zona Rosa",
    destino: "Usaquén",
    precioJusto: { min: 10000, max: 15000, moneda: "COP" },
    precioTurista: { min: 30000, max: 45000, moneda: "COP" },
    nota: "Trayecto corto. Si te cobran más de $15.000, bajate y pedí otro.",
  },
  // MEDELLÍN
  {
    id: "med-aeropuerto-poblado",
    ciudad: "medellin",
    origen: "Aeropuerto Rionegro (JMC)",
    destino: "El Poblado",
    precioJusto: { min: 45000, max: 60000, moneda: "COP" },
    precioTurista: { min: 120000, max: 180000, moneda: "COP" },
    nota: "45 min de autopista. El Uber Plus negro pide $90.000 — igual es la opción más segura.",
  },
  {
    id: "med-centro-poblado",
    ciudad: "medellin",
    origen: "Centro / Parque Berrío",
    destino: "El Poblado",
    precioJusto: { min: 8000, max: 12000, moneda: "COP" },
    precioTurista: { min: 28000, max: 40000, moneda: "COP" },
    nota: "El Metro llega al mismo destino por $3.500. Si tomás taxi, usá Uber.",
  },
  {
    id: "med-poblado-laureles",
    ciudad: "medellin",
    origen: "El Poblado",
    destino: "Laureles",
    precioJusto: { min: 8000, max: 10000, moneda: "COP" },
    precioTurista: { min: 25000, max: 35000, moneda: "COP" },
    nota: "Los locales toman la ruta por La 80. Taxi informal = markp gringo automático.",
  },
  // CARTAGENA
  {
    id: "cgt-aeropuerto-bocagrande",
    ciudad: "cartagena",
    origen: "Aeropuerto Rafael Núñez",
    destino: "Bocagrande",
    precioJusto: { min: 15000, max: 20000, moneda: "COP" },
    precioTurista: { min: 50000, max: 80000, moneda: "COP" },
    nota: "El markup gringo más alto del país. Fijá precio en el counter de taxis dentro del aeropuerto.",
  },
  {
    id: "cgt-getsemanio-centrohistorico",
    ciudad: "cartagena",
    origen: "Getsemaní",
    destino: "Centro Histórico",
    precioJusto: { min: 4000, max: 6000, moneda: "COP" },
    precioTurista: { min: 15000, max: 20000, moneda: "COP" },
    nota: "Son 10 minutos caminando. Si el taxista dice $15.000 — caminá.",
  },
]

export const CIUDAD_CONFIG = {
  bogota: {
    label: "Bogotá",
    color: "#e85d4f",
    tagline: "No dar papaya.",
  },
  medellin: {
    label: "Medellín",
    color: "#3cc878",
    tagline: "The Mirage is real.",
  },
  cartagena: {
    label: "Cartagena",
    color: "#46a0d7",
    tagline: "Cógela Suave.",
  },
} as const
```

**Helper functions** (en el mismo archivo):

```ts
export function formatCOP(value: number): string {
  return "$" + value.toLocaleString("es-CO")
}

export function calcMarkup(turista_max: number, justo_max: number): number {
  return Math.round(((turista_max / justo_max) - 1) * 100)
}

export function getRoutesByCity(ciudad: TaxiRoute["ciudad"]): TaxiRoute[] {
  return TAXI_ROUTES.filter((r) => r.ciudad === ciudad)
}
```

---

## Componentes React

### Árbol de componentes

```
/taxi (ruta)
└── TaxiCalculatorPage
    ├── TaxiCalculator            ← componente principal
    │   ├── CitySelector          ← 3 botones (Bogotá / Medellín / Cartagena)
    │   ├── RouteSelector         ← dropdown de rutas por ciudad
    │   ├── ResultCard            ← tarjeta precio justo vs turista
    │   └── EmailCaptureButton    ← CTA que abre el modal
    └── EmailCaptureModal         ← modal con form nombre+email
```

### TaxiCalculator — estado interno

```ts
type CalculatorState = {
  ciudad: TaxiRoute["ciudad"] | null
  selectedRouteId: string | null
}
```

La tarjeta de resultado se deriva directamente del estado: si `selectedRouteId !== null`, busca la ruta en `TAXI_ROUTES` y renderiza `ResultCard`. No hay estado de loading para el resultado.

### ResultCard — layout visual

La tarjeta tiene dos columnas:

| Columna izquierda | Columna derecha |
|-------------------|-----------------|
| "Precio justo" | "Precio turista" |
| `$8.000 – $12.000` (text verde/gold) | `$25.000 – $40.000` (text rojo/alerta) |
| Label: "COP" | Label: "COP" |

Debajo: línea divisoria → "Te están cobrando **X% más** del precio justo" en texto grande.  
Debajo: si existe `nota`, mostrarla en un callout con icono de información.

El número de markup (`X%`) es el elemento más impactante visualmente — debe ser el elemento de mayor tamaño tipográfico en la tarjeta.

### EmailCaptureModal

- Full-screen en mobile (bottom sheet o modal que ocupa ≥ 90% del viewport)
- Overlay oscuro semi-transparente detrás
- Campos: `nombre` (text, required), `email` (email, required)
- Botón submit: `"Recibe el briefing de {ciudad}"` — usa el color de la ciudad seleccionada
- Estados del botón: idle → loading (spinner) → success ("Revisa tu email") / error
- Al éxito: cerrar modal automáticamente después de 2s mostrando confirmación

---

## Meta Pixel — implementación

### Base code en index.html

El Pixel base code va en el `<head>` del `index.html` del repo `colombia-intel-hub`. Es el único archivo de frontend que Claude Code edita directamente (no va por Lovable).

Snippet exacto a insertar antes del cierre de `</head>`:

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1525809615712600');
fbq('track', 'PageView');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
    src="https://www.facebook.com/tr?id=1525809615712600&ev=PageView&noscript=1"/>
</noscript>
<!-- End Meta Pixel Code -->
```

### Evento Lead desde React

En `EmailCaptureModal`, después de recibir respuesta exitosa del Edge Function:

```ts
// Declarar fbq como global para TypeScript
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

// Al recibir respuesta exitosa:
if (typeof window.fbq === "function") {
  window.fbq("track", "Lead")
}
```

Esta comprobación con `typeof` evita errores en entornos donde el Pixel no cargó (adblockers, SSR).

---

## Edge Function — Integración Brevo

### Verificación del endpoint existente

El Edge Function `subscribe` en el proyecto `uocwxwvcrnkfnnoyjzyb` debe verificarse antes de usarlo. Si acepta un campo `source` y `city` en el body, se usa directamente. Si no, se crea una nueva function `taxi-subscribe`.

**Endpoint objetivo:** `POST https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/taxi-subscribe`

**Body esperado:**
```json
{
  "nombre": "string",
  "email": "string",
  "source": "taxi-calculator",
  "ciudad": "bogota" | "medellin" | "cartagena"
}
```

**Comportamiento de la function:**
1. Validar que `email` tiene formato válido — devolver 400 si no
2. Llamar a Brevo API `POST /v3/contacts` con:
   - `email`: el email del form
   - `attributes.FIRSTNAME`: el nombre del form
   - `attributes.SOURCE`: `"taxi-calculator"`
   - `attributes.CIUDAD`: ciudad en mayúsculas
   - `listIds`: [ID de la lista principal de Brevo] — mismo list ID que usa la function `subscribe` existente
3. Si el contacto ya existe en Brevo (409), igualmente devolver 200 (no es error para el usuario)
4. Devolver `{ success: true }` en 200, `{ error: "mensaje" }` en 4xx/5xx

**Headers de la function:**
```ts
// Sin JWT verification (como el resto de las functions del proyecto)
export const config = { auth: false }
```

**Secret requerido:** `BREVO_API_KEY` — ya existe en el proyecto (usado por otras functions).

---

## Ruta y SEO

### Router

En `src/App.tsx` o el archivo de routing del proyecto, agregar:

```tsx
<Route path="/taxi" element={<TaxiCalculatorPage />} />
```

### TaxiCalculatorPage — estructura

```tsx
export function TaxiCalculatorPage() {
  return (
    <>
      <Helmet>
        <title>Calculadora de Taxis Colombia — Precio Justo vs Precio Turista | Me Gusta Colombia</title>
        <meta
          name="description"
          content="Bogotá: el taxi del aeropuerto cuesta $8.000 si sabés regatear. Turistas pagan $80.000. Calculá el precio justo antes de llegar."
        />
        <meta property="og:title" content="Calculadora de Taxis Colombia | Me Gusta Colombia" />
        <meta
          property="og:description"
          content="Locales pagan $8.000. Turistas pagan $40.000. Mismo taxi. Calculá el precio justo de cualquier ruta."
        />
        <meta property="og:url" content="https://megusta.com.co/taxi" />
      </Helmet>
      <TaxiCalculator />
    </>
  )
}
```

Usar `react-helmet-async` si ya está en el proyecto. Si no, incluirlo en el prompt de Lovable.

---

## Diseño visual — especificaciones

### Tokens

| Token | Valor |
|-------|-------|
| `--bg` | `#0a0a0a` |
| `--card` | `#141414` |
| `--gold` | `#d4a843` |
| `--body` | `#aaaaaa` |
| `--bogota` | `#e85d4f` |
| `--medellin` | `#3cc878` |
| `--cartagena` | `#46a0d7` |
| `--white` | `#ffffff` |

### CitySelector

Tres botones en fila horizontal. En mobile, los tres caben en una fila de 320px.
- Estado inactivo: fondo `#141414`, borde `#333`, texto `#aaaaaa`
- Estado activo: borde del color de ciudad (2px), texto blanco, fondo con opacidad del color de ciudad al 15%
- Padding: 12px 16px, border-radius 8px

### ResultCard

Layout en dos columnas dentro de un card `#141414` con border del color de ciudad activo:

```
┌─────────────────────────────────────────────┐
│  🟢 PRECIO JUSTO        🔴 PRECIO TURISTA   │
│                                               │
│  $8.000 – $12.000       $25.000 – $40.000   │
│  COP                    COP                   │
├─────────────────────────────────────────────┤
│         Te cobran 233% más del precio justo  │
│         ↑ el número del markup es el hero    │
├─────────────────────────────────────────────┤
│  ℹ️  "Los locales toman la ruta por La 80..." │
└─────────────────────────────────────────────┘
```

El número del markup (`233%`) debe ser:
- Font-size: 48px en mobile, 64px en desktop
- Color: `#d4a843` (gold)
- Font-weight: 800

### EmailCaptureButton

- Fondo del color de la ciudad activa
- Texto blanco, bold
- Ancho 100% en mobile
- Solo visible después de que el usuario haya visto un resultado

---

## Lovable Prompt

Copiar el siguiente bloque completo y pegarlo en Lovable para generar el componente:

---

```
Creá los siguientes archivos en el proyecto megusta-colombia (Vite + React + TypeScript + shadcn/ui + Tailwind):

---

ARCHIVO 1: src/data/taxiData.ts

Contiene el const TAXI_ROUTES con 8 rutas de taxi en Colombia, el objeto CIUDAD_CONFIG con los 3 colores de ciudad, y 3 funciones helper (formatCOP, calcMarkup, getRoutesByCity).

Datos exactos:

type TaxiRoute = {
  id: string
  ciudad: "bogota" | "medellin" | "cartagena"
  origen: string
  destino: string
  precioJusto: { min: number; max: number; moneda: "COP" }
  precioTurista: { min: number; max: number; moneda: "COP" }
  nota?: string
}

const TAXI_ROUTES: TaxiRoute[] = [
  { id: "bog-aeropuerto-zonarosa", ciudad: "bogota", origen: "Aeropuerto El Dorado", destino: "Zona Rosa / Usaquén", precioJusto: { min: 25000, max: 35000, moneda: "COP" }, precioTurista: { min: 80000, max: 120000, moneda: "COP" }, nota: "Acordá el precio ANTES de subir. Nunca aceptes el primer número." },
  { id: "bog-candelaria-chapinero", ciudad: "bogota", origen: "La Candelaria", destino: "Chapinero", precioJusto: { min: 8000, max: 12000, moneda: "COP" }, precioTurista: { min: 25000, max: 40000, moneda: "COP" }, nota: "InDriver o Cabify desde Candelaria. Uber es irregular en esta zona." },
  { id: "bog-zonarosa-usaquen", ciudad: "bogota", origen: "Zona Rosa", destino: "Usaquén", precioJusto: { min: 10000, max: 15000, moneda: "COP" }, precioTurista: { min: 30000, max: 45000, moneda: "COP" }, nota: "Trayecto corto. Si te cobran más de $15.000, bajate y pedí otro." },
  { id: "med-aeropuerto-poblado", ciudad: "medellin", origen: "Aeropuerto Rionegro (JMC)", destino: "El Poblado", precioJusto: { min: 45000, max: 60000, moneda: "COP" }, precioTurista: { min: 120000, max: 180000, moneda: "COP" }, nota: "45 min de autopista. El Uber Plus negro pide $90.000 — igual es la opción más segura." },
  { id: "med-centro-poblado", ciudad: "medellin", origen: "Centro / Parque Berrío", destino: "El Poblado", precioJusto: { min: 8000, max: 12000, moneda: "COP" }, precioTurista: { min: 28000, max: 40000, moneda: "COP" }, nota: "El Metro llega al mismo destino por $3.500. Si tomás taxi, usá Uber." },
  { id: "med-poblado-laureles", ciudad: "medellin", origen: "El Poblado", destino: "Laureles", precioJusto: { min: 8000, max: 10000, moneda: "COP" }, precioTurista: { min: 25000, max: 35000, moneda: "COP" }, nota: "Los locales toman la ruta por La 80. Taxi informal = markup gringo automático." },
  { id: "cgt-aeropuerto-bocagrande", ciudad: "cartagena", origen: "Aeropuerto Rafael Núñez", destino: "Bocagrande", precioJusto: { min: 15000, max: 20000, moneda: "COP" }, precioTurista: { min: 50000, max: 80000, moneda: "COP" }, nota: "El markup gringo más alto del país. Fijá precio en el counter de taxis dentro del aeropuerto." },
  { id: "cgt-getsemanio-centrohistorico", ciudad: "cartagena", origen: "Getsemaní", destino: "Centro Histórico", precioJusto: { min: 4000, max: 6000, moneda: "COP" }, precioTurista: { min: 15000, max: 20000, moneda: "COP" }, nota: "Son 10 minutos caminando. Si el taxista dice $15.000 — caminá." },
]

const CIUDAD_CONFIG = {
  bogota: { label: "Bogotá", color: "#e85d4f", tagline: "No dar papaya." },
  medellin: { label: "Medellín", color: "#3cc878", tagline: "The Mirage is real." },
  cartagena: { label: "Cartagena", color: "#46a0d7", tagline: "Cógela Suave." },
}

function formatCOP(value: number): string {
  return "$" + value.toLocaleString("es-CO")
}

function calcMarkup(turista_max: number, justo_max: number): number {
  return Math.round(((turista_max / justo_max) - 1) * 100)
}

function getRoutesByCity(ciudad: TaxiRoute["ciudad"]): TaxiRoute[] {
  return TAXI_ROUTES.filter((r) => r.ciudad === ciudad)
}

Exportar todas las constantes, tipos y funciones.

---

ARCHIVO 2: src/components/TaxiCalculator.tsx

Componente principal. Usa los datos de taxiData.ts. Sin llamadas de red.

Estado interno:
- ciudad: "bogota" | "medellin" | "cartagena" | null — inicializa en null
- selectedRouteId: string | null — inicializa en null

UI:

1. CITY SELECTOR — tres botones en fila horizontal:
Botones: "Bogotá", "Medellín", "Cartagena"
Estilo inactivo: bg-[#141414] border border-[#333333] text-[#aaaaaa] rounded-lg px-4 py-3 text-sm font-medium
Estilo activo: depende de la ciudad seleccionada:
  - Bogotá activo: border-2 border-[#e85d4f] bg-[#e85d4f]/15 text-white
  - Medellín activo: border-2 border-[#3cc878] bg-[#3cc878]/15 text-white
  - Cartagena activo: border-2 border-[#46a0d7] bg-[#46a0d7]/15 text-white
Al hacer click en una ciudad: actualizar estado ciudad, resetear selectedRouteId a null

2. ROUTE SELECTOR — dropdown con rutas de la ciudad seleccionada:
Solo visible cuando ciudad !== null
Placeholder: "Selecciona una ruta"
Opciones: cada ruta como "origen → destino" (ej: "Aeropuerto El Dorado → Zona Rosa / Usaquén")
Estilo: bg-[#141414] border border-[#333333] text-white rounded-lg px-4 py-3 w-full
Al seleccionar: actualizar selectedRouteId

3. RESULT CARD — tarjeta de resultado:
Solo visible cuando selectedRouteId !== null
Encontrar la ruta: TAXI_ROUTES.find(r => r.id === selectedRouteId)
Border superior del color de la ciudad activa (4px solid)
Layout de dos columnas dentro del card:

Columna izquierda:
  - Label: "PRECIO JUSTO" en text-xs text-[#aaaaaa] uppercase tracking-widest
  - Precio: "{formatCOP(route.precioJusto.min)} – {formatCOP(route.precioJusto.max)}" en text-xl font-bold text-[#3cc878]
  - "COP" en text-xs text-[#aaaaaa]

Columna derecha:
  - Label: "PRECIO TURISTA" en text-xs text-[#aaaaaa] uppercase tracking-widest
  - Precio: "{formatCOP(route.precioTurista.min)} – {formatCOP(route.precioTurista.max)}" en text-xl font-bold text-[#e85d4f]
  - "COP" en text-xs text-[#aaaaaa]

Separador horizontal

Línea de markup:
  - Calcular: markup = calcMarkup(route.precioTurista.max, route.precioJusto.max)
  - "{markup}% más" en text-5xl font-extrabold text-[#d4a843] text-center
  - Texto debajo: "del precio justo" en text-sm text-[#aaaaaa] text-center

Si route.nota existe: callout con icono ℹ️, bg-[#1a1a1a] rounded-lg p-3, texto en text-sm text-[#aaaaaa]

4. EMAIL CAPTURE BUTTON:
Solo visible cuando selectedRouteId !== null
Texto: "Recibe el briefing completo de {CIUDAD_CONFIG[ciudad].label}"
Estilo: w-full py-4 rounded-lg font-bold text-white text-base
Color de fondo: el color de la ciudad activa (bg dinámico via style={{ backgroundColor: CIUDAD_CONFIG[ciudad].color }})
Al hacer click: llamar a onCapture() (prop del componente)

Props del componente:
  - onCapture: () => void — callback que el padre usa para abrir el modal

Estructura general del layout: max-w-lg mx-auto px-4 py-8 space-y-6, bg-[#0a0a0a]

---

ARCHIVO 3: src/components/EmailCaptureModal.tsx

Modal de captura de email. Recibe como props:
- isOpen: boolean
- onClose: () => void
- ciudad: "bogota" | "medellin" | "cartagena" | null
- onSuccess: () => void

UI:
- Overlay: fixed inset-0 bg-black/80 z-50
- Panel del modal: fixed bottom-0 left-0 right-0 (bottom sheet) bg-[#141414] rounded-t-2xl p-6 z-50
- En desktop (md:): centered modal max-w-md mx-auto

Contenido del modal:
- Botón X para cerrar (top right del panel)
- Título: "Recibe el briefing completo de {ciudad}" en font-bold text-white text-lg
- Subtítulo: "Tácticas de taxi + 50 situaciones para no dar papaya." en text-sm text-[#aaaaaa]

Form con dos campos:
1. nombre: input type="text" placeholder="Tu nombre" — requerido
2. email: input type="email" placeholder="tu@email.com" — requerido

Estilo de los inputs: bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white w-full focus:border-[color de ciudad]

Botón submit:
- Texto idle: "Recibir briefing gratis"
- Texto loading: spinner + "Enviando..."
- Texto success: "Revisa tu email"
- Texto error: "Intentá de nuevo"
- Color de fondo: color de la ciudad activa

Al submit:
1. Validar nombre y email
2. Hacer fetch POST a "https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/taxi-subscribe" con body JSON: { nombre, email, source: "taxi-calculator", ciudad }
3. Si éxito (200): llamar window.fbq("track", "Lead") si typeof window.fbq === "function", luego mostrar estado success, esperar 2000ms, llamar onSuccess() y onClose()
4. Si error: mostrar estado error con el mensaje

TypeScript: declarar interface Window { fbq?: (...args: unknown[]) => void } para evitar error de tipo.

---

ARCHIVO 4: src/pages/TaxiCalculatorPage.tsx

Page component para la ruta /taxi.

Usa useState para manejar isModalOpen: boolean
Usa CIUDAD_CONFIG para obtener la ciudad seleccionada (estado lifteado desde TaxiCalculator o prop drilling simple).

La estructura más simple: TaxiCalculator recibe un prop `onCapture` que llama `setIsModalOpen(true)`. EmailCaptureModal recibe `isOpen`, `onClose`, y `ciudad`.

El estado de `ciudad` también debe subir a TaxiCalculatorPage para que el modal sepa qué ciudad mostrar. TaxiCalculator recibe `ciudad` y `setCiudad` como props.

SEO con react-helmet-async (asumir que está instalado o instalarlo):
<Helmet>
  <title>Calculadora de Taxis Colombia — Precio Justo vs Precio Turista | Me Gusta Colombia</title>
  <meta name="description" content="Bogotá: el taxi del aeropuerto cuesta $8.000 si sabés regatear. Turistas pagan $80.000. Calculá el precio justo antes de llegar." />
  <meta property="og:title" content="Calculadora de Taxis Colombia | Me Gusta Colombia" />
  <meta property="og:description" content="Locales pagan $8.000. Turistas pagan $40.000. Mismo taxi. Calculá el precio justo de cualquier ruta." />
  <meta property="og:url" content="https://megusta.com.co/taxi" />
</Helmet>

---

ARCHIVO 5: Agregar ruta /taxi al router

En el archivo de routing existente (App.tsx o equivalente), agregar la ruta:
<Route path="/taxi" element={<TaxiCalculatorPage />} />

Si react-helmet-async no está instalado, instalarlo y envolver la app en <HelmetProvider>.

---

RESTRICCIONES:
- No instalar librerías de mapas (leaflet, mapbox, googlemaps)
- No hacer llamadas de red para mostrar el resultado de precio — es 100% local
- No agregar funcionalidad extra no especificada
- Todos los colores exactamente como están especificados
- El archivo taxiData.ts no debe estar embebido en el componente — debe ser un archivo separado
```

---

*Última actualización: 2026-05-22*
