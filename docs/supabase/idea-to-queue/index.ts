import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import satori from "npm:satori@0.11.2";
import { initWasm, Resvg } from "npm:@resvg/resvg-wasm@2.4.1";

// ─── Constants ────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = "https://uocwxwvcrnkfnnoyjzyb.supabase.co";
const STORAGE_BUCKET = "content";
const PUBLISH_DAYS = [0, 1, 3, 5]; // Sun, Mon, Wed, Fri

// ─── WASM init — una sola vez por instancia ───────────────────────────────────

let wasmReady = false;
async function ensureWasm() {
  if (!wasmReady) {
    await initWasm(
      fetch("https://unpkg.com/@resvg/resvg-wasm@2.4.1/index_bg.wasm")
    );
    wasmReady = true;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContentIdea {
  id: string;
  title: string;
  url: string;
  origin: string;         // "r/Colombia"
  score: number;
  generated_copy: string | null;
}

interface GeneratedCopy {
  caption: string;        // IG caption, max 2200 chars
  hashtags: string;       // "10-15 hashtags"
  hook: string;           // headline para imagen, max 8 palabras
}

// ─── TASK-01: validateEnv ─────────────────────────────────────────────────────

function validateEnv(): void {
  const required = ["ANTHROPIC_API_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
  for (const varName of required) {
    if (!Deno.env.get(varName)) {
      throw new Error(`Missing env: ${varName}`);
    }
  }
}

// ─── TASK-02: fetchIdea ───────────────────────────────────────────────────────

async function fetchIdea(id: string, serviceKey: string): Promise<ContentIdea> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}&select=id,title,url,origin,score,generated_copy&limit=1`,
    {
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
    }
  );
  const rows: ContentIdea[] = await res.json();
  if (!rows || rows.length === 0) {
    throw new Error(`Idea not found: ${id}`);
  }
  return rows[0] as ContentIdea;
}

// ─── TASK-03: generateCopy ────────────────────────────────────────────────────

async function generateCopy(
  idea: ContentIdea,
  anthropicKey: string
): Promise<GeneratedCopy> {
  const systemPrompt = `You are a copywriter for Me Gusta Colombia (megusta.com.co).
We sell tactical 72-hour survival guides for travelers visiting Colombian cities.

Tone: direct, no-BS, insider knowledge. NOT a tourist brand.
NEVER use: "vibrant", "bustling", "paradise", "rich culture", "hidden gem".
Write like a local friend giving a voice note, not a brand.
Use specific numbers and prices when available.
Short sentences. Active voice.`;

  const userPrompt = `A Reddit post from ${idea.origin} got ${idea.score} upvotes:
Title: "${idea.title}"
URL: ${idea.url}

Write an Instagram post inspired by this topic for Me Gusta Colombia.

Return ONLY a JSON object with exactly these 3 fields:
{
  "caption": "Instagram caption max 2200 chars. Bold hook as first line. 2-3 tactical tips. End with: megusta.com.co",
  "hashtags": "#ColombiaTravel #MeGustaColombia #NoDarPapaya [7-12 more relevant hashtags]",
  "hook": "Short punchy headline max 8 words for the image. Use the most shocking or useful insight from the post."
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
      max_tokens: 700,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await res.json();
  const text: string = data.content[0].text;

  let parsed: GeneratedCopy;
  try {
    parsed = JSON.parse(text);
  } catch (_) {
    throw new Error(`Haiku response not valid JSON: ${text.slice(0, 200)}`);
  }

  if (parsed.caption && parsed.caption.length > 2200) {
    parsed.caption = parsed.caption.slice(0, 2200);
  }

  return parsed;
}

// ─── TASK-04: loadFonts + generateImage ───────────────────────────────────────

async function loadFonts(): Promise<
  { name: string; weight: number; style: string; data: ArrayBuffer }[]
> {
  const base = "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files";
  try {
    const [bold, black] = await Promise.all([
      fetch(`${base}/inter-latin-700-normal.woff2`).then((r) => r.arrayBuffer()),
      fetch(`${base}/inter-latin-900-normal.woff2`).then((r) => r.arrayBuffer()),
    ]);
    return [
      { name: "Inter", weight: 700, style: "normal", data: bold },
      { name: "Inter", weight: 900, style: "normal", data: black },
    ];
  } catch (_) {
    // Si cualquier fetch falla → Satori usará fallback
    return [];
  }
}

async function generateImage(
  hook: string,
  origin: string,
  score: number
): Promise<Uint8Array> {
  await ensureWasm();
  const fonts = await loadFonts();

  const fontSize = hook.length > 45 ? 64 : hook.length > 30 ? 72 : 84;

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: 1080,
          height: 1080,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "Inter",
          gap: "0px",
        },
        children: [
          // Brand label
          {
            type: "span",
            props: {
              style: {
                color: "#d4a843",
                fontSize: 18,
                letterSpacing: 8,
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 16,
              },
              children: "ME GUSTA COLOMBIA",
            },
          },
          // Origin label
          {
            type: "span",
            props: {
              style: {
                color: "#b89645",
                fontSize: 20,
                letterSpacing: 2,
                fontWeight: 700,
                marginBottom: 48,
              },
              children: `${origin} • ${score} upvotes`,
            },
          },
          // Hook headline
          {
            type: "h1",
            props: {
              style: {
                color: "#ffffff",
                fontSize: fontSize,
                fontWeight: 900,
                textAlign: "center",
                lineHeight: 1.15,
                margin: "0 0 48px 0",
                maxWidth: 920,
              },
              children: hook,
            },
          },
          // Gold divider
          {
            type: "div",
            props: {
              style: {
                width: 120,
                height: 2,
                background: "#d4a843",
                marginBottom: 40,
              },
            },
          },
          // CTA
          {
            type: "span",
            props: {
              style: {
                color: "#aaaaaa",
                fontSize: 24,
                letterSpacing: 3,
                fontWeight: 700,
              },
              children: "megusta.com.co",
            },
          },
        ],
      },
    },
    { width: 1080, height: 1080, fonts }
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1080 } });
  return resvg.render().asPng();
}

