import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// edit-slide — corrige slides sueltos de un carrusel ya generado, sin regenerar el post entero.
// Recibe { edits: [{ filename, headline, query, city, variant, slide_number, total_slides, avoid_ids? }] }, busca una
// foto con alt colombiano en Pexels (mismo filtro que idea-to-queue) y vuelve a componer el slide con
// carousel-slide, sobrescribiendo el mismo filename en Storage. No toca content_queue ni el caption.
//
// Existe porque el texto de Haiku a veces trae una frase que no se puede publicar (dato sin fuente,
// consejo dudoso) y regenerar todo el carrusel cambia también las fotos y los otros slides buenos.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = "https://uocwxwvcrnkfnnoyjzyb.supabase.co";
const CAROUSEL_SLIDE_URL = `${SUPABASE_URL}/functions/v1/carousel-slide`;

const CITY_TERMS: Record<string, string[]> = {
  bogota: ["bogota", "chapinero", "candelaria", "monserrate", "usaquen", "transmilenio"],
  medellin: ["medellin", "comuna 13", "poblado", "laureles", "guatape", "arvi"],
  cartagena: ["cartagena", "getsemani", "bocagrande", "walled city", "castillo san felipe"],
};
const COLOMBIA_TERMS = [
  "colombia", "colombian", "bogota", "medellin", "cartagena", "comuna 13", "candelaria", "chapinero", "usaquen",
  "laureles", "poblado", "getsemani", "transmilenio", "monserrate", "guatape", "arvi", "paisa", "palenquera",
  "san felipe", "santo domingo", "bocagrande", "zona g", "el dorado", "cali", "antioquia", "cundinamarca",
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function cityKeyOf(city: string): string {
  const c = norm(city || "");
  return c in CITY_TERMS ? c : "";
}

function altIsColombian(alt: string, cityKey: string): boolean {
  const a = norm(alt);
  if (!COLOMBIA_TERMS.some((t) => a.includes(t))) return false;
  if (!cityKey) return true;
  return !Object.entries(CITY_TERMS).some(([other, terms]) => other !== cityKey && terms.some((t) => a.includes(t)));
}

interface PexelsPhoto { id: number; alt?: string; src: { large: string; portrait: string } }

async function pickPhoto(query: string, city: string, pexelsKey: string, avoid: Set<number>): Promise<{ url: string; id: number; alt: string }> {
  const cityKey = cityKeyOf(city);
  const place = cityKey ? city : "Colombia";
  const attempts = [`${query} ${place}`, `${place} ${query}`, `${query} Colombia`, `${place} street`];
  for (const q of attempts) {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=40&orientation=portrait`, { headers: { Authorization: pexelsKey } });
    if (!res.ok) throw new Error(`Pexels ${res.status}`);
    const photos = ((await res.json()).photos ?? []) as PexelsPhoto[];
    const pick = photos.find((p) => !avoid.has(p.id) && altIsColombian(p.alt ?? "", cityKey));
    if (pick) {
      const u = new URL(pick.src.portrait || pick.src.large);
      u.searchParams.set("auto", "compress"); u.searchParams.set("cs", "tinysrgb");
      u.searchParams.set("w", "1080"); u.searchParams.set("h", "1350"); u.searchParams.set("fit", "crop");
      return { url: u.toString(), id: pick.id, alt: pick.alt ?? "" };
    }
  }
  throw new Error(`No Colombian-tagged photo for "${query}" (${place})`);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  try {
    const pexelsKey = Deno.env.get("PEXELS_API_KEY");
    if (!pexelsKey) throw new Error("Missing env: PEXELS_API_KEY");
    const { edits } = await req.json();
    if (!Array.isArray(edits) || edits.length === 0) throw new Error("Missing edits array");
    const results = [];
    const avoid = new Set<number>();
    for (const e of edits) {
      const skip = new Set<number>([...avoid, ...((e.avoid_ids ?? []) as number[])]);
      const photo = await pickPhoto(e.query, e.city ?? "", pexelsKey, skip);
      avoid.add(photo.id);
      const res = await fetch(CAROUSEL_SLIDE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slides: [{ photo_url: photo.url, headline: e.headline, slide_number: e.slide_number ?? 1, total_slides: e.total_slides ?? 5, filename: e.filename, variant: e.variant ?? "content" }] }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(`carousel-slide failed for ${e.filename}: ${String(data.error).slice(0, 200)}`);
      results.push({ filename: e.filename, photo_id: photo.id, alt: photo.alt.slice(0, 80) });
    }
    return new Response(JSON.stringify({ ok: true, results }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
});
