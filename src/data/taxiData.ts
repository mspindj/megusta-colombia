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
    nota: "Los locales toman la ruta por La 80. Taxi informal = markup gringo automático.",
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
    id: "cgt-getsemani-centrohistorico",
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

export function formatCOP(value: number): string {
  return "$" + value.toLocaleString("es-CO")
}

export function calcMarkup(turistaMax: number, justoMax: number): number {
  return Math.round(((turistaMax / justoMax) - 1) * 100)
}

export function getRoutesByCity(ciudad: TaxiRoute["ciudad"]): TaxiRoute[] {
  return TAXI_ROUTES.filter((r) => r.ciudad === ciudad)
}
