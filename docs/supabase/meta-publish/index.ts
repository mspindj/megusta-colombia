import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAGE_ID = "1068628786330276";
const IG_ACCOUNT_ID = "17841480006391349";

interface PostRequest {
  message: string;
  imageUrl?: string;
  imageUrls?: string[]; // carousel: 2-10 images
  platforms?: string[];
}

async function publishToFacebook(token: string, message: string, imageUrl?: string): Promise<{ id: string }> {
  let url: string;
  let body: Record<string, string>;
  if (imageUrl) {
    url = `https://graph.facebook.com/v21.0/${PAGE_ID}/photos`;
    body = { url: imageUrl, caption: message, access_token: token };
  } else {
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

async function publishToInstagram(token: string, caption: string, imageUrl: string): Promise<{ id: string }> {
  const containerRes = await fetch(
    `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: imageUrl, caption, access_token: token }),
    }
  );
  const containerData = await containerRes.json();
  if (containerData.error) throw new Error(`IG container: ${containerData.error.message}`);
  const containerId = containerData.id;
  await new Promise((r) => setTimeout(r, 5000));
  const publishRes = await fetch(
    `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: containerId, access_token: token }),
    }
  );
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`IG publish: ${publishData.error.message}`);
  return { id: publishData.id };
}

// ─── Carousel (2-10 images) ─────────────────────────────────────────────────
//
// Flujo Meta para carruseles (distinto al de imagen única):
//   1. Un contenedor POR imagen, con is_carousel_item=true, SIN caption (Meta lo rechaza si lleva caption ahí)
//   2. Un contenedor "padre" media_type=CAROUSEL con children=[ids] y el caption ahí
//   3. Poll de status_code en el contenedor padre hasta FINISHED (puede tardar más que una imagen sola)
//   4. media_publish con el creation_id del contenedor padre

async function createCarouselItemContainer(token: string, imageUrl: string): Promise<string> {
  const res = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, is_carousel_item: true, access_token: token }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`IG carousel item container: ${data.error.message}`);
  return data.id;
}

async function pollContainerReady(token: string, containerId: string, maxAttempts = 10): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${token}`);
    const data = await res.json();
    if (data.status_code === "FINISHED") return;
    if (data.status_code === "ERROR") throw new Error(`IG container ${containerId} failed processing`);
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error(`IG container ${containerId} did not finish processing in time`);
}

async function publishCarouselToInstagram(token: string, caption: string, imageUrls: string[]): Promise<{ id: string }> {
  if (imageUrls.length < 2 || imageUrls.length > 10) {
    throw new Error(`IG carousel needs 2-10 images, got ${imageUrls.length}`);
  }
  const childIds: string[] = [];
  for (const url of imageUrls) {
    childIds.push(await createCarouselItemContainer(token, url));
  }

  const parentRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      media_type: "CAROUSEL",
      children: childIds,
      caption,
      access_token: token,
    }),
  });
  const parentData = await parentRes.json();
  if (parentData.error) throw new Error(`IG carousel parent container: ${parentData.error.message}`);
  const parentId = parentData.id;

  await pollContainerReady(token, parentId);

  const publishRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creation_id: parentId, access_token: token }),
  });
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`IG carousel publish: ${publishData.error.message}`);
  return { id: publishData.id };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST only" }), {
      status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
  try {
    const token = Deno.env.get("META_PAGE_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ error: "META_PAGE_TOKEN not configured" }), {
        status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    const body: PostRequest = await req.json();
    const { message, imageUrl, imageUrls, platforms = ["facebook", "instagram"] } = body;
    if (!message) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }
    const results: Record<string, { success: boolean; id?: string; error?: string }> = {};
    if (platforms.includes("facebook")) {
      try {
        // FB no soporta carrusel nativo vía este flujo simple; si es carrusel, usamos la primera imagen.
        const fb = await publishToFacebook(token, message, imageUrls?.[0] ?? imageUrl);
        results.facebook = { success: true, id: fb.id };
      } catch (err) {
        results.facebook = { success: false, error: err.message };
      }
    }
    if (platforms.includes("instagram")) {
      if (imageUrls && imageUrls.length > 1) {
        try {
          const ig = await publishCarouselToInstagram(token, message, imageUrls);
          results.instagram = { success: true, id: ig.id };
        } catch (err) {
          results.instagram = { success: false, error: err.message };
        }
      } else if (imageUrl) {
        try {
          const ig = await publishToInstagram(token, message, imageUrl);
          results.instagram = { success: true, id: ig.id };
        } catch (err) {
          results.instagram = { success: false, error: err.message };
        }
      } else {
        results.instagram = { success: false, error: "Instagram requires an imageUrl or imageUrls" };
      }
    }
    return new Response(JSON.stringify({ success: true, results }), {
      status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Publish failed" }), {
      status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
