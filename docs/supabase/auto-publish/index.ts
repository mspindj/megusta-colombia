import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// auto-publish — disparado por pg_cron `auto-publish-rotate`:
//   0 14 * * 1,3,5,0  (14:00 UTC = 9am Colombia, lun/mié/vie/dom)
//
// Toma el próximo post de content_queue donde published=false AND publish_date<=today,
// lo publica en IG via meta-publish, y marca published=true.
//
// Notas:
// - Storage requiere JWT legacy (secret SERVICE_ROLE_JWT). El sb_secret_* inyectado
//   en SUPABASE_SERVICE_ROLE_KEY funciona para REST pero no para Storage.
// - meta-publish maneja el token de Meta internamente.
// - Solo publica 1 post por invocación (evita bombardear IG aunque haya backlog).
// - Reescrita 2026-05-27: antes leía de un array CONTENT_QUEUE hardcoded.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = "https://uocwxwvcrnkfnnoyjzyb.supabase.co";
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/content/posts`;
const META_PUBLISH_URL = `${SUPABASE_URL}/functions/v1/meta-publish`;

interface QueuePost {
  id: string;
  publish_date: string;
  type: string;
  image_file: string | null;
  video_file: string | null;
  caption: string;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

async function getNextPost(jwt: string): Promise<QueuePost | null> {
  const today = todayISO();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/content_queue?published=eq.false&publish_date=lte.${today}&order=publish_date.asc&limit=1&select=id,publish_date,type,image_file,video_file,caption`,
    { headers: { apikey: jwt, Authorization: `Bearer ${jwt}` } }
  );
  const rows: QueuePost[] = await res.json();
  return rows[0] ?? null;
}

interface PublishResult {
  success: boolean;
  ig_id?: string;
  fb_id?: string;
  error?: string;
}

async function publishViaMeta(post: QueuePost): Promise<PublishResult> {
  if (!post.image_file) {
    return { success: false, error: "No image_file in queue row" };
  }
  const imageUrl = `${STORAGE_BASE}/${post.image_file}`;
  // Limpieza: markdown bold no se renderiza en IG
  const message = post.caption.replace(/\*\*/g, "");

  const res = await fetch(META_PUBLISH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      imageUrl,
      platforms: ["instagram"], // FB requiere scope `pages_manage_posts` que el token actual no tiene
    }),
  });

  const data = await res.json();
  if (!data.success) {
    return { success: false, error: `meta-publish returned: ${JSON.stringify(data).slice(0, 200)}` };
  }
  const ig = data.results?.instagram;
  if (!ig?.success) {
    return { success: false, error: `IG: ${ig?.error || "unknown"}` };
  }
  return { success: true, ig_id: ig.id, fb_id: data.results?.facebook?.id };
}

async function markPublished(id: string, result: PublishResult, jwt: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/content_queue?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: jwt,
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      published: true,
      published_at: new Date().toISOString(),
      ig_post_id: result.ig_id ?? null,
      fb_post_id: result.fb_id ?? null,
      error: null,
    }),
  });
}

async function markFailed(id: string, error: string, jwt: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/rest/v1/content_queue?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: jwt,
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ error: error.slice(0, 500) }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });

  try {
    const jwt = Deno.env.get("SERVICE_ROLE_JWT");
    if (!jwt) throw new Error("Missing env: SERVICE_ROLE_JWT");

    const post = await getNextPost(jwt);
    if (!post) {
      return new Response(
        JSON.stringify({ ok: true, message: "No posts to publish today", date: todayISO() }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const result = await publishViaMeta(post);

    if (result.success) {
      await markPublished(post.id, result, jwt);
      return new Response(
        JSON.stringify({
          ok: true,
          published: post.id,
          ig_id: result.ig_id,
          publish_date: post.publish_date,
        }),
        { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    } else {
      await markFailed(post.id, result.error ?? "unknown", jwt);
      return new Response(
        JSON.stringify({ ok: false, queue_id: post.id, error: result.error }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
