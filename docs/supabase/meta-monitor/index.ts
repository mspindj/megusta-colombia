import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAGE_ID = "1068628786330276";
const IG_ACCOUNT_ID = "17841480006391349";

// ===== FACEBOOK: Get recent comments and messages on page posts =====
async function getFBMentions(token: string): Promise<any[]> {
  // Get recent posts from the page
  const postsRes = await fetch(
    `https://graph.facebook.com/v21.0/${PAGE_ID}/posts?fields=id,message,created_time,comments{id,message,from,created_time}&limit=10&access_token=${token}`
  );
  const postsData = await postsRes.json();
  if (postsData.error) throw new Error(`FB posts: ${postsData.error.message}`);

  const mentions: any[] = [];

  for (const post of postsData.data || []) {
    if (post.comments?.data) {
      for (const comment of post.comments.data) {
        mentions.push({
          platform: "facebook",
          type: "comment",
          postId: post.id,
          commentId: comment.id,
          message: comment.message,
          from: comment.from?.name || "Unknown",
          createdAt: comment.created_time,
        });
      }
    }
  }

  return mentions;
}

// ===== INSTAGRAM: Get recent comments on media =====
async function getIGMentions(token: string): Promise<any[]> {
  // Get recent media
  const mediaRes = await fetch(
    `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media?fields=id,caption,timestamp,comments{id,text,username,timestamp}&limit=10&access_token=${token}`
  );
  const mediaData = await mediaRes.json();
  if (mediaData.error) throw new Error(`IG media: ${mediaData.error.message}`);

  const mentions: any[] = [];

  for (const media of mediaData.data || []) {
    if (media.comments?.data) {
      for (const comment of media.comments.data) {
        mentions.push({
          platform: "instagram",
          type: "comment",
          mediaId: media.id,
          commentId: comment.id,
          message: comment.text,
          from: comment.username,
          createdAt: comment.timestamp,
        });
      }
    }
  }

  return mentions;
}

// ===== INSTAGRAM: Get recent mentions/tags =====
async function getIGTags(token: string): Promise<any[]> {
  const tagsRes = await fetch(
    `https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/tags?fields=id,caption,username,timestamp&limit=10&access_token=${token}`
  );
  const tagsData = await tagsRes.json();
  if (tagsData.error) return []; // Tags endpoint may not be available in dev mode

  return (tagsData.data || []).map((tag: any) => ({
    platform: "instagram",
    type: "tag",
    mediaId: tag.id,
    message: tag.caption || "",
    from: tag.username,
    createdAt: tag.timestamp,
  }));
}

// ===== Send notification email via Brevo =====
async function sendNotification(mentions: any[]): Promise<void> {
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  const notifyEmail = Deno.env.get("NOTIFY_EMAIL") || "hola@megusta.com.co";

  if (!brevoKey || mentions.length === 0) return;

  const mentionList = mentions
    .slice(0, 15)
    .map((m) => `[${m.platform}] ${m.from}: ${m.message?.substring(0, 100) || "(no text)"}`)
    .join("\n\n");

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": brevoKey,
    },
    body: JSON.stringify({
      sender: { name: "Me Gusta Bot", email: notifyEmail },
      to: [{ email: notifyEmail }],
      subject: `${mentions.length} new interactions on FB/IG`,
      textContent: `Meta Monitor found ${mentions.length} new interactions:\n\n${mentionList}`,
    }),
  });
}

// ===== MAIN HANDLER =====
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const token = Deno.env.get("META_PAGE_TOKEN");
    if (!token) {
      return new Response(JSON.stringify({ error: "META_PAGE_TOKEN not configured" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const allMentions: any[] = [];

    // Facebook comments
    try {
      const fbMentions = await getFBMentions(token);
      allMentions.push(...fbMentions);
    } catch (err) {
      console.error("FB monitor error:", err.message);
    }

    // Instagram comments
    try {
      const igMentions = await getIGMentions(token);
      allMentions.push(...igMentions);
    } catch (err) {
      console.error("IG comments error:", err.message);
    }

    // Instagram tags
    try {
      const igTags = await getIGTags(token);
      allMentions.push(...igTags);
    } catch (err) {
      console.error("IG tags error:", err.message);
    }

    // Send notification if there are mentions
    await sendNotification(allMentions);

    return new Response(
      JSON.stringify({
        success: true,
        total: allMentions.length,
        facebook: allMentions.filter((m) => m.platform === "facebook").length,
        instagram: allMentions.filter((m) => m.platform === "instagram").length,
        recent: allMentions.slice(0, 5),
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Monitor failed" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
