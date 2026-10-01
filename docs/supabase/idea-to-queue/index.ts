import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import satori from "npm:satori@0.11.2";
import { initWasm, Resvg } from "npm:@resvg/resvg-wasm@2.4.1";

// ─── Constants ────────────────────────────────────────────────────────────────
//
// IMPORTANTE — gotchas aprendidos 2026-05-27:
//   1. Satori NO soporta WOFF2 → usar TTF/OTF. Noto Sans desde jsdelivr.
//   2. Storage rechaza el nuevo formato sb_secret_* → usar JWT legacy guardado
//      en secret `SERVICE_ROLE_JWT` (sin prefijo SUPABASE_ porque la Management
//      API rechaza esos nombres).
//   3. Re-deploy SOLO via MCP `deploy_edge_function`. La Management API PATCH
//      está rota y deja la function en BOOT_ERROR.
//
// AGOSTO 2026 — soporte de carrusel:
//   content_type='carousel' -> Haiku devuelve 4-5 slides (search_query + kicker +
//   headline) en vez de un solo hook. Cada slide busca una foto real royalty-free
//   en Pexels (PEXELS_API_KEY) y se compone vía la función carousel-slide (foto +
//   overlay de marca), NO Satori-sobre-fondo-solido como el flujo de imagen única.
//
// 29 SEP 2026 — rediseño anti-relleno de carruseles:
//   - Sin kicker/eyebrow: el slide lleva solo titular (ver carousel-slide).
//   - Toda cifra en pesos sale de VERIFIED_FACTS (fuente y fecha). Antes Haiku
//     inventaba precios y se contradecían entre posts (metro 2,950 / 3,450 / 3,650;
//     el Metrocable a Arví figuraba "gratis" y cuesta más de 20,000 COP para
//     extranjeros). unverifiedAmounts() rechaza y reintenta si aparece una cifra
//     que no está en la lista.
//   - Sin persona inventada ("moved to Colombia 4 months ago").
//   - El caption lo arma el código: gancho + descripción (Haiku) + CTA (columna
//     content_ideas.cta_line, verbatim) + megusta.com.co + hashtags. El modelo
//     ignoraba la instrucción de cerrar con la URL (0 de 17 posts de septiembre).
//   - Fotos: la ciudad del post se agrega al query, no se repiten fotos dentro de
//     un carrusel y se descartan fotos cuyo alt nombra otra ciudad.
//   Requiere el secret PEXELS_API_KEY -- si falta, la idea queda marcada failed
//   con ese error explícito, NO cae en silencio al flujo de imagen única.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = "https://uocwxwvcrnkfnnoyjzyb.supabase.co";
const STORAGE_BUCKET = "content";
const PUBLISH_DAYS = [0, 1, 3, 5]; // Sun, Mon, Wed, Fri
const CAROUSEL_SLIDE_URL = `${SUPABASE_URL}/functions/v1/carousel-slide`;

// ─── WASM + Font cache ───────────────────────────────────────────────────────────

let wasmReady = false;
async function ensureWasm() {
  if (!wasmReady) {
    await initWasm(fetch("https://unpkg.com/@resvg/resvg-wasm@2.4.1/index_bg.wasm"));
    wasmReady = true;
  }
}

let cachedFonts: Array<{ name: string; weight: 700 | 900; style: "normal"; data: ArrayBuffer }> | null = null;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContentIdea {
  id: string;
  title: string;
  url: string | null;
  origin: string;
  score: number;
  generated_copy: string | null;
  notes: string | null;
  content_type: string | null;
  cta_line: string | null;
}

interface GeneratedCopy {
  caption: string;
  hashtags: string;
  hook: string;
}

interface CarouselSlideSpec {
  search_query: string;
  headline: string;
}

interface GeneratedCarousel {
  city: string;
  hook: string;
  description: string;
  hashtags: string;
  slides: CarouselSlideSpec[];
}

// ─── validateEnv ─────────────────────────────────────────────────────────────

function validateEnv(): void {
  const required = ["ANTHROPIC_API_KEY", "SERVICE_ROLE_JWT"];
  for (const v of required) {
    if (!Deno.env.get(v)) throw new Error(`Missing env: ${v}`);
  }
}

