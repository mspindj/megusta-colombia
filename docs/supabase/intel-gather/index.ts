import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ─── Constants ────────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = "https://uocwxwvcrnkfnnoyjzyb.supabase.co";
const SUPABASE_DASHBOARD =
  "https://supabase.com/dashboard/project/uocwxwvcrnkfnnoyjzyb/editor";
const NOTIFICATION_EMAIL = "hola@megusta.com.co";

// Términos de búsqueda en Hacker News via Algolia — TRAVEL-FOCUSED.
// Las queries genéricas ("colombia", "bogota") traían demasiado amarillismo
// (cartel, fraude, política). Estas queries son más específicas para viajes/turismo/nómadas.
// Reddit bloqueado desde IPs de Fly.io (403). Apify trial expirado 2026-05-26.
const HN_QUERIES = [
  "colombia digital nomad",
  "medellin coworking",
  "bogota remote work",
  "colombia travel",
  "cartagena tourism",
  "colombia expat",
  "colombia visa nomad",
  "medellin tourism",
];

// Filtro de exclusión — descarta títulos con noticias amarillistas / no-travel.
// Caso-insensitive, match parcial. Si el título contiene CUALQUIERA de estas, se descarta.
const BLOCKED_KEYWORDS = [
  "cartel",
  "drug trafficking",
  "narco",
  "kidnap",
  "killed",
  "murder",
  "shooting",
  "terror",
  "war on",
  "militar",
  "tax fraud",
  "money laundering",
  "british columbia", // falso positivo común
  "shakira", // celeb gossip
  "petro", // política
  "guerrilla",
  "farc",
  "eln",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContentPost {
  title: string;
  url: string;
  score: number;
  origin: string;
}

interface InsertResult {
  inserted: number;
  titles: string[];
}

// ─── validateEnv ─────────────────────────────────────────────────────────────

function validateEnv(): void {
  // No necesitamos APIFY_TOKEN — usamos HN Algolia API (pública, sin auth)
  const required = ["BREVO_API_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
  for (const varName of required) {
    if (!Deno.env.get(varName)) {
      throw new Error(`Missing env: ${varName}`);
    }
  }
}

// ─── fetchHNPosts ─────────────────────────────────────────────────────────────
//
// Usa la API de búsqueda de Hacker News (Algolia).
// Endpoint: https://hn.algolia.com/api/v1/search
// Público, sin API key, funciona desde IPs de datacenter.
// Reddit bloqueaba con 403 desde Fly.io — por eso se migró a HN (2026-05-26).

async function fetchHNPosts(): Promise<ContentPost[]> {
  const allPosts: ContentPost[] = [];
  const seenIds = new Set<string>();

  for (const query of HN_QUERIES) {
    try {
      // Stories con al menos 5 puntos, últimos 6 meses
      const sixMonthsAgo = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 180;
      const url =
        `https://hn.algolia.com/api/v1/search` +
        `?query=${encodeURIComponent(query)}` +
        `&tags=story` +
        `&hitsPerPage=20` +
        `&numericFilters=points>5,created_at_i>${sixMonthsAgo}`;

      const res = await fetch(url, {
        headers: { "User-Agent": "megusta-colombia-intel/1.0" },
      });

      if (!res.ok) {
        console.warn(`HN search for "${query}" returned ${res.status}`);
        continue;
      }

      const json = await res.json();
      const hits: Array<Record<string, unknown>> = json.hits ?? [];

      for (const hit of hits) {
        const id = String(hit.objectID ?? "");
        if (!id || seenIds.has(id)) continue;
        seenIds.add(id);

        // URL: preferir el link externo, fallback al thread de HN
        const externalUrl = hit.url as string | undefined;
        const hnUrl = `https://news.ycombinator.com/item?id=${id}`;

        allPosts.push({
          title: String(hit.title ?? "Sin título"),
          url: externalUrl || hnUrl,
          score: Number(hit.points ?? 0),
          origin: `HN: ${query}`,
        });
      }
    } catch (err) {
      console.warn(`Error fetching HN for "${query}":`, err);
    }
  }

  return allPosts;
}

// ─── getExistingUrls ──────────────────────────────────────────────────────────

async function getExistingUrls(serviceKey: string): Promise<Set<string>> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/content_ideas?select=url`,
    {
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
    }
  );
  const rows: Array<{ url: string }> = await res.json();
  return new Set(rows.map((r) => r.url));
}

// ─── insertIdeas ─────────────────────────────────────────────────────────────

async function insertIdeas(
  posts: ContentPost[],
  existingUrls: Set<string>,
  serviceKey: string
): Promise<InsertResult> {
  // Filtro amarillismo: descarta títulos con keywords bloqueadas
  const isBlocked = (title: string): boolean => {
    const lower = title.toLowerCase();
    return BLOCKED_KEYWORDS.some((kw) => lower.includes(kw));
  };

  // Score mínimo 5 (HN tiene scores más bajos que Reddit)
  const filtered = posts
    .filter((p) => p.score >= 5)
    .filter((p) => !existingUrls.has(p.url))
    .filter((p) => !isBlocked(p.title));

  if (filtered.length === 0) {
    return { inserted: 0, titles: [] };
  }

  const rows = filtered.map((post) => ({
    source: "hackernews",
    origin: post.origin,
    title: post.title.slice(0, 500),
    url: post.url,
    score: post.score,
    content_type: "image",
    status: "pending",
  }));

  const res = await fetch(`${SUPABASE_URL}/rest/v1/content_ideas`, {
    method: "POST",
    headers: {
      "apikey": serviceKey,
      "Authorization": `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      "Prefer": "return=minimal",
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase INSERT failed: ${res.status} ${errText}`);
  }

  return {
    inserted: rows.length,
    titles: rows.slice(0, 5).map((r) => r.title),
  };
}

// ─── Notificaciones ───────────────────────────────────────────────────────────

async function sendSuccessNotification(
  result: InsertResult,
  fetched: number,
  brevoKey: string
): Promise<void> {
  const subject =
    result.inserted === 0
      ? `☕ 0 ideas nuevas — ${fetched} posts revisados sin novedades`
      : `☕ ${result.inserted} ideas nuevas para Me Gusta Colombia`;

  const titlesHtml =
    result.titles.length > 0
      ? `<ol>${result.titles.map((t) => `<li>${t}</li>`).join("")}</ol>`
      : "<p><em>Ningún título para mostrar.</em></p>";

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { email: "hello@megusta.com.co", name: "Me Gusta Colombia" },
      to: [{ email: NOTIFICATION_EMAIL, name: "Miguel" }],
      subject,
      htmlContent: `
        <h2>${result.inserted} ideas nuevas listas para revisar</h2>
        <p>Fuente: Hacker News Algolia API (${HN_QUERIES.join(", ")})</p>
        <p>Posts revisados: ${fetched} | Insertados: ${result.inserted}</p>
        <p><strong>Nota:</strong> "colombia" matchea también British Columbia — curar en dashboard.</p>
        <h3>Top 5 títulos:</h3>
        ${titlesHtml}
        <p><a href="${SUPABASE_DASHBOARD}">→ Abrir dashboard de Supabase</a></p>
      `,
    }),
  });
}

async function sendErrorNotification(error: Error, brevoKey: string): Promise<void> {
  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { email: "hello@megusta.com.co", name: "Me Gusta Colombia" },
      to: [{ email: NOTIFICATION_EMAIL, name: "Miguel" }],
      subject: `🚨 intel-gather falló — ${error.message.slice(0, 80)}`,
      htmlContent: `
        <h2>intel-gather encontró un error</h2>
        <p><strong>Mensaje:</strong> ${error.message}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
    }),
  });
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    validateEnv();
    const brevoKey = Deno.env.get("BREVO_API_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const posts = await fetchHNPosts();
    const existingUrls = await getExistingUrls(serviceKey);
    const result = await insertIdeas(posts, existingUrls, serviceKey);

    await sendSuccessNotification(result, posts.length, brevoKey);

    return new Response(
      JSON.stringify({ ok: true, fetched: posts.length, inserted: result.inserted }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    try {
      const brevoKey = Deno.env.get("BREVO_API_KEY");
      if (brevoKey) await sendErrorNotification(error, brevoKey);
    } catch (_) { /* best-effort */ }

    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
