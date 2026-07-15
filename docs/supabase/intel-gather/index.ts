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

// Queries via Apify's Google Search Results Scraper (apify/google-search-scraper).
// HN Algolia se descartó (2026-07-01): las queries travel-focused sobre Colombia
// no tienen volumen suficiente en HN — 0 hits en las 8 queries con points>5.
// Reddit directo también se descartó: 403 incluso con proxy residential (Apify
// Reddit Scraper probado en vivo, bloqueado igual que desde Fly.io/Supabase).
// Google Search Scraper rodea el bloqueo buscando site:reddit.com — Google sí
// indexa esos hilos aunque Reddit bloquee el scraping directo.
// Las últimas 3 cruzan con los modismos ya usados en el cheat sheet / guías
// (no dar papaya, que más bien o qué, cuánto cuesta, de una) para no repetir
// ángulos ya cubiertos y detectar modismos faltantes (ej. quiubo).
const SEARCH_QUERIES = [
  "colombia digital nomad site:reddit.com",
  "medellin OR bogota OR cartagena expat site:reddit.com",
  "colombia travel scam OR ripoff site:reddit.com",
  "colombia expat forum",
  "medellin travel guide 2026",
  "bogota safety tips foreigners",
  "cartagena tourist trap OR overcharge",
  "colombia sim card airport OR taxi tips",
  '"no dar papaya" reddit OR blog meaning',
  "colombian slang foreigners should know site:reddit.com",
  '"que mas" OR "quiubo" colombia greeting explained',
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
  // Institucional — nunca acusar/especular sobre policía, migración, gobierno (1 Jul 2026)
  "police corruption",
  "corrupt cop",
  "corrupt police",
  "bribe",
  "payoff",
  "extortion",
  "dirty cops",
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
  const required = ["BREVO_API_KEY", "SUPABASE_SERVICE_ROLE_KEY", "APIFY_TOKEN"];
  for (const varName of required) {
    if (!Deno.env.get(varName)) {
      throw new Error(`Missing env: ${varName}`);
    }
  }
}

// ─── fetchGoogleSearchResults ───────────────────────────────────────────────
//
// Usa apify/google-search-scraper via el endpoint run-sync-get-dataset-items,
// que corre el actor y devuelve el dataset en una sola llamada (sin polling).
// Todas las queries van en un solo run (separadas por \n) — un solo
// apify-actor-start charge en vez de uno por query.
//
// Respaldo: si la cuenta principal de Apify se quedó sin créditos (402) o el
// token es inválido/revocado (401/403), reintenta una vez con APIFY_TOKEN_BACKUP
// (cuenta hola@miguelespinosa.co, compartida con el agente newsletter-kb —
// agregada 15 Jul 2026). No reintenta en errores 4xx/5xx que fallarían igual
// con cualquier token (query mal formada, Apify caído, etc).

async function runApifyGoogleSearch(apifyToken: string): Promise<Response> {
  const url =
    `https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items` +
    `?token=${apifyToken}`;

  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      queries: SEARCH_QUERIES.join("\n"),
      maxPagesPerQuery: 1,
      resultsPerPage: 10,
      countryCode: "us",
      languageCode: "en",
    }),
  });
}

async function fetchGoogleSearchResults(
  apifyToken: string,
  apifyBackupToken?: string
): Promise<{ posts: ContentPost[]; usedBackup: boolean }> {
  let res = await runApifyGoogleSearch(apifyToken);
  let usedBackup = false;

  if (!res.ok && [401, 402, 403].includes(res.status) && apifyBackupToken) {
    console.warn(`Apify cuenta principal falló (${res.status}) — reintentando con APIFY_TOKEN_BACKUP`);
    res = await runApifyGoogleSearch(apifyBackupToken);
    usedBackup = true;
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Apify Google Search Scraper failed: ${res.status} ${errText}`);
  }

  const items: Array<Record<string, unknown>> = await res.json();
  const allPosts: ContentPost[] = [];
  const seenUrls = new Set<string>();

  for (const item of items) {
    const term = String((item.searchQuery as Record<string, unknown> | undefined)?.term ?? "?");
    const results = (item.organicResults as Array<Record<string, unknown>> | undefined) ?? [];

    results.forEach((r, idx) => {
      const resultUrl = String(r.url ?? "");
      const title = String(r.title ?? "Sin título");
      if (!resultUrl || seenUrls.has(resultUrl)) return;
      seenUrls.add(resultUrl);

      allPosts.push({
        title,
        url: resultUrl,
        // Sin concepto de "points" como en HN/Reddit — usamos la posición
        // en resultados de Google como proxy de relevancia (1er lugar = 10).
        score: Math.max(1, 10 - idx),
        origin: `Google: ${term}`,
      });
    });
  }

  return { posts: allPosts, usedBackup };
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

  const filtered = posts
    .filter((p) => !existingUrls.has(p.url))
    .filter((p) => !isBlocked(p.title));

  if (filtered.length === 0) {
    return { inserted: 0, titles: [] };
  }

  const rows = filtered.map((post) => ({
    source: "google-search",
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
  brevoKey: string,
  usedBackup: boolean
): Promise<void> {
  const subject =
    result.inserted === 0
      ? `☕ 0 ideas nuevas — ${fetched} resultados revisados sin novedades`
      : `☕ ${result.inserted} ideas nuevas para Me Gusta Colombia`;

  const titlesHtml =
    result.titles.length > 0
      ? `<ol>${result.titles.map((t) => `<li>${t}</li>`).join("")}</ol>`
      : "<p><em>Ningún título para mostrar.</em></p>";

  const backupWarning = usedBackup
    ? `<p style="color:#b45309;"><strong>⚠️ La cuenta principal de Apify se quedó sin créditos (o el token falló) — esta corrida usó la cuenta de respaldo (hola@miguelespinosa.co). Revisa/recarga la cuenta principal.</strong></p>`
    : "";

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": brevoKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { email: "hello@megusta.com.co", name: "Me Gusta Colombia" },
      to: [{ email: NOTIFICATION_EMAIL, name: "Miguel" }],
      subject,
      htmlContent: `
        <h2>${result.inserted} ideas nuevas listas para revisar</h2>
        ${backupWarning}
        <p>Fuente: Google Search Scraper (Apify) — ${SEARCH_QUERIES.length} queries</p>
        <p>Resultados revisados: ${fetched} | Insertados: ${result.inserted}</p>
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
    const apifyToken = Deno.env.get("APIFY_TOKEN")!;
    const apifyBackupToken = Deno.env.get("APIFY_TOKEN_BACKUP");

    const { posts, usedBackup } = await fetchGoogleSearchResults(apifyToken, apifyBackupToken);
    const existingUrls = await getExistingUrls(serviceKey);
    const result = await insertIdeas(posts, existingUrls, serviceKey);

    await sendSuccessNotification(result, posts.length, brevoKey, usedBackup);

    return new Response(
      JSON.stringify({ ok: true, fetched: posts.length, inserted: result.inserted, usedBackup }),
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