// ─── fetchIdea ──────────────────────────────────────────────────────────────────

async function fetchIdea(id: string, jwt: string): Promise<ContentIdea> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}&select=id,title,url,origin,score,generated_copy,notes,content_type,cta_line&limit=1`,
    { headers: { apikey: jwt, Authorization: `Bearer ${jwt}` } }
  );
  const rows: ContentIdea[] = await res.json();
  if (!rows || rows.length === 0) throw new Error(`Idea not found: ${id}`);
  return rows[0];
}

// ─── shared voice system prompt ───────────────────────────────────────────────

// Hechos verificados (fuente y fecha). Es la ÚNICA fuente de cifras. Se actualiza a mano
// cuando cambian las tarifas; la fecha va en el texto para que el revisor la vea.
const VERIFIED_FACTS = `VERIFIED FACTS (checked 2026-09-29 against official or press sources). These are the ONLY numbers you may use:
- TransMilenio and TransMiZonal (Bogotá): 3,550 COP per ride, all day. The Tullave card costs 8,000 COP. Cards are recharged at machines in stations and portals. Source: transmilenio.gov.co.
- Bogotá taxi on the taximeter, rates in force since 12 Feb 2026: banderazo 4,500 COP, minimum fare 8,000 COP, El Dorado airport surcharge 8,000 COP, night/Sunday/holiday surcharge 3,800 COP (20:00 to 05:00). Source: Decree 042 of 2026, via El Tiempo.
- Pico y placa (Bogotá, private cars): 6:00 a.m. to 9:00 p.m., Monday to Friday, not on weekends or holidays. On odd calendar days plates ending in 1 to 5 may drive, on even days plates ending in 6 to 0. Source: bogota.gov.co, September 2026. Tell the reader to check the month's calendar.
- Metro de Medellín, 2026: 4,400 COP per ride on the tourist card, 3,820 COP on a frequent Cívica card. Source: Metro de Medellín, January 2026.
- Metrocable to Parque Arví (Medellín): a separate fare, well above a normal metro ride, over 20,000 COP for foreigners. Do not give an exact figure.
- Transcaribe (Cartagena bus): 3,900 COP per ride since 23 Jan 2026. Source: Alcaldía de Cartagena.
If a fact is not in this list, do NOT put a number on it. Describe it without a number ("a separate, higher fare") or leave it out. Plain counts such as "two weeks" or "three days" are fine. Prices, travel times, distances, opening hours, weather and safety statistics are all facts: do not state any that are not listed above, not even in words ("sixteen hours"). Give practical advice instead: what to look for, what to ask, what to check, what to bring.`;

const VOICE_SYSTEM_PROMPT = `You write for Me Gusta Colombia: practical street-level intel for English speakers landing in Bogotá, Medellín, or Cartagena. Write like a knowledgeable friend, plain and direct. Not a brand, not a tool.

You have no personal history. Never claim a timeline or experience of the author ("four months in", "I moved here", "I've been here", "last week I").

WHO READS THIS:
Digital nomads, solo travelers, expats. They've Googled Colombia, they've seen the Narcos jokes, and they will instantly clock anything that sounds like it was written by a tool.

VOICE:
Specific details, not impressions. Real street and neighborhood names. Spanish phrases when they're the right word: "no dar papaya" is correct and specific, "parce" lands in the right sentence. Don't explain every one.

STRUCTURE RULES (no exceptions):
- Start mid-observation, not with setup.
- No binary contrast ("Not X. It's Y." / "X isn't Y, it's Z").
- No revelation setups ("I thought X. Turns out Y.").
- No closing lesson, moral, or reframe.
- No setup phrases: "Here's what most travelers miss", "What nobody tells you", "The thing about Colombia is".
- No "hits different", "moves different", "Swipe for", "real spots, real prices".
- No adverbs. Active voice. No exclamation marks. No emojis. No em dashes. Do not force ideas into groups of three.
- No: breathtaking, vibrant, bustling, hidden gem, paradise, must-see, discover, explore, stunning, rich culture, tapestry, world-class, game-changer, incredible, amazing, off the beaten path.

