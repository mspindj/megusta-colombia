"use client";

import { useState } from "react";
import {
  TAXI_ROUTES,
  CIUDAD_CONFIG,
  formatCOP,
  calcMarkup,
  getRoutesByCity,
  type TaxiRoute,
} from "@/data/taxiData";

type Ciudad = TaxiRoute["ciudad"];

interface TaxiCalculatorProps {
  ciudad: Ciudad | null;
  setCiudad: (c: Ciudad | null) => void;
  onCapture: () => void;
}

export function TaxiCalculator({ ciudad, setCiudad, onCapture }: TaxiCalculatorProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const ciudades: Ciudad[] = ["bogota", "medellin", "cartagena"];
  const routes = ciudad ? getRoutesByCity(ciudad) : [];
  const selectedRoute = TAXI_ROUTES.find((r) => r.id === selectedRouteId) ?? null;

  function handleCiudadClick(c: Ciudad) {
    setCiudad(c);
    setSelectedRouteId(null);
  }

  const cityColor = ciudad ? CIUDAD_CONFIG[ciudad].color : "#d4a843";

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <p className="text-xs tracking-widest uppercase text-[#aaaaaa]">Me Gusta Colombia</p>
        <h1 className="text-2xl font-bold text-white leading-tight">
          Calculadora de taxis
        </h1>
        <p className="text-sm text-[#aaaaaa]">
          Locales pagan $8.000. Turistas pagan $40.000. Mismo taxi.
        </p>
      </div>

      {/* City Selector */}
      <div className="flex gap-2">
        {ciudades.map((c) => {
          const isActive = ciudad === c;
          const color = CIUDAD_CONFIG[c].color;
          return (
            <button
              key={c}
              onClick={() => handleCiudadClick(c)}
              className="flex-1 rounded-lg px-3 py-3 text-sm font-medium transition-all border"
              style={
                isActive
                  ? {
                      borderColor: color,
                      borderWidth: 2,
                      backgroundColor: `${color}22`,
                      color: "#ffffff",
                    }
                  : {
                      borderColor: "#333333",
                      borderWidth: 1,
                      backgroundColor: "#141414",
                      color: "#aaaaaa",
                    }
              }
            >
              {CIUDAD_CONFIG[c].label}
            </button>
          );
        })}
      </div>

      {/* Route Selector */}
      {ciudad && (
        <div>
          <select
            value={selectedRouteId ?? ""}
            onChange={(e) => setSelectedRouteId(e.target.value || null)}
            className="w-full rounded-lg px-4 py-3 text-white text-sm bg-[#141414] border border-[#333333] focus:outline-none appearance-none"
            style={{ colorScheme: "dark" }}
          >
            <option value="">Selecciona una ruta</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.origen} → {r.destino}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Result Card */}
      {selectedRoute && (
        <div
          className="rounded-xl bg-[#141414] overflow-hidden"
          style={{ borderTop: `4px solid ${cityColor}` }}
        >
          <div className="p-5 space-y-4">
            {/* Price columns */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-[#aaaaaa]">Precio justo</p>
                <p className="text-lg font-bold text-[#3cc878]">
                  {formatCOP(selectedRoute.precioJusto.min)} –{" "}
                  {formatCOP(selectedRoute.precioJusto.max)}
                </p>
                <p className="text-xs text-[#aaaaaa]">COP</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-[#aaaaaa]">Precio turista</p>
                <p className="text-lg font-bold text-[#e85d4f]">
                  {formatCOP(selectedRoute.precioTurista.min)} –{" "}
                  {formatCOP(selectedRoute.precioTurista.max)}
                </p>
                <p className="text-xs text-[#aaaaaa]">COP</p>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#2a2a2a]" />

            {/* Markup */}
            <div className="text-center space-y-1">
              <p
                className="font-extrabold leading-none"
                style={{ fontSize: "clamp(48px,12vw,64px)", color: "#d4a843" }}
              >
                {calcMarkup(
                  selectedRoute.precioTurista.max,
                  selectedRoute.precioJusto.max
                )}
                % más
              </p>
              <p className="text-sm text-[#aaaaaa]">del precio justo</p>
            </div>

            {/* Note */}
            {selectedRoute.nota && (
              <div className="rounded-lg bg-[#1a1a1a] p-3 flex gap-2">
                <span className="text-sm shrink-0">ℹ️</span>
                <p className="text-sm text-[#aaaaaa]">{selectedRoute.nota}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA Button */}
      {selectedRoute && ciudad && (
        <button
          onClick={onCapture}
          className="w-full py-4 rounded-lg font-bold text-white text-base transition-opacity hover:opacity-90"
          style={{ backgroundColor: cityColor }}
        >
          Recibe el briefing completo de {CIUDAD_CONFIG[ciudad].label}
        </button>
      )}
    </div>
  );
}
