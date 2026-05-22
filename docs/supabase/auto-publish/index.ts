import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAGE_ID = "1068628786330276";
const IG_ACCOUNT_ID = "17841480006391349";
const STORAGE_BASE = "https://uocwxwvcrnkfnnoyjzyb.supabase.co/storage/v1/object/public/content/posts";

// Content queue - each entry is a scheduled post
// When this function runs, it picks the next unpublished entry and publishes it
interface ScheduledPost {
  id: string;
  day: number; // Day of the content plan (1-30)
  platforms: string[]; // ["facebook", "instagram"]
  type: "image" | "video" | "text"; // Post type
  imageFile?: string; // Filename in storage (e.g., "C1-01-Hook.png")
  videoFile?: string; // Filename in storage (e.g., "reel-01-taxi.mp4")
  caption: string; // Post caption/text
  published?: boolean;
}

// Week 1-2 content queue
const CONTENT_QUEUE: ScheduledPost[] = [
  // Day 2: Pinterest pin (FB + IG image post)
  {
    id: "day2-pin-bogota",
    day: 2,
    platforms: ["facebook", "instagram"],
    type: "image",
    imageFile: "C2-02-Taxi.png",
    caption: `Airport taxi in Bogota.\n\nTourists pay $40.\nLocals pay $8.\n\nSame ride. Different knowledge.\n\nThis is just one of 50+ situations covered in the full survival guide.\n\nFree Arrival Cheat Sheet: megusta.com.co\n\n#ColombiaTravel #VisitColombia #BogotaTravel #MeGustaColombia #NoDarPapaya #TravelScam #AirportTaxi #ColombiaGuide #SoloTravelColombia #TravelSafety`,
  },
  // Day 3: $40 taxi story (FB text + IG image)
  {
    id: "day3-taxi-story",
    day: 3,
    platforms: ["facebook"],
    type: "text",
    caption: `It happens every single day at El Dorado airport.\n\nA tired traveler walks out of arrivals. A friendly guy says "Taxi, amigo?" and grabs their suitcase. Twenty minutes later, they're paying $40 for a ride that should cost $8.\n\nThe worst part? They don't even know they got scammed until a local tells them days later.\n\nThis is just ONE of 50+ situations we cover in the full 72-hour guide.\n\nFree Arrival Cheat Sheet with real prices for 3 cities: megusta.com.co`,
  },
  // Day 4: Apps to download (FB + IG)
  {
    id: "day4-apps",
    day: 4,
    platforms: ["facebook", "instagram"],
    type: "image",
    imageFile: "C4-04-Phone.png",
    caption: `Lost your phone in Colombia?\n\nDon't panic. Walk into any high-end hotel.\nAsk the lobby to call you a taxi.\n\nDo NOT flag one on the street while distressed.\n\nMore emergency intel in the full survival guide.\n\nmegusta.com.co\n\n#ColombiaTravel #TravelSafety #EmergencyTips #MeGustaColombia #BogotaTravel #MedellinTravel #CartagenaTravel #SoloTravelColombia`,
  },
  // Day 5: Bogota Face carousel slide (IG)
  {
    id: "day5-bogota-face",
    day: 5,
    platforms: ["instagram"],
    type: "image",
    imageFile: "C1-03-Eyes.png",
    caption: `The Bogota Face Protocol.\n\nRule 01: Eyes forward.\nNot scanning the ceiling. Not looking lost.\n\nBogota doesn't punish tourists for being foreign. It punishes them for being distracted.\n\nThis is from Chapter 1 of the Bogota Survival Vault — 7 chapters of city-specific intel for $17.\n\nmegusta.com.co\n\n#BogotaTravel #ColombiaTravel #MeGustaColombia #NoDarPapaya #TravelTips #ColombiaGuide #SoloTravelColombia #DigitalNomadColombia`,
  },
  // Day 6: Reddit positioning (FB)
  {
    id: "day6-reddit",
    day: 6,
    platforms: ["facebook"],
    type: "text",
    caption: `Reddit has 200 threads from 2019 about traveling to Colombia.\n\nWe have 9 chapters of current, city-specific intel.\n\nThe difference: Reddit is a research project. This is a briefing.\n\nRead it on your phone on the plane. No app, no internet needed.\n\n$17 per city. $37 for the Explorer Bundle (3 cities, save 27%).\n\nmegusta.com.co`,
  },
  // Day 8: Spanish phrases (FB + IG)
  {
    id: "day8-phrases",
    day: 8,
    platforms: ["facebook", "instagram"],
    type: "image",
    imageFile: "C3-03-Script.png",
    caption: `The Front Seat Script.\n\nIn Colombia, always sit in the front of the Uber.\n\nFist bump. Say "Que mas, bien o que?"\n\nSitting in back = "I am a foreign client."\nSitting in front = "I am a friend."\n\nA driver who sees you as a friend protects you and charges you fairly.\n\nThis works in all 3 cities. 27 chapters of intel like this in the Explorer Bundle.\n\nmegusta.com.co\n\n#ColombiaTravel #MeGustaColombia #TravelHack #UberColombia #MedellinTravel #BogotaTravel #CartagenaTravel #NoDarPapaya #SoloTravelColombia`,
  },
  // Day 10: Gringo prices (FB + IG)
  {
    id: "day10-gringo-prices",
    day: 10,
    platforms: ["facebook", "instagram"],
    type: "image",
    imageFile: "C2-03-Food.png",
    caption: `Lunch in El Poblado, Medellin.\n\nTourist pays: $22\nLocal pays: $8\n\nSame quality. Different neighborhood.\n\nThe free Arrival Cheat Sheet has real prices for Bogota, Medellin & Cartagena.\n\nmegusta.com.co\n\n#MedellinTravel #ColombiaTravel #GringoPrices #MeGustaColombia #FoodColombia #TravelBudget #DigitalNomadColombia #ElPoblado #SoloTravelColombia`,
  },
  // Day 13: Red flag (FB + IG)
  {
    id: "day13-redflag",
    day: 13,
    platforms: ["facebook", "instagram"],
    type: "image",
    imageFile: "C4-03-Robbed.png",
    caption: `If you are robbed in Colombia:\n\nDo not chase.\nDo not fight.\n\nAssets are replaceable.\nYou are not.\n\nFile a police report online: adenunciar.policia.gov.co\nWalk into a high-end hotel for help.\n\nFull emergency intel (hospitals, embassies, safe zones) in every city guide.\n\nmegusta.com.co\n\n#ColombiaTravel #TravelSafety #EmergencyTips #MeGustaColombia #NoDarPapaya #SoloTravelColombia #BogotaTravel #MedellinTravel #CartagenaTravel`,
  },
];