FRAME (no exceptions):
Sell competence, never danger. The reader should feel like an insider who knows how things work, not like a target. Never open with a threat or a loss ("your phone gets grabbed", "you'll get scammed", "your card gets swallowed"). Do not generalize about vendors, taxi drivers or locals ("vendors know tourists have money"). Say what to do, what to check, what to ask. Hooks must be different from each other across posts: do not reuse "moves fast", "keep up" or "burning out".

INSTITUTIONS (no exceptions):
Never claim or speculate why police, migración, government, or any institution acts a certain way. No corruption, no bribes, no "side deals," no motive attribution, even if the source material says so. You can describe what a visitor observes or needs to do, never why an institution behaves that way.

NUMBERS (no exceptions):
${VERIFIED_FACTS}

The source material you receive is only the title of a search result. Use it for the topic. It is not a source of facts.`;

// Cifras que el modelo puede usar (ver VERIFIED_FACTS). 20,000 es el piso del Metrocable a Arví.
const ALLOWED_AMOUNTS = new Set([3550, 8000, 4500, 3800, 4400, 3820, 3900, 20000]);

// Cifras escritas en letra junto a una unidad ("sixteen hours", "thirty minutes"): también son datos.
const WORD_UNIT_RX = /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|sixteen|eighteen|twenty|thirty|forty|fifty|sixty|hundred|thousand)(?:[-\s]\w+)?\s+(?:hours?|minutes?|kilometers?|km|miles|pesos|dollars|USD|COP|degrees)\b/gi;

// Comparaciones cuantitativas disfrazadas ("three times what locals pay", "half the price", "40%").
const QUANT_RX = /\b(?:twice|double[sd]?|triple[sd]?|(?:two|three|four|five|six|ten|\d+)\s+times|half\s+(?:the|of|price)|percent|per\s?cent)\b|\d+\s*%/gi;

function unverifiedAmounts(text: string): string[] {
  const flagged: string[] = [...(text.match(WORD_UNIT_RX) ?? []), ...(text.match(QUANT_RX) ?? [])];
  const re = /(\d[\d,.]*)(\s*(?:COP|pesos|k\b))?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[1].replace(/[,.]+$/, "");
    const value = parseInt(raw.replace(/[,.]/g, ""), 10);
    if (isNaN(value)) continue;
    const isYear = value >= 2020 && value <= 2035 && !/[,.]/.test(raw);
    const hasCurrency = !!m[2];
    if (ALLOWED_AMOUNTS.has(value)) continue;
    if (isYear) continue;
    if (value >= 1000 || hasCurrency) flagged.push(m[0].trim());
  }
  return flagged;
}

// Horarios y cierres ("10 p.m.", "6pm") son datos. Solo se aceptan los del pico y placa y el recargo nocturno.
const TIME_RX = /\b\d{1,2}(?::\d{2})?\s?(?:a\.?m\.?|p\.?m\.?)/gi;
const ALLOWED_TIMES = new Set(["6 a.m.", "9 p.m.", "6:00 a.m.", "9:00 p.m.", "6am", "9pm", "6 am", "9 pm"]);

function unverifiedTimes(text: string): string[] {
  return (text.match(TIME_RX) ?? []).filter((t) => !ALLOWED_TIMES.has(t.toLowerCase().replace(/\s+/g, " ")) && !ALLOWED_TIMES.has(t.toLowerCase().replace(/\s+/g, "")));
}

// Objetos genéricos: sus fotos de stock nunca son de Colombia (dinero argentino, pasaporte de México...).
// En vez de rechazar el copy, se limpia el query: se quita el objeto y, si no queda una escena, se cae a
// una escena de la ciudad (calle, plaza, estación, mercado) que la foto de stock sí puede mostrar.
const BANNED_QUERY_RX = /\b(phones?|smartphones?|screens?|apps?|calendars?|notebooks?|cameras?|maps?|luggage|suitcases?|laptops?|passports?|cash|money|banknotes?|credit|cards?|watch(?:es)?|jewel(?:ry|lery)|wallets?|atms?|receipts?|bills?|menus?|sims?|hands?|holding|person|people|man|woman)\b/gi;
const FALLBACK_SCENES = ["street", "plaza", "metro station", "market", "skyline"];

function sanitizeQuery(query: string, index: number): string {
  const cleaned = (query ?? "").replace(BANNED_QUERY_RX, " ").replace(/\b(with|and|at|of|the|a|on|in|showing)\b/gi, " ").replace(/\s+/g, " ").trim();
  return cleaned.split(" ").filter(Boolean).length >= 2 ? cleaned : FALLBACK_SCENES[index % FALLBACK_SCENES.length];
}

const BANNED_RX = /hits different|moves different|swipe for|here'?s what|what nobody|four months|4 months|i moved here|moves? fast|keep up|burning? out|that'?s giving|gets? grabbed|get scammed|swallowed|know tourists|—/i;

// ─── generateCopy (single image, unchanged) ───────────────────────────────────

async function generateCopy(idea: ContentIdea, anthropicKey: string): Promise<GeneratedCopy> {
  const strategyNotes = idea.notes ? `\n\nStrategy context (use to shape angle, don't quote directly):\n${idea.notes}` : "";

  const userPrompt = `Content idea from ${idea.origin}:
"${idea.title}"
This will be a single IG image post.${strategyNotes}

Return ONLY valid JSON with exactly these 3 fields. Caption and hook in ENGLISH.
{
  "caption": "IG caption in English. Start mid-observation, no setup. Real place names. Numbers only from VERIFIED FACTS. One continuous voice — no tip lists, no closing moral. End with megusta.com.co on its own line. Max 2200 chars.",
  "hashtags": "#ColombiaTravel #MeGustaColombia #NoDarPapaya [8-12 specific hashtags: city-level like #BogotaTravel #MedellinNomad #CartagenaColombia, behavior-level like #DigitalNomadColombia #SoloTravelColombia #ColombiaExpat]",
  "hook": "Image text. Specific observation, max 8 words. Sounds like something you'd text a friend, not a poster headline."
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 900,
      system: VOICE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await res.json();
  if (!data.content || !data.content[0]) {
    throw new Error(`Haiku API error: ${JSON.stringify(data).slice(0, 300)}`);
  }
  const text: string = data.content[0].text;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in Haiku response: ${text.slice(0, 200)}`);

  let parsed: GeneratedCopy;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (_) {
    throw new Error(`Haiku response not valid JSON: ${text.slice(0, 200)}`);
  }

  if (parsed.caption && parsed.caption.length > 2200) {
    parsed.caption = parsed.caption.slice(0, 2200);
  }
  return parsed;
}

