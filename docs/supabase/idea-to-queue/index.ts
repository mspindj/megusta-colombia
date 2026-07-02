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

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = "https://uocwxwvcrnkfnnoyjzyb.supabase.co";
const STORAGE_BUCKET = "content";
const PUBLISH_DAYS = [0, 1, 3, 5]; // Sun, Mon, Wed, Fri

// ─── WASM + Font cache ────────────────────────────────────────────────────────

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
}

interface GeneratedCopy {
  caption: string;
  hashtags: string;
  hook: string;
}

// ─── validateEnv ─────────────────────────────────────────────────────────────

function validateEnv(): void {
  // SERVICE_ROLE_JWT = legacy JWT (formato eyJhbG...) requerido por Storage.
  // Supabase inyecta el nuevo sb_secret_ en SUPABASE_SERVICE_ROLE_KEY pero Storage no lo acepta.
  const required = ["ANTHROPIC_API_KEY", "SERVICE_ROLE_JWT"];
  for (const v of required) {
    if (!Deno.env.get(v)) throw new Error(`Missing env: ${v}`);
  }
}

// ─── fetchIdea ────────────────────────────────────────────────────────────────

async function fetchIdea(id: string, jwt: string): Promise<ContentIdea> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}&select=id,title,url,origin,score,generated_copy,notes,content_type&limit=1`,
    { headers: { apikey: jwt, Authorization: `Bearer ${jwt}` } }
  );
  const rows: ContentIdea[] = await res.json();
  if (!rows || rows.length === 0) throw new Error(`Idea not found: ${id}`);
  return rows[0];
}

// ─── generateCopy (Haiku) ────────────────────────────────────────────────────

async function generateCopy(idea: ContentIdea, anthropicKey: string): Promise<GeneratedCopy> {
  const systemPrompt = `You are NOT a travel copywriter. You moved to Colombia 4 months ago.

Write IG posts that read like a voice note you'd send your group chat. Not a brand. Not a tool. Someone who figured something out and is passing it along.

WHO READS THIS:
English speakers arriving in Bogotá, Medellín, or Cartagena. Digital nomads, solo travelers, expats. They've Googled Colombia. They've seen the Narcos jokes. They will instantly clock anything that sounds like it was written by a tool. Your job is to not be that.

VOICE:
Write like you're typing fast. Not polishing. Specific details, not impressions. Prices in COP — not USD conversions. Real street names. Real neighborhood names. Real timings.

Spanish phrases: use them when they're the right word. "No dar papaya" is correct and specific. "Parce" lands in the right sentence. Don't explain every one — trust the reader to get it from context.

STRUCTURE RULES (no exceptions):
- Start mid-observation. "Transmilenio to Chapinero is 2,950 pesos." Not "Getting around Bogotá just got easier."
- No binary contrast openers. Not "Gringos pay $40. Locals pay $8."
- No revelation setups. Not "I thought X. Turns out Y."
- No list of 2-3 tips. That is a blog post format, not a caption.
- No closing lesson, moral, or reframe. The caption stops when the observation stops.
- No setup phrases: "Here's what most travelers miss", "What nobody tells you", "The thing about Colombia is".
- No adverbs. Active voice. No exclamation marks. No emojis. No em dashes.
- No: breathtaking, vibrant, bustling, hidden gem, paradise, must-see, discover, explore, stunning, rich culture, tapestry, world-class, game-changer, incredible, amazing, off the beaten path.

