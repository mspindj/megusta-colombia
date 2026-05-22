import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const KEYWORDS = [
  "colombia travel tips",
  "colombia first time",
  "visiting colombia",
  "bogota tips",
  "medellin tips",
  "cartagena tourist",
  "colombia solo travel",
  "colombia safety travel",
  "colombia digital nomad",
  "moving to colombia",
  "colombia vacation advice",
];

interface RedditPost {
  title: string;
  url: string;
  subreddit: string;
  score: number;
  num_comments: number;
  selftext: string;
}

async function searchReddit(query: string): Promise<RedditPost[]> {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&t=day&limit=10`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "MeGustaColombiaMonitor/1.0 (by megusta.com.co)",
    },
  });

  if (!res.ok) {
    console.error(`Reddit search failed for "${query}": ${res.status}`);
    return [];
  }

  const data = await res.json();
  if (!data?.data?.children) return [];

  return data.data.children.map((child: any) => ({
    title: child.data.title,
    url: `https://reddit.com${child.data.permalink}`,
    subreddit: child.data.subreddit_name_prefixed,
    score: child.data.score,
    num_comments: child.data.num_comments,
    selftext: child.data.selftext?.substring(0, 200) || "",
  }));
}

async function saveToNotion(posts: RedditPost[]): Promise<number> {
  const notionKey = Deno.env.get("NOTION_API_KEY")!;
  const databaseId = Deno.env.get("NOTION_REDDIT_DB_ID")!;
  let saved = 0;

  const knownSubreddits = [
    "r/colombia", "r/travel", "r/solotravel",
    "r/digitalnomad", "r/bogota", "r/medellin",
  ];

  for (const post of posts) {
    const subredditValue = knownSubreddits.includes(post.subreddit)
      ? post.subreddit
      : null;

    try {
      const properties: any = {
        "Title": { title: [{ text: { content: post.title.substring(0, 200) } }] },
        "URL": { url: post.url },
        "Score": { number: post.score },
        "Comments": { number: post.num_comments },
        "Found": { date: { start: new Date().toISOString().split("T")[0] } },
        "Responded": { checkbox: false },
        "Notes": { rich_text: [{ text: { content: post.selftext.substring(0, 200) } }] },
      };

      if (subredditValue) {
        properties["Subreddit"] = { select: { name: subredditValue } };
      }

      const res = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${notionKey}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties,
        }),
      });

      if (res.ok) saved++;
      else console.error(`Notion save failed: ${res.status} ${await res.text()}`);
    } catch (err) {
      console.error(`Failed to save: ${post.title}`, err);
    }
  }

  return saved;
}

async function sendNotification(posts: RedditPost[]): Promise<void> {
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  const notifyEmail = Deno.env.get("NOTIFY_EMAIL") || "hola@megusta.com.co";

  if (!brevoKey || posts.length === 0) return;

  const postList = posts
    .slice(0, 10)
    .map((p) => `[${p.score} up, ${p.num_comments} comments] ${p.subreddit}\n${p.title}\n${p.url}`)
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
      subject: `${posts.length} Reddit opportunities found`,
      textContent: `Reddit Monitor found ${posts.length} relevant posts:\n\n${postList}\n\nCheck the Reddit Opportunities database in Notion for the full list.`,
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const allPosts: RedditPost[] = [];
    const seenUrls = new Set<string>();

    for (const keyword of KEYWORDS) {
      const posts = await searchReddit(keyword);
      for (const post of posts) {
        if (!seenUrls.has(post.url) && post.score >= 2) {
          seenUrls.add(post.url);
          allPosts.push(post);
        }
      }
      // Respect rate limits: 10 req/min unauthenticated
      await new Promise((r) => setTimeout(r, 7000));
    }

    allPosts.sort((a, b) => b.score - a.score);
    const topPosts = allPosts.slice(0, 20);

    const saved = await saveToNotion(topPosts);
    await sendNotification(topPosts);

    return new Response(
      JSON.stringify({
        success: true,
        found: allPosts.length,
        saved,
        top: topPosts.slice(0, 5).map((p) => ({
          title: p.title,
          score: p.score,
          subreddit: p.subreddit,
        })),
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Reddit monitor error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Monitor failed" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