// ─── generateCarouselCopy (Haiku, 5 slides, hook + description) ────────────────

async function callHaikuCarousel(idea: ContentIdea, anthropicKey: string, feedback: string): Promise<GeneratedCarousel> {
  const strategyNotes = idea.notes ? `\n\nStrategy context (use to shape angle, don't quote directly):\n${idea.notes}` : "";

  const userPrompt = `Topic, taken from a search result titled: "${idea.title}" (${idea.origin}).
This is a 5 slide IG carousel with a REAL photo behind each slide. Slide 1 is the cover: a headline that a person landing in Colombia cares about, a concrete situation or a real tension, no number needed. Slides 2 to 4 each carry ONE practical point. Slide 5 is the practical next step (what to do, not a moral or a summary).${strategyNotes}${feedback}

Return ONLY valid JSON with exactly these fields:
{
  "city": "Bogotá, Medellín, Cartagena, or Colombia (pick the one city the post is about; Colombia only if it truly spans several)",
  "hook": "First line of the IG caption. Max 110 characters. It must make sense alone, because Instagram cuts the caption after about 125 characters. A concrete situation or tension, not a slogan. No number unless it is in VERIFIED FACTS.",
  "description": "Two sentences for the IG caption: what the slides cover and what the reader gains from them. Do not repeat numbers from the slides. No call to action.",
  "hashtags": "#ColombiaTravel #MeGustaColombia #NoDarPapaya plus 7 to 9 specific hashtags. Real words only, no spaces inside a hashtag, no duplicates.",
  "slides": [
    {
      "search_query": "3-5 words describing literally what a stock photo for this slide shows (e.g. 'metro train platform', 'street food cart', 'colonial balcony street'). Photographable and specific. Do not include the city name. Never a generic object such as a phone, calendar, notebook, camera, map, luggage or laptop: always a street, place, vehicle or scene.",
      "headline": "One point for this slide, max 14 words. Plain sentence. Any number must come from VERIFIED FACTS."
    }
  ]
}
Exactly 5 objects in slides, in order.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1600,
      system: VOICE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  if (!data.content || !data.content[0]) throw new Error(`Haiku API error: ${JSON.stringify(data).slice(0, 300)}`);
  const text: string = data.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in Haiku response: ${text.slice(0, 200)}`);
  let parsed: GeneratedCarousel;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (_) {
    throw new Error(`Haiku response not valid JSON: ${text.slice(0, 200)}`);
  }
  if (!Array.isArray(parsed.slides) || parsed.slides.length < 4) {
    throw new Error(`Haiku returned ${parsed.slides?.length ?? 0} slides, need 4 or 5`);
  }
  return parsed;
}

