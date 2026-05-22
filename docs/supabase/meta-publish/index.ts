import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAGE_ID = "1068628786330276";
const IG_ACCOUNT_ID = "17841480006391349";

interface PostRequest {
  message: string;         // Text content for FB post / IG caption
  imageUrl?: string;       // Public URL to image (required for IG, optional for FB)
  platforms?: string[];    // ["facebook", "instagram"] — defaults to both
}

// ===== FACEBOOK: Publish a post to the Page =====
async function publishToFacebook(token: string, message: string, imageUrl?: string): Promise<{ id: string }> {
  let url: string;
  let body: Record<string, string>;

  if (imageUrl) {
    // Photo post
    url = `https://graph.facebook.com/v21.0/${PAGE_ID}/photos`;
    body = { url: imageUrl, caption: message, access_token: token };
  } else {
    // Text-only post
    url = `https://graph.facebook.com/v21.0/${PAGE_ID}/feed`;
    body = { message, access_token: token };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.error) throw new Error(`FB: ${data.error.message}`);
  return { id: data.id || data.post_id };
}

// ===== INSTAGRAM: Publish a photo post =====
// IG requires a 2-step process: 1) Create media container, 2) Publish it
async function publishToInstagram(token: string, caption: string, imageUrl: string): Promise<{ id: string }> {
  // Step 1: Create media container
  const containerRes = await fetch(
    `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: token,
      }),
    }
  );

  const containerData = await containerRes.json();
  if (containerData.error) throw new Error(`IG container: ${containerData.error.message}`);

  const containerId = containerData.id;

  // Wait for container to be ready (IG processes the image)
  await new Promise((r) => setTimeout(r, 5000));

  // Step 2: Publish the container
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerId,
        access_token: token,
      }),
    }
  );

  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`IG publish: ${publishData.error.message}`);
  return { id: publishData.id };
}

// ===== MAIN HANDLER =====
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const token = Deno.env.get("META_PAGE_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ error: "META_PAGE_TOKEN not configured" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const body: PostRequest = await req.json();
    const { message, imageUrl, platforms = ["facebook", "instagram"] } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const results: Record<string, { success: boolean; id?: string; error?: string }> = {};

    // Publish to Facebook
    if (platforms.includes("facebook")) {
      try {
        const fb = await publishToFacebook(token, message, imageUrl);
        results.facebook = { success: true, id: fb.id };
      } catch (err) {
        results.facebook = { success: false, error: err.message };
      }
    }

    // Publish to Instagram (requires image)
    if (platforms.includes("instagram")) {
      if (!imageUrl) {
        results.instagram = { success: false, error: "Instagram requires an imageUrl" };
      } else {
        try {
          const ig = await publishToInstagram(token, message, imageUrl);
          results.instagram = { success: true, id: ig.id };
        } catch (err) {
          results.instagram = { success: false, error: err.message };
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Publish failed" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
