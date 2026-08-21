import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import satori from "npm:satori@0.11.2";
import { initWasm, Resvg } from "npm:@resvg/resvg-wasm@2.4.1";

// carousel-slide — genera 1 slide de carrusel: foto real royalty-free de fondo
// (pasada por el caller, esta función no busca fotos) + overlay oscuro/dorado
// de marca + kicker + headline + contador de slide. Usada por idea-to-queue
// (automático, con búsqueda en Pexels) y también invocable directo con una
// photo_url manual para carruseles armados a mano.
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

let cachedFonts: Array<{ name: string; weight: 700 | 900; style: "normal"; data: ArrayBuffer }> | null = null;
async function loadFonts() {
  if (cachedFonts) return cachedFonts;
  const base = "https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans";
  const [bold, black] = await Promise.all([
    fetch(`${base}/NotoSans-Bold.ttf`).then((r) => r.arrayBuffer()),
    fetch(`${base}/NotoSans-Black.ttf`).then((r) => r.arrayBuffer()),
  ]);
  cachedFonts = [
    { name: "NotoSans", weight: 700, style: "normal", data: bold },
    { name: "NotoSans", weight: 900, style: "normal", data: black },
  ];
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
  kicker: string;
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

  const headlineSize = input.headline.length > 90 ? 44 : input.headline.length > 55 ? 52 : 64;
  const overlayOpacity = input.variant === "cover" ? 0.55 : 0.68;

  const svg = await satori(
    {
      type: "div",
      props: {
        style: { width: W, height: H, position: "relative", display: "flex", fontFamily: "NotoSans" },
        children: [
          { type: "img", props: { src: photoDataUri, width: W, height: H, style: { position: "absolute", top: 0, left: 0, objectFit: "cover" } } },
          {
            type: "div",
            props: {
              style: {
                position: "absolute", top: 0, left: 0, width: W, height: H,
                background: `linear-gradient(180deg, rgba(10,10,10,${overlayOpacity * 0.55}) 0%, rgba(10,10,10,${overlayOpacity * 0.35}) 35%, rgba(10,10,10,${overlayOpacity}) 68%, rgba(10,10,10,${Math.min(overlayOpacity + 0.2, 0.94)}) 100%)`,
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute", top: 56, left: 56, right: 56,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              },
              children: [
                { type: "span", props: { style: { fontFamily: "NotoSans", fontSize: 20, fontWeight: 700, letterSpacing: 4, color: "#d4a843", textTransform: "uppercase" }, children: input.kicker } },
                { type: "span", props: { style: { fontFamily: "NotoSans", fontSize: 20, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.65)" }, children: `${input.slide_number}/${input.total_slides}` } },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute", left: 56, right: 56, bottom: 72,
                display: "flex", flexDirection: "column",
              },
              children: [
                { type: "div", props: { style: { width: 90, height: 4, background: "#d4a843", marginBottom: 28 } } },
                { type: "h1", props: { style: { margin: 0, fontFamily: "NotoSans", fontSize: headlineSize, fontWeight: 900, lineHeight: 1.2, color: "#ffffff" }, children: input.headline } },
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