// Segunda pasada: otro llamado a Haiku, sin la voz de marca, que solo verifica. Atrapa lo que las
// regex no ven: lugares inventados o mal escritos ("Los Pólòs"), horarios de cierre, costumbres
// afirmadas como hecho, generalizaciones sobre vendedores o taxistas.
async function factCheckCarousel(parsed: GeneratedCarousel, anthropicKey: string): Promise<string[]> {
  const text = [`HOOK: ${parsed.hook}`, `DESCRIPTION: ${parsed.description}`, ...parsed.slides.map((sl, i) => `SLIDE ${i + 1}: ${sl.headline}`)].join("\n");
  const prompt = `You are a strict fact-checker for an Instagram account about Colombia travel. Check this carousel text.

${VERIFIED_FACTS}

Flag a statement ONLY if it: (a) asserts a price, fare, opening or closing time, distance, duration, frequency, weather fact or safety statistic that is not in VERIFIED FACTS; (b) states a local custom or business practice as a fact ("vendors quote higher prices", "restaurants omit taxes", "shops close early") that you cannot be sure is true everywhere; (c) names a place, neighborhood, transport line or Spanish word that does not exist in Colombia, is misspelled, or belongs to another country; (d) makes a generalization about vendors, taxi drivers, waiters or locals as a group.
Do NOT flag practical advice phrased as an instruction ("ask the price first", "check the meter", "bring your ID"), or statements that are in VERIFIED FACTS.

TEXT:
${text}

Return ONLY JSON: {"problems": ["short description of each flagged statement", ...]}. Use an empty list if nothing is flagged.`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": anthropicKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 700, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  if (!data.content || !data.content[0]) return [];
  const m = (data.content[0].text as string).match(/\{[\s\S]*\}/);
  if (!m) return [];
  try {
    const out = JSON.parse(m[0]);
    return Array.isArray(out.problems) ? out.problems.map(String).slice(0, 6) : [];
  } catch (_) {
    return [];
  }
}

async function generateCarouselCopy(idea: ContentIdea, anthropicKey: string): Promise<GeneratedCarousel> {
  let feedback = "";
  let lastProblems: string[] = [];
  for (let attempt = 0; attempt < 4; attempt++) {
    const parsed = await callHaikuCarousel(idea, anthropicKey, feedback);
    const allText = [parsed.hook, parsed.description, ...parsed.slides.map((sl) => sl.headline)].join("\n");
    const problems: string[] = [];
    const amounts = [...unverifiedAmounts(allText), ...unverifiedTimes(allText)];
    if (amounts.length) problems.push(`numbers or times not in VERIFIED FACTS: ${amounts.join(", ")}. Remove them or rewrite without a number`);
    const banned = allText.match(BANNED_RX);
    if (banned) problems.push(`banned phrase: "${banned[0]}"`);
    if ((parsed.hook ?? "").length > 125) problems.push("hook is longer than 125 characters");
    if (problems.length === 0) {
      const factProblems = await factCheckCarousel(parsed, anthropicKey);
      if (factProblems.length) problems.push(`unverifiable claims: ${factProblems.join("; ")}. Rewrite them as practical advice (what to ask, check, bring) or cut them`);
    }
    if (problems.length === 0) return parsed;
    lastProblems = problems;
    feedback = `\n\nYour previous attempt was rejected: ${problems.join("; ")}. Fix every one and return the JSON again.`;
  }
  throw new Error(`Carousel copy rejected 4 times: ${lastProblems.join("; ").slice(0, 350)}`);
}