// ─── TASK-05: uploadToStorage ─────────────────────────────────────────────────

async function uploadToStorage(
  png: Uint8Array,
  fileName: string,
  serviceKey: string
): Promise<void> {
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/posts/${fileName}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "image/png",
        "x-upsert": "true",
      },
      body: png,
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Storage upload failed: ${res.status} ${err}`);
  }
}

// ─── TASK-06: nextPublishDate ─────────────────────────────────────────────────

async function nextPublishDate(serviceKey: string): Promise<string> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/content_queue?select=publish_date&order=publish_date.desc&limit=1`,
    {
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
    }
  );
  const rows: Array<{ publish_date: string }> = await res.json();

  const base = rows[0]?.publish_date
    ? new Date(rows[0].publish_date + "T00:00:00Z")
    : new Date();

  base.setUTCDate(base.getUTCDate() + 1);
  while (!PUBLISH_DAYS.includes(base.getUTCDay())) {
    base.setUTCDate(base.getUTCDate() + 1);
  }
  return base.toISOString().split("T")[0];
}

// ─── TASK-07: insertToQueue + markIdeaProcessed + markIdeaFailed ──────────────

async function insertToQueue(
  idea: ContentIdea,
  copy: GeneratedCopy,
  imageFile: string,
  publishDate: string,
  serviceKey: string
): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/content_queue`, {
    method: "POST",
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      id: `reddit-${idea.id.slice(0, 12)}`,
      day: 0,
      publish_date: publishDate,
      platforms: ["instagram"],
      type: "image",
      image_file: imageFile,
      caption: copy.caption,
      published: false,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`insertToQueue failed: ${res.status} ${err}`);
  }
}

async function markIdeaProcessed(
  id: string,
  copy: GeneratedCopy,
  serviceKey: string
): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      generated_copy: copy.caption,
      generated_hashtags: copy.hashtags,
      status: "in_progress",
    }),
  });
}

async function markIdeaFailed(
  id: string,
  error: Error,
  serviceKey: string
): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/content_ideas?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({
      notes: `[ERROR ${new Date().toISOString()}] ${error.message}`,
    }),
  });
}

// ─── TASK-08: Handler principal ───────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  let ideaId: string | undefined;

  try {
    validateEnv();
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!;
    const serviceKey   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { idea_id } = await req.json();
    ideaId = idea_id;
    if (!ideaId) throw new Error("Missing idea_id in request body");

    const idea = await fetchIdea(ideaId, serviceKey);

    // Idempotencia: si ya tiene copy generado, saltear
    if (idea.generated_copy) {
      return new Response(
        JSON.stringify({ ok: true, skipped: true }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const copy        = await generateCopy(idea, anthropicKey);
    const png         = await generateImage(copy.hook, idea.origin, idea.score);
    const imageFile   = `reddit-${idea.id.slice(0, 12)}.png`;
    await uploadToStorage(png, imageFile, serviceKey);
    const publishDate = await nextPublishDate(serviceKey);
    await insertToQueue(idea, copy, imageFile, publishDate, serviceKey);
    await markIdeaProcessed(ideaId, copy, serviceKey);

    return new Response(
      JSON.stringify({ ok: true, publish_date: publishDate, image: imageFile }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    if (ideaId) {
      try {
        const sk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (sk) await markIdeaFailed(ideaId, error, sk);
      } catch (_) {
        // best-effort — no lanzar desde el catch
      }
    }
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
