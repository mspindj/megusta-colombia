"use client";

import { useState } from "react";
import { CIUDAD_CONFIG, type TaxiRoute } from "@/data/taxiData";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type Ciudad = TaxiRoute["ciudad"];

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  ciudad: Ciudad | null;
  onSuccess: () => void;
}

type SubmitState = "idle" | "loading" | "success" | "error";

const TAXI_SUBSCRIBE_URL =
  "https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/taxi-subscribe";

export function EmailCaptureModal({
  isOpen,
  onClose,
  ciudad,
  onSuccess,
}: EmailCaptureModalProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const cityColor = ciudad ? CIUDAD_CONFIG[ciudad].color : "#d4a843";
  const cityLabel = ciudad ? CIUDAD_CONFIG[ciudad].label : "Colombia";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch(TAXI_SUBSCRIBE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          email,
          source: "taxi-calculator",
          ciudad: ciudad ?? "general",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al suscribirse");
      }

      // Fire Meta Pixel Lead event
      if (typeof window.fbq === "function") {
        window.fbq("track", "Lead");
      }

      setState("success");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setErrorMsg(msg);
      setState("error");
    }
  }

  const buttonLabel =
    state === "loading"
      ? "Enviando..."
      : state === "success"
      ? "Revisa tu email"
      : state === "error"
      ? "Intentá de nuevo"
      : "Recibir briefing gratis";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-[#141414] p-6 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:w-full md:rounded-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#aaaaaa] hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="space-y-4">
          <div className="space-y-1 pr-6">
            <h2 className="text-lg font-bold text-white">
              Briefing completo de {cityLabel}
            </h2>
            <p className="text-sm text-[#aaaaaa]">
              Tácticas de taxi + 50 situaciones para no dar papaya.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Tu nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={state === "loading" || state === "success"}
              className="w-full rounded-lg px-4 py-3 text-white text-sm bg-[#0a0a0a] border border-[#333333] focus:outline-none disabled:opacity-50"
              style={{ colorScheme: "dark" }}
            />
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={state === "loading" || state === "success"}
              className="w-full rounded-lg px-4 py-3 text-white text-sm bg-[#0a0a0a] border border-[#333333] focus:outline-none disabled:opacity-50"
              style={{ colorScheme: "dark" }}
            />

            {errorMsg && (
              <p className="text-xs text-[#e85d4f]">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={state === "loading" || state === "success"}
              className="w-full py-4 rounded-lg font-bold text-white text-base transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: cityColor }}
            >
              {state === "loading" && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {buttonLabel}
            </button>
          </form>

          <p className="text-xs text-[#555555] text-center">
            Sin spam. Te llega una vez.
          </p>
        </div>
      </div>
    </>
  );
}