// ─── Pexels photo search ───────────────────────────────────────────────────────

interface PexelsPhoto {
  id: number;
  alt?: string;
  src: { large: string; portrait: string };
}

// Términos que delatan a qué ciudad pertenece una foto según su alt text.
const CITY_TERMS: Record<string, string[]> = {
  bogota: ["bogota", "chapinero", "candelaria", "monserrate", "usaquen", "transmilenio"],
  medellin: ["medellin", "comuna 13", "poblado", "laureles", "guatape", "arvi"],
  cartagena: ["cartagena", "getsemani", "bocagrande", "walled city", "castillo san felipe"],
};

function normalizeCity(city: string): string {
  const c = (city || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return c in CITY_TERMS ? c : "";
}

function altBelongsToOtherCity(alt: string, city: string): boolean {
  if (!city) return false;
  const a = alt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return Object.entries(CITY_TERMS).some(([other, terms]) => other !== city && terms.some((t) => a.includes(t)));
}

// La descripción (alt) de la foto tiene que nombrar Colombia o un lugar colombiano. Antes bastaba con
// agregar "Colombia" al query y salían dinero argentino, un pasaporte de México y un mapa de metro de
// Barcelona. Sin una mención positiva en el alt, la foto se descarta.
const COLOMBIA_TERMS = [
  "colombia", "colombian", "bogota", "medellin", "cartagena", "comuna 13", "candelaria", "chapinero", "usaquen",
  "laureles", "poblado", "getsemani", "transmilenio", "monserrate", "guatape", "arvi", "paisa", "palenquera",
  "san felipe", "santo domingo", "bocagrande", "zona g", "el dorado", "cali", "antioquia", "cundinamarca",
];

function altIsColombian(alt: string, cityKey: string): boolean {
  const a = alt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!COLOMBIA_TERMS.some((t) => a.includes(t))) return false;
  return !altBelongsToOtherCity(a, cityKey);
}

async function pexelsSearch(q: string, pexelsKey: string): Promise<PexelsPhoto[]> {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=40&orientation=portrait`,
    { headers: { Authorization: pexelsKey } }
  );
  if (!res.ok) throw new Error(`Pexels search failed: ${res.status} ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return (data.photos ?? []) as PexelsPhoto[];
}

async function searchPexelsPhoto(query: string, city: string, pexelsKey: string, used: Set<number>): Promise<string> {
  const cityKey = normalizeCity(city);
  const place = cityKey ? city : "Colombia";
  const attempts = [`${query} ${place}`, `${place} ${query}`, `${query} Colombia`, `${place} street`, `${place} Colombia`];
  let pick: PexelsPhoto | undefined;
  for (const q of attempts) {
    const photos = await pexelsSearch(q, pexelsKey);
    pick = photos.find((p) => !used.has(p.id) && altIsColombian(p.alt ?? "", cityKey));
    if (pick) break;
  }
  if (!pick) throw new Error(`No Colombian-tagged Pexels photo for "${query}" (${place})`);
  used.add(pick.id);
  // Pedimos versión comprimida/liviana para no repetir el WORKER_RESOURCE_LIMIT del piloto.
  const base = pick.src.portrait || pick.src.large;
  const url = new URL(base);
  url.searchParams.set("auto", "compress");
  url.searchParams.set("cs", "tinysrgb");
  url.searchParams.set("w", "1080");
  url.searchParams.set("h", "1350");
  url.searchParams.set("fit", "crop");
  return url.toString();
}

// ─── loadFonts (TTF, no WOFF2) + generateImage (single-image path, unchanged) ─

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