INSTITUTIONS (no exceptions):
Never claim or speculate why police, migración, government, or any institution acts a certain way. No corruption, no bribes, no "side deals," no motive attribution — even if the source material says so. You can describe what a visitor observes or needs to do (more foot traffic in a neighborhood, a form takes 15 minutes, a rotation schedule if it's public record) but never why an institution behaves that way. If the source material is one Reddit thread or blog post making a claim about an institution, drop that claim entirely and write around it. This is street-level intel for visitors, not institutional commentary.

WHAT WORKS:
- Specific COP amounts: 22,000 not "$5"
- Real places: Parque de la 93, Laureles, Getsemaní, La Macarena, El Hueco, Chapinero, Zona G, La Candelaria, El Centro, Andrés DC, Parque Arví, Envigado, Bocagrande
- Mixed sentence length. Short. Then one that takes its time and goes somewhere before it stops.
- End with megusta.com.co — no CTA language, just the URL on its own line.

For the image hook:
- A specific fact, number, or scene. Not a contrast. Not a question. Not a reframe.
- Something you'd text a friend at 11pm. "The Rappi driver gets there in 8 minutes."
- Sounds like observation, not ad copy. Max 8 words.`;

  const strategyNotes = idea.notes ? `\n\nStrategy context (use to shape angle, don't quote directly):\n${idea.notes}` : "";
  const typeHint = idea.content_type === "carousel"
    ? "This will be a 4-5 slide IG carousel. Write the caption as one continuous observation that makes someone want to swipe through the slides."
    : "This will be a single IG image post.";

  const userPrompt = `Content idea from ${idea.origin}:
"${idea.title}"
${typeHint}${strategyNotes}

Return ONLY valid JSON with exactly these 3 fields. Caption and hook in ENGLISH.
{
  "caption": "IG caption in English. Start mid-observation, no setup. Specific COP prices and real place names. One continuous voice — no tip lists, no closing moral. End with megusta.com.co on its own line. Max 2200 chars.",
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
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await res.json();
  if (!data.content || !data.content[0]) {
    throw new Error(`Haiku API error: ${JSON.stringify(data).slice(0, 300)}`);
  }
  const text: string = data.content[0].text;

  // Extracción tolerante: Haiku a veces pone texto explicativo antes/después del JSON
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

// ─── loadFonts (TTF, no WOFF2) + generateImage ───────────────────────────────

async function loadFonts() {
  if (cachedFonts) return cachedFonts;
  // Noto Sans TTF — satori NO soporta WOFF2.
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

// ─── uploadToStorage / nextPublishDate / insert / mark ───────────────────────

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
  // Tomar el MÁS RECIENTE entre el último publish_date y hoy
  // (evita que un queue con fechas viejas siga generando posts en el pasado)
  const base = lastDate > today ? lastDate : today;
  base.setUTCDate(base.getUTCDate() + 1);
  while (!PUBLISH_DAYS.includes(base.getUTCDay())) {
    base.setUTCDate(base.getUTCDate() + 1);
  }
  return base.toISOString().split("T")[0];
}

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

async function markIdeaProcessed(id: string, copy: GeneratedCopy, jwt: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}`, {
    method: "PATCH",
    headers: { apikey: jwt, Authorization: `Bearer ${jwt}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ generated_copy: copy.caption, generated_hashtags: copy.hashtags, status: "in_progress", used_at: new Date().toISOString() }),
  });
}

async function markIdeaFailed(id: string, error: Error, jwt: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}`, {
    method: "PATCH",
    headers: { apikey: jwt, Authorization: `Bearer ${jwt}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ notes: `[ERROR ${new Date().toISOString()}] ${error.message.slice(0, 400)}` }),
  });
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
    const copy = await generateCopy(idea, anthropicKey);
    const png = await generateImage(copy.hook, idea.origin, idea.score);
    const imageFile = `idea-${idea.id.slice(0, 12)}.png`;
    await uploadToStorage(png, imageFile, jwt);
    const publishDate = await nextPublishDate(jwt);
    await insertToQueue(idea, copy, imageFile, publishDate, jwt);
    await markIdeaProcessed(ideaId, copy, jwt);
    return new Response(JSON.stringify({ ok: true, publish_date: publishDate, image: imageFile, hook: copy.hook }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (ideaId && jwt) {
      try { await markIdeaFailed(ideaId, error, jwt); } catch (_) {}
    }
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
  }
});
