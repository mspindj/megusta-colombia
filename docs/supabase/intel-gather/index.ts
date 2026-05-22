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
const SUBREDDITS = ["Colombia", "bogota", "medellin", "digitalnomad"];
const APIFY_ACTOR = "trudax~reddit-scraper";
const NOTIFICATION_EMAIL = "mspin.dj@gmail.com";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RedditPost {
  title: string;
  url: string;      // permalink completo (https://reddit.com/r/...)
  score: number;    // upvotes
  subreddit: string; // nombre sin "r/"
}

interface InsertResult {
  inserted: number;
  titles: string[]; // títulos de los 5 primeros insertados
}

// ─── TASK-01: validateEnv ─────────────────────────────────────────────────────

// REQ-02: verifica los 3 secrets requeridos antes de cualquier llamada externa
function validateEnv(): void {
  const required = ["APIFY_TOKEN", "BREVO_API_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
  for (const varName of required) {
    if (!Deno.env.get(varName)) {
      throw new Error(`Missing env: ${varName}`);
    }
  }
}

// ─── TASK-02: runApifyActor ───────────────────────────────────────────────────

// REQ-03, REQ-04, REQ-05
async function runApifyActor(token: string): Promise<RedditPost[]> {
  // 1. Lanzar run con waitForFinish=120
  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${APIFY_ACTOR}/runs?waitForFinish=120`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startUrls: SUBREDDITS.map((sub) => ({
          url: `https://www.reddit.com/r/${sub}/hot/`,
        })),
        maxItems: 30,
        maxPostCount: 30,
        skipComments: true,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ["RESIDENTIAL"],
        },
      }),
    }
  );

  const runJson = await runRes.json();
  const data = runJson.data ?? runJson;

  // 2. Verificar que el run terminó con éxito
  if (data.status !== "SUCCEEDED") {
    throw new Error(`Apify run failed: ${data.status}`);
  }

  // 3. Fetch del dataset
  const datasetRes = await fetch(
    `https://api.apify.com/v2/datasets/${data.defaultDatasetId}/items?clean=true&format=json`,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }
  );
  const items: Record<string, unknown>[] = await datasetRes.json();

  // 4. Mapeo defensivo
  const posts: RedditPost[] = items
    .map((item) => ({
      title: (item.title ?? item.name ?? "Sin título") as string,
      url: (item.url ?? item.link ?? item.permalink ?? "") as string,
      score: Number(item.score ?? item.upvotes ?? 0),
      subreddit: (item.community ?? item.subreddit ?? "") as string,
    }))
    // 5. Descartar items sin URL
    .filter((p) => p.url !== "");

  return posts;
}

// ─── TASK-03: getExistingUrls ─────────────────────────────────────────────────

// REQ-07: consulta content_ideas para deduplicar por URL
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

// ─── TASK-04: insertIdeas ─────────────────────────────────────────────────────

// REQ-06 + REQ-07 + REQ-08: filtra y hace bulk INSERT
async function insertIdeas(
  posts: RedditPost[],
  existingUrls: Set<string>,
  serviceKey: string
): Promise<InsertResult> {
  // 1. Filtrar score < 10 (REQ-06)
  // 2. Filtrar URLs duplicadas (REQ-07)
  const filtered = posts
    .filter((p) => p.score >= 10)
    .filter((p) => !existingUrls.has(p.url));

  // 3. Si array vacío → early return sin hacer POST
  if (filtered.length === 0) {
    return { inserted: 0, titles: [] };
  }

  // 4. Mapear a rows para INSERT
  const rows = filtered.map((post) => ({
    source: "reddit",
    origin: `r/${post.subreddit}`,
    title: post.title.slice(0, 500),
    url: post.url,
    score: post.score,
    content_type: "image",
    status: "pending",
  }));

  // 5. Bulk INSERT
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

  // 6. Retornar resultado
  return {
    inserted: rows.length,
    titles: rows.slice(0, 5).map((r) => r.title),
  };
}

// ─── TASK-05: Notificaciones ──────────────────────────────────────────────────

// REQ-09: email de éxito con count + top 5 + link al dashboard
async function sendSuccessNotification(
  result: InsertResult,
  brevoKey: string
): Promise<void> {
  const subject =
    result.inserted === 0
      ? "☕ 0 ideas nuevas — nada nuevo esta semana"
      : `☕ ${result.inserted} ideas nuevas para Me Gusta Colombia`;

  const titlesHtml =
    result.titles.length > 0
      ? `<ol>${result.titles.map((t) => `<li>${t}</li>`).join("")}</ol>`
      : "<p><em>Ningún título para mostrar.</em></p>";

  const htmlContent = `
    <h2>${result.inserted} ideas nuevas listas para revisar</h2>
    <p>Fuente: Reddit (r/Colombia, r/bogota, r/medellin, r/digitalnomad)</p>
    <h3>Top 5 títulos:</h3>
    ${titlesHtml}
    <p><a href="${SUPABASE_DASHBOARD}">→ Abrir dashboard de Supabase</a></p>
  `;

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: "hello@megusta.com.co", name: "Me Gusta Colombia" },
      to: [{ email: NOTIFICATION_EMAIL, name: "Miguel" }],
      subject,
      htmlContent,
    }),
  });
}

// REQ-10: email de error con mensaje + timestamp
async function sendErrorNotification(
  error: Error,
  brevoKey: string
): Promise<void> {
  const subject = `🚨 intel-gather falló — ${error.message.slice(0, 80)}`;

  const htmlContent = `
    <h2>intel-gather encontró un error</h2>
    <p><strong>Mensaje:</strong> ${error.message}</p>
    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
  `;

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: "hello@megusta.com.co", name: "Me Gusta Colombia" },
      to: [{ email: NOTIFICATION_EMAIL, name: "Miguel" }],
      subject,
      htmlContent,
    }),
  });
}

// ─── TASK-06: Handler principal ───────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    // REQ-02: validar secrets antes de cualquier llamada
    validateEnv();
    const apifyToken = Deno.env.get("APIFY_TOKEN")!;
    const brevoKey = Deno.env.get("BREVO_API_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // REQ-03, REQ-04, REQ-05: scrapear Reddit via Apify
    const posts = await runApifyActor(apifyToken);

    // REQ-07: obtener URLs existentes para dedup
    const existingUrls = await getExistingUrls(serviceKey);

    // REQ-06, REQ-07, REQ-08: filtrar e insertar
    const result = await insertIdeas(posts, existingUrls, serviceKey);

    // REQ-09: notificar éxito (incluso si inserted === 0)
    await sendSuccessNotification(result, brevoKey);

    return new Response(
      JSON.stringify({ ok: true, inserted: result.inserted }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    // REQ-10: intentar notificar por email si tenemos la key
    try {
      const brevoKey = Deno.env.get("BREVO_API_KEY");
      if (brevoKey) await sendErrorNotification(error, brevoKey);
    } catch (_) {
      // No lanzar desde el catch — la notificación es best-effort
    }

    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