async function generateImage(hook: string, origin: string, score: number): Promise<Uint8Array> {
  await ensureWasm();
  const fonts = await loadFonts();
  const fontSize = hook.length > 45 ? 64 : hook.length > 30 ? 72 : 84;

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: 1080, height: 1080, background: "#0a0a0a",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px", fontFamily: "NotoSans",
        },
        children: [
          { type: "span", props: { style: { color: "#d4a843", fontSize: 18, letterSpacing: 8, textTransform: "uppercase", fontWeight: 700, marginBottom: 16 }, children: "ME GUSTA COLOMBIA" } },
          { type: "span", props: { style: { color: "#b89645", fontSize: 20, letterSpacing: 2, fontWeight: 700, marginBottom: 48 }, children: `${origin} • score ${score}` } },
          { type: "h1", props: { style: { color: "#ffffff", fontSize, fontWeight: 900, textAlign: "center", lineHeight: 1.15, margin: "0 0 48px 0", maxWidth: 920 }, children: hook } },
          { type: "div", props: { style: { width: 120, height: 2, background: "#d4a843", marginBottom: 40 } } },
          { type: "span", props: { style: { color: "#aaaaaa", fontSize: 24, letterSpacing: 3, fontWeight: 700 }, children: "megusta.com.co" } },
        ],
      },
    },
    { width: 1080, height: 1080, fonts }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1080 } });
  return resvg.render().asPng();
}

// ─── uploadToStorage / nextPublishDate ─────────────────────────────────────────

async function uploadToStorage(png: Uint8Array, fileName: string, jwt: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/posts/${fileName}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "image/png", "x-upsert": "true" },
    body: png,
  });
  if (!res.ok) throw new Error(`Storage upload failed: ${res.status} ${await res.text()}`);
}

