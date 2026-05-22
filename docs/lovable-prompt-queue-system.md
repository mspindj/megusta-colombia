> Refactor the auto-publish system to use a database queue instead of hardcoded post IDs in pg_cron. Also fix IG Reels publishing.

## What needs to change

### 1. Create a `content_queue` table in Supabase

Run this migration:

```sql
CREATE TABLE content_queue (
  id TEXT PRIMARY KEY,           -- e.g. "day4-phone-tip"
  day INTEGER NOT NULL,          -- content plan day number
  publish_date DATE,             -- scheduled publish date (optional)
  platforms TEXT[] NOT NULL,     -- ["facebook", "instagram"]
  type TEXT NOT NULL,            -- "image" | "video" | "text"
  image_file TEXT,               -- filename in storage/content/posts/
  video_file TEXT,               -- filename in storage/content/reels/
  caption TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  fb_post_id TEXT,
  ig_post_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Seed the table with Week 2-4 content

```sql
INSERT INTO content_queue (id, day, publish_date, platforms, type, image_file, caption) VALUES
('day4-phone-tip', 4, '2026-04-14', ARRAY['facebook','instagram'], 'image', 'C4-04-Phone.png',
'Lost your phone in Colombia?

Don''t panic. Walk into any high-end hotel.
Ask the lobby to call you a taxi.

Do NOT flag one on the street while distressed.

More emergency intel in the full survival guide.

megusta.com.co

#ColombiaTravel #TravelSafety #EmergencyTips #MeGustaColombia #BogotaTravel #MedellinTravel #CartagenaTravel #SoloTravelColombia'),

('day5-bogota-face', 5, '2026-04-21', ARRAY['instagram'], 'image', 'C1-03-Eyes.png',
'The Bogota Face Protocol.

Rule 01: Eyes forward.
Not scanning the ceiling. Not looking lost.

Bogota doesn''t punish tourists for being foreign. It punishes them for being distracted.

This is from Chapter 1 of the Bogota Survival Vault — 7 chapters of city-specific intel for $17.

megusta.com.co

#BogotaTravel #ColombiaTravel #MeGustaColombia #NoDarPapaya #TravelTips #ColombiaGuide #SoloTravelColombia #DigitalNomadColombia'),

('day8-phrases', 8, '2026-04-18', ARRAY['facebook','instagram'], 'image', 'C3-03-Script.png',
'The Front Seat Script.

In Colombia, always sit in the front of the Uber.

Fist bump. Say "Que mas, bien o que?"

Sitting in back = "I am a foreign client."
Sitting in front = "I am a friend."

A driver who sees you as a friend protects you and charges you fairly.

This works in all 3 cities. 27 chapters of intel like this in the Explorer Bundle.

megusta.com.co

#ColombiaTravel #MeGustaColombia #TravelHack #UberColombia #MedellinTravel #BogotaTravel #CartagenaTravel #NoDarPapaya #SoloTravelColombia'),

('day10-gringo-prices', 10, '2026-04-25', ARRAY['facebook','instagram'], 'image', 'C2-03-Food.png',
'Lunch in El Poblado, Medellin.

Tourist pays: $22
Local pays: $8

Same quality. Different neighborhood.

The free Arrival Cheat Sheet has real prices for Bogota, Medellin & Cartagena.

megusta.com.co

#MedellinTravel #ColombiaTravel #GringoPrices #MeGustaColombia #FoodColombia #TravelBudget #DigitalNomadColombia #ElPoblado #SoloTravelColombia'),

('day13-redflag', 13, '2026-04-28', ARRAY['facebook','instagram'], 'image', 'C4-03-Robbed.png',
'If you are robbed in Colombia:

Do not chase.
Do not fight.

Assets are replaceable.
You are not.

File a police report online: adenunciar.policia.gov.co
Walk into a high-end hotel for help.

Full emergency intel (hospitals, embassies, safe zones) in every city guide.

megusta.com.co

#ColombiaTravel #TravelSafety #EmergencyTips #MeGustaColombia #NoDarPapaya #SoloTravelColombia #BogotaTravel #MedellinTravel #CartagenaTravel');

-- Reel posts (video)
INSERT INTO content_queue (id, day, publish_date, platforms, type, video_file, caption) VALUES
('reel-02-frontseat', 2, '2026-04-16', ARRAY['facebook','instagram'], 'video', 'reel-02-frontseat.mp4',
'The front seat rule.

In Colombia, always sit in front with your Uber driver.

Fist bump. Say "Que mas, bien o que?"

Back seat = foreign client.
Front seat = friend.

A driver who sees you as a friend protects you.

Full survival guide: megusta.com.co

#ColombiaTravel #MeGustaColombia #TravelHack #UberColombia #MedellinTravel #BogotaTravel #NoDarPapaya #SoloTravelColombia'),

('reel-03-emergency', 3, '2026-04-20', ARRAY['facebook','instagram'], 'video', 'reel-03-emergency.mp4',
'The one number every traveler needs in Colombia.

123

Police. Fire. Ambulance.

Save this. You might need it.

Full emergency guide: megusta.com.co

#ColombiaTravel #TravelSafety #EmergencyTips #MeGustaColombia #BogotaTravel #MedellinTravel #CartagenaTravel #SoloTravelColombia'),

('reel-04-poblado', 4, '2026-04-23', ARRAY['facebook','instagram'], 'video', 'reel-04-poblado.mp4',
'El Poblado looks like Miami.

But thieves go where the iPhones are.

In the barrio, you are a person.
In Poblado, you are a target.

Full Medellin guide: megusta.com.co

#MedellinTravel #ColombiaTravel #ElPoblado #MeGustaColombia #TravelSafety #NoDarPapaya #SoloTravelColombia #DigitalNomadColombia'),

('reel-05-papaya', 5, '2026-04-27', ARRAY['facebook','instagram'], 'video', 'reel-05-papaya.mp4',
'The golden rule of Colombia.

No dar papaya.

Don''t make yourself a target.

Free cheat sheet: megusta.com.co

#ColombiaTravel #NoDarPapaya #MeGustaColombia #TravelSafety #BogotaTravel #MedellinTravel #CartagenaTravel #SoloTravelColombia');
```

### 3. Update the `auto-publish` Edge Function

Replace the current function with this version that reads from the database. **Disable JWT verification.**

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PAGE_ID = "1068628786330276";
const IG_ACCOUNT_ID = "17841480006391349";
const STORAGE_BASE = "https://uocwxwvcrnkfnnoyjzyb.supabase.co/storage/v1/object/public/content";

async function publishToFacebook(token: string, caption: string, mediaUrl?: string, isVideo = false): Promise<{ id: string }> {
  let url: string;
  let params: Record<string, string>;

  if (isVideo) {
    url = `https://graph.facebook.com/v21.0/${PAGE_ID}/videos`;
    params = { file_url: mediaUrl!, description: caption, access_token: token };
  } else if (mediaUrl) {
    url = `https://graph.facebook.com/v21.0/${PAGE_ID}/photos`;
    params = { url: mediaUrl, caption, access_token: token };
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

async function publishImageToInstagram(token: string, caption: string, imageUrl: string): Promise<{ id: string }> {
  const containerBody = new URLSearchParams({ image_url: imageUrl, caption, access_token: token });
  const containerRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media`, {
    method: "POST", body: containerBody,
  });
  const containerData = await containerRes.json();
  if (containerData.error) throw new Error(`IG container: ${containerData.error.message}`);

  await new Promise((r) => setTimeout(r, 5000));

  const publishBody = new URLSearchParams({ creation_id: containerData.id, access_token: token });
  const publishRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media_publish`, {
    method: "POST", body: publishBody,
  });
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`IG publish: ${publishData.error.message}`);
  return { id: publishData.id };
}

async function publishReelToInstagram(token: string, caption: string, videoUrl: string): Promise<{ id: string }> {
  // Step 1: Create container
  const containerBody = new URLSearchParams({
    media_type: "REELS",
    video_url: videoUrl,
    caption,
    access_token: token,
  });
  const containerRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media`, {
    method: "POST", body: containerBody,
  });
  const containerData = await containerRes.json();
  if (containerData.error) throw new Error(`IG Reel container: ${containerData.error.message}`);

  // Step 2: Poll until FINISHED (max 60s)
  const containerId = containerData.id;
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code&access_token=${token}`
    );
    const statusData = await statusRes.json();
    if (statusData.status_code === "FINISHED") break;
    if (statusData.status_code === "ERROR") throw new Error(`IG Reel processing failed`);
  }

  // Step 3: Publish
  const publishBody = new URLSearchParams({ creation_id: containerId, access_token: token });
  const publishRes = await fetch(`https://graph.facebook.com/v21.0/${IG_ACCOUNT_ID}/media_publish`, {
    method: "POST", body: publishBody,
  });
  const publishData = await publishRes.json();
  if (publishData.error) throw new Error(`IG Reel publish: ${publishData.error.message}`);
  return { id: publishData.id };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });

  try {
    const token = Deno.env.get("META_PAGE_TOKEN");
    if (!token) throw new Error("META_PAGE_TOKEN not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get specific postId from body, or pick next unpublished by publish_date
    let postId: string | null = null;
    if (req.method === "POST") {
      try { const body = await req.json(); postId = body.postId || null; } catch {}
    }

    let query = supabase
      .from("content_queue")
      .select("*")
      .eq("published", false)
      .order("publish_date", { ascending: true })
      .limit(1);

    if (postId) {
      query = supabase.from("content_queue").select("*").eq("id", postId).single();
    }

    const { data: post, error } = await query;
    if (error || !post) {
      return new Response(JSON.stringify({ error: "No pending posts found", detail: error?.message }), {
        status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const results: Record<string, { success: boolean; id?: string; error?: string }> = {};
    const isVideo = post.type === "video";
    const imageUrl = post.image_file ? `${STORAGE_BASE}/posts/${post.image_file}` : undefined;
    const videoUrl = post.video_file ? `${STORAGE_BASE}/reels/${post.video_file}` : undefined;
    const mediaUrl = videoUrl || imageUrl;

    for (const platform of post.platforms) {
      if (platform === "facebook") {
        try {
          const fb = await publishToFacebook(token, post.caption, mediaUrl, isVideo);
          results.facebook = { success: true, id: fb.id };
        } catch (err) {
          results.facebook = { success: false, error: err.message };
        }
      }

      if (platform === "instagram") {
        try {
          let ig: { id: string };
          if (isVideo && videoUrl) {
            ig = await publishReelToInstagram(token, post.caption, videoUrl);
          } else if (imageUrl) {
            ig = await publishImageToInstagram(token, post.caption, imageUrl);
          } else {
            throw new Error("Instagram requires image or video URL");
          }
          results.instagram = { success: true, id: ig.id };
        } catch (err) {
          results.instagram = { success: false, error: err.message };
        }
      }
    }

    // Mark as published if at least one platform succeeded
    const anySuccess = Object.values(results).some((r) => r.success);
    if (anySuccess) {
      await supabase.from("content_queue").update({
        published: true,
        published_at: new Date().toISOString(),
        fb_post_id: results.facebook?.id,
        ig_post_id: results.instagram?.id,
        error: null,
      }).eq("id", post.id);
    } else {
      await supabase.from("content_queue").update({
        error: JSON.stringify(results),
      }).eq("id", post.id);
    }

    return new Response(
      JSON.stringify({ success: true, postId: post.id, results }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
```

### 4. Update pg_cron — single job, no postId needed

Delete the existing auto-publish cron jobs and replace with these 2 (images Mon+Fri, Reels Wed+Sun are still manual for now):

```sql
-- Remove old jobs
SELECT cron.unschedule('auto-publish-mon');
SELECT cron.unschedule('auto-publish-fri');

-- Single job that picks next unpublished post by date automatically
SELECT cron.schedule(
  'auto-publish-mon',
  '0 14 * * 1',
  $$SELECT net.http_post(url := 'https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/auto-publish', headers := '{"Content-Type":"application/json"}'::jsonb, body := '{}'::jsonb);$$
);

SELECT cron.schedule(
  'auto-publish-fri',
  '0 14 * * 5',
  $$SELECT net.http_post(url := 'https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/auto-publish', headers := '{"Content-Type":"application/json"}'::jsonb, body := '{}'::jsonb);$$
);
```

No more manual rotation. The function picks the next post by `publish_date` automatically.

### 5. To publish Reels manually (no code change needed)

```bash
curl -X POST "https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/auto-publish" \
  -H "Content-Type: application/json" \
  -d '{"postId": "reel-02-frontseat"}'
```

This will handle both FB + IG Reel with the 2-step process automatically.

## Summary of changes
- New `content_queue` table with full Week 2-4 schedule seeded
- auto-publish reads from DB instead of hardcoded array
- IG Reels now supported (2-step container + poll + publish)
- pg_cron jobs need no manual rotation — always picks next by date
- Reels can be published manually via `{"postId": "reel-XX"}` call