async function publishToFacebook(token: string, caption: string, imageUrl?: string): Promise<{ id: string }> {
  let url: string;
  let params: Record<string, string>;

  if (imageUrl) {
    url = `https://graph.facebook.com/v21.0/${PAGE_ID}/photos`;
    params = { url: imageUrl, caption, access_token: token };
  } else {
    url = `https://graph.facebook.com/v21.0/${PAGE_ID}/feed`;
    params = { message: caption, access_token: token };
  }

  const body = new URLSearchParams(params);
  const res = await fetch(url, { method: "POST", body });
  const data = await res.json();
  if (data.error) throw new Error(`FB: ${data.error.message}`);
  return { id: data.id || data.post_id };
}

async function publishToInstagram(token: string, caption: string, imageUrl: string): Promise<{ id: string }> {
  const containerBody = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: token,
  });
  const containerRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media`, {
    method: "POST",
    body: containerBody,
  });
  const containerData = await containerRes.json();
  if (containerData.error) throw new Error(`IG: ${containerData.error.message}`);

  await new Promise((r) => setTimeout(r, 5000));

  const publishBody = new URLSearchParams({
    creation_id: containerData.id,
    access_token: token,
  });
  const publishRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media_publish`, {
    method: "POST",
    body: publishBody,
  });
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`IG publish: ${publishData.error.message}`);
  return { id: publishData.id };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const token = Deno.env.get("META_PAGE_TOKEN");
    if (!token) throw new Error("META_PAGE_TOKEN not configured");

    // Determine which post to publish
    let targetId: string | null = null;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        targetId = body.postId || null;
      } catch {}
    }

    // Find the post
    let post: ScheduledPost | undefined;
    if (targetId) {
      post = CONTENT_QUEUE.find((p) => p.id === targetId);
    }

    if (!post) {
      return new Response(
        JSON.stringify({
          error: "Post not found",
          available: CONTENT_QUEUE.map((p) => ({ id: p.id, day: p.day })),
        }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const results: Record<string, { success: boolean; id?: string; error?: string }> = {};

    const imageUrl = post.imageFile ? `${STORAGE_BASE}/${post.imageFile}` : undefined;

    for (const platform of post.platforms) {
      if (platform === "facebook") {
        try {
          const fb = await publishToFacebook(token, post.caption, imageUrl);
          results.facebook = { success: true, id: fb.id };
        } catch (err) {
          results.facebook = { success: false, error: err.message };
        }
      }

      if (platform === "instagram" && imageUrl) {
        try {
          const ig = await publishToInstagram(token, post.caption, imageUrl);
          results.instagram = { success: true, id: ig.id };
        } catch (err) {
          results.instagram = { success: false, error: err.message };
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, postId: post.id, day: post.day, results }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
