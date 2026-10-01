import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import satori from "npm:satori@0.11.2";
import { initWasm, Resvg } from "npm:@resvg/resvg-wasm@2.4.1";

// carousel-slide — genera 1 slide de carrusel: foto real royalty-free de fondo
// (pasada por el caller, esta función no busca fotos) + degradado inferior solo
// para legibilidad + titular. Sin eyebrow/kicker, sin contador, sin regla dorada
// (prohibidos por impeccable craft-floor: un kicker sobre el titular es una
// prohibición absoluta, y Instagram ya muestra los puntos del carrusel).
// Usada por idea-to-queue (automático, con búsqueda en Pexels) y también
// invocable directo con una photo_url manual.
//
// Formato: 1080x1350 (4:5, estándar de carrusel IG). Sube a
// content/carousels/{filename} en Supabase Storage.
//
// Gotcha 2026-08-07: convertir una foto grande a base64 con
// btoa(String.fromCharCode(...bytes)) revienta el call stack ("Maximum call
// stack size exceeded") — hay que hacerlo en chunks (bytesToBase64 abajo).
// Igual, pedir la foto ya comprimida a Pexels (auto=compress&cs=tinysrgb&w=1080)
// evita el WORKER_RESOURCE_LIMIT que da si se le mete la foto a resolución completa.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = "https://uocwxwvcrnkfnnoyjzyb.supabase.co";
const STORAGE_BUCKET = "content";
const W = 1080;
const H = 1350; // 4:5, IG carousel standard

let wasmReady = false;
async function ensureWasm() {
  if (!wasmReady) {
    await initWasm(fetch("https://unpkg.com/@resvg/resvg-wasm@2.4.1/index_bg.wasm"));
    wasmReady = true;
  }
}

let cachedFonts: Array<{ name: string; weight: 400; style: "normal"; data: ArrayBuffer }> | null = null;
async function loadFonts() {
  if (cachedFonts) return cachedFonts;
  const data = await fetch("https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/dmserifdisplay/DMSerifDisplay-Regular.ttf").then((r) => r.arrayBuffer());
  cachedFonts = [{ name: "DMSerifDisplay", weight: 400, style: "normal", data }];
  return cachedFonts;
}

function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

async function photoToDataUri(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Photo fetch failed: ${res.status} ${url}`);
  const buf = await res.arrayBuffer();
  const b64 = bytesToBase64(new Uint8Array(buf));
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return `data:${contentType};base64,${b64}`;
}

interface SlideInput {
  photo_url: string;
  kicker?: string; // ignorado, se mantiene por compatibilidad con llamadas viejas
  headline: string;
  slide_number: number;
  total_slides: number;
  filename: string;
  variant: "cover" | "content" | "close";
}

async function generateSlide(input: SlideInput): Promise<Uint8Array> {
  await ensureWasm();
  const fonts = await loadFonts();
  const photoDataUri = await photoToDataUri(input.photo_url);

  const isCover = input.variant === "cover";
  const len = input.headline.length;
  const headlineSize = isCover
    ? (len > 80 ? 68 : len > 50 ? 76 : 88)
    : (len > 90 ? 56 : len > 60 ? 64 : 72);

  // Degradado solo en el tercio inferior: lo justo para contraste del titular
  // (>=4.5:1), sin apagar la foto entera.
  const svg = await satori(
    {
      type: "div",
      props: {
        style: { width: W, height: H, position: "relative", display: "flex", fontFamily: "DMSerifDisplay" },
        children: [
          { type: "img", props: { src: photoDataUri, width: W, height: H, style: { position: "absolute", top: 0, left: 0, objectFit: "cover" } } },
          {
            type: "div",
            props: {
              style: {
                position: "absolute", top: 0, left: 0, width: W, height: H,
                background: "linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0) 42%, rgba(10,10,10,0.62) 70%, rgba(10,10,10,0.9) 100%)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: { position: "absolute", left: 64, right: 64, bottom: 80, display: "flex" },
              children: [
                { type: "h1", props: { style: { margin: 0, fontFamily: "DMSerifDisplay", fontSize: headlineSize, fontWeight: 400, lineHeight: 1.12, letterSpacing: -1, color: "#ffffff" }, children: input.headline } },
              ],
            },
          },
        ],
      },
    },
    { width: W, height: H, fonts }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: W } });
  return resvg.render().asPng();
}

async function uploadToStorage(png: Uint8Array, fileName: string, jwt: string): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/carousels/${fileName}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "image/png", "x-upsert": "true" },
    body: png,
  });
  if (!res.ok) throw new Error(`Storage upload failed: ${res.status} ${await res.text()}`);
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/carousels/${fileName}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  try {
    const jwt = Deno.env.get("SERVICE_ROLE_JWT");
    if (!jwt) throw new Error("Missing env: SERVICE_ROLE_JWT");
    const body = await req.json();
    const slides: SlideInput[] = body.slides;
    if (!Array.isArray(slides) || slides.length === 0) throw new Error("Missing slides array");

    const results = [];
    for (const slide of slides) {
      const png = await generateSlide(slide);
      const url = await uploadToStorage(png, slide.filename, jwt);
      results.push({ filename: slide.filename, url });
    }

    return new Response(JSON.stringify({ ok: true, slides: results }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
});