async function nextPublishDate(jwt: string): Promise<string> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/content_queue?select=publish_date&order=publish_date.desc&limit=1`,
    { headers: { apikey: jwt, Authorization: `Bearer ${jwt}` } }
  );
  const rows: Array<{ publish_date: string }> = await res.json();
  const lastDate = rows[0]?.publish_date ? new Date(rows[0].publish_date + "T00:00:00Z") : new Date();
  const today = new Date();
  const base = lastDate > today ? lastDate : today;
  base.setUTCDate(base.getUTCDate() + 1);
  while (!PUBLISH_DAYS.includes(base.getUTCDay())) {
    base.setUTCDate(base.getUTCDate() + 1);
  }
  return base.toISOString().split("T")[0];
}

// ─── insertToQueue (single image, unchanged) + insertCarouselToQueue ──────────

async function insertToQueue(idea: ContentIdea, copy: GeneratedCopy, imageFile: string, publishDate: string, jwt: string): Promise<void> {
  const queueId = `idea-${idea.id.slice(0, 12)}`;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/content_queue`, {
    method: "POST",
    headers: { apikey: jwt, Authorization: `Bearer ${jwt}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({
      id: queueId,
      day: 0,
      publish_date: publishDate,
      platforms: ["instagram"],
      type: "image",
      image_file: imageFile,
      caption: copy.caption + "\n\n" + copy.hashtags,
      published: false,
    }),
  });
  if (!res.ok) throw new Error(`insertToQueue failed: ${res.status} ${await res.text()}`);
}

const DEFAULT_CTA = "Send this to whoever is planning the trip with you.";

function buildCarouselCaption(idea: ContentIdea, copy: GeneratedCarousel): string {
  const cta = (idea.cta_line ?? "").trim() || DEFAULT_CTA;
  return `${copy.hook.trim()}\n\n${copy.description.trim()}\n\n${cta}\n\nmegusta.com.co\n\n${copy.hashtags.trim()}`.replace(/—/g, ".");
}

async function insertCarouselToQueue(idea: ContentIdea, copy: GeneratedCarousel, imageFiles: string[], publishDate: string, jwt: string): Promise<string> {
  const queueId = `idea-${idea.id.slice(0, 12)}`;
  const caption = buildCarouselCaption(idea, copy);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/content_queue`, {
    method: "POST",
    headers: { apikey: jwt, Authorization: `Bearer ${jwt}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({
      id: queueId,
      day: 0,
      publish_date: publishDate,
      platforms: ["instagram"],
      type: "carousel",
      image_file: null,
      image_files: imageFiles,
      caption,
      published: false,
    }),
  });
  if (!res.ok) throw new Error(`insertCarouselToQueue failed: ${res.status} ${await res.text()}`);
  return caption;
}

async function markIdeaProcessed(id: string, copyText: string, hashtags: string, jwt: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}`, {
    method: "PATCH",
    headers: { apikey: jwt, Authorization: `Bearer ${jwt}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ generated_copy: copyText, generated_hashtags: hashtags, status: "in_progress", used_at: new Date().toISOString() }),
  });
}

async function markIdeaFailed(id: string, error: Error, jwt: string): Promise<void> {
  // Antes esto pisaba `notes`, y el error terminaba alimentando el prompt de la siguiente corrida.
  await fetch(`${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}`, {
    method: "PATCH",
    headers: { apikey: jwt, Authorization: `Bearer ${jwt}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ last_error: `[${new Date().toISOString()}] ${error.message.slice(0, 400)}` }),
  });
}

// ─── Carousel orchestration ─────────────────────────────────────────────────────

async function generateCarouselSlideImages(ideaId: string, slides: CarouselSlideSpec[], city: string, pexelsKey: string): Promise<string[]> {
  const total = slides.length;
  const filenames: string[] = [];
  const usedPhotos = new Set<number>();
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const photoUrl = await searchPexelsPhoto(sanitizeQuery(slide.search_query, i), city, pexelsKey, usedPhotos);
    const filename = `idea-${ideaId.slice(0, 12)}-${i + 1}.png`;
    const res = await fetch(CAROUSEL_SLIDE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slides: [{
          photo_url: photoUrl,
          headline: slide.headline,
          slide_number: i + 1,
          total_slides: total,
          filename,
          variant: i === 0 ? "cover" : i === slides.length - 1 ? "close" : "content",
        }],
      }),
    });
    const data = await res.json();
    if (!data.ok) throw new Error(`carousel-slide failed on slide ${i + 1}: ${data.error}`);
    filenames.push(filename);
  }
  return filenames;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  let ideaId: string | undefined;
  let jwt = "";
  try {
    validateEnv();
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!;
    jwt = Deno.env.get("SERVICE_ROLE_JWT")!;
    const { idea_id } = await req.json();
    ideaId = idea_id;
    if (!ideaId) throw new Error("Missing idea_id in request body");
    const idea = await fetchIdea(ideaId, jwt);
    if (idea.generated_copy) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    if (idea.content_type === "carousel") {
      const pexelsKey = Deno.env.get("PEXELS_API_KEY");
      if (!pexelsKey) throw new Error("Missing env: PEXELS_API_KEY (required for content_type=carousel)");

      const copy = await generateCarouselCopy(idea, anthropicKey);
      const imageFiles = await generateCarouselSlideImages(idea.id, copy.slides, copy.city, pexelsKey);
      const publishDate = await nextPublishDate(jwt);
      const caption = await insertCarouselToQueue(idea, copy, imageFiles, publishDate, jwt);
      await markIdeaProcessed(ideaId, caption, copy.hashtags, jwt);
      return new Response(JSON.stringify({ ok: true, type: "carousel", publish_date: publishDate, slides: imageFiles.length, city: copy.city, hook: copy.hook }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }

    const copy = await generateCopy(idea, anthropicKey);
    const png = await generateImage(copy.hook, idea.origin, idea.score);
    const imageFile = `idea-${idea.id.slice(0, 12)}.png`;
    await uploadToStorage(png, imageFile, jwt);
    const publishDate = await nextPublishDate(jwt);
    await insertToQueue(idea, copy, imageFile, publishDate, jwt);
    await markIdeaProcessed(ideaId, copy.caption, copy.hashtags, jwt);
    return new Response(JSON.stringify({ ok: true, type: "image", publish_date: publishDate, image: imageFile, hook: copy.hook }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (ideaId && jwt) {
      try { await markIdeaFailed(ideaId, error, jwt); } catch (_) {}
    }
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
});
