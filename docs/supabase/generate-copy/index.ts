import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CITIES = [
  {
    name: "Bogotá",
    code: "BOG-72H",
    tagline: "No dar papaya",
    gumroadUrl: "https://megustacomco.gumroad.com/l/bogota72hours",
    highlights: "2,600m altitude, world-class food scene, La Candelaria, Zona G, Monserrate, TransMilenio chaos",
  },
  {
    name: "Medellín",
    code: "MDE-72H",
    tagline: "The Mirage is real",
    gumroadUrl: "https://megustacomco.gumroad.com/l/medellin-survival-vault",
    highlights: "Eternal spring weather, Poblado vs real Medellín, metro culture, Comuna 13, nightlife zones",
  },
  {
    name: "Cartagena",
    code: "CTG-72H",
    tagline: "Cógela Suave",
    gumroadUrl: "https://megustacomco.gumroad.com/l/cartagena-survival-vault",
    highlights: "Walled city, Caribbean heat, highest gringo markup, Getsemaní, Bocagrande, beach vendors",
  },
];

const CHANNEL_PROMPTS: Record<string, string> = {
  Pinterest: `Write a Pinterest pin description (under 500 characters). Make it searchable with travel keywords. Include a call to action. Format: Hook line + 2-3 benefit bullets + CTA. No hashtags in the description.`,
  Reddit: `Write a helpful Reddit comment that could respond to someone asking about traveling to this city. Be genuinely helpful, not salesy. Mention 2-3 specific tactical tips. At the end, casually mention "I put together a guide with more of this kind of stuff" with the link. Keep it under 150 words. Sound like a real person, not a brand.`,
  Facebook: `Write a Facebook post (under 280 characters) with an attention-grabbing hook about this city. Use a conversational tone. Include a CTA to get the guide. No emojis.`,
  Instagram: `Write an Instagram caption (under 2200 characters). Start with a bold hook line. Share one surprising or useful fact about the city. End with a CTA. Add 10-15 relevant hashtags at the end separated by line breaks.`,
  Email: `Write an email subject line (under 60 characters) that would make someone planning a trip to Colombia open the email. Make it curiosity-driven or fear-based (loss aversion). Also write a 2-sentence preview text.`,
};

async function generateCopy(city: typeof CITIES[0], channel: string): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

  const systemPrompt = `You are a copywriter for Me Gusta Colombia (megusta.com.co), a brand that sells tactical 72-hour survival guides for travelers visiting Colombian cities. The tone is: direct, no-BS, insider knowledge, slightly edgy. NOT a tourist guide — this is local intelligence. Never use the word "vibrant" or "bustling". Never be generic.`;

  const userPrompt = `Generate copy for: ${city.name} (${city.code})
City tagline: "${city.tagline}"
City highlights: ${city.highlights}
Product URL: ${city.gumroadUrl}
Price: $17

Channel: ${channel}
${CHANNEL_PROMPTS[channel]}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await res.json();
  return data.content?.[0]?.text || "Generation failed";
}

async function saveToNotion(city: string, channel: string, copy: string): Promise<boolean> {
  const notionKey = Deno.env.get("NOTION_API_KEY")!;
  const databaseId = Deno.env.get("NOTION_COPY_DB_ID")!;

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${notionKey}`,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        "Copy": { title: [{ text: { content: copy.substring(0, 200) } }] },
        "City": { select: { name: city } },
        "Channel": { select: { name: channel } },
        "Generated": { date: { start: new Date().toISOString().split("T")[0] } },
        "Used": { checkbox: false },
        "Notes": { rich_text: [{ text: { content: copy.length > 200 ? copy : "" } }] },
      },
    }),
  });

  return res.ok;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // Parse optional body for specific city/channel
    let targetCity: string | null = null;
    let targetChannel: string | null = null;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        targetCity = body.city || null;
        targetChannel = body.channel || null;
      } catch {
        // No body = generate all
      }
    }

    const cities = targetCity
      ? CITIES.filter((c) => c.name === targetCity)
      : CITIES;

    const channels = targetChannel
      ? [targetChannel]
      : Object.keys(CHANNEL_PROMPTS);

    const results: Array<{ city: string; channel: string; preview: string }> = [];

    for (const city of cities) {
      for (const channel of channels) {
        const copy = await generateCopy(city, channel);
        await saveToNotion(city.name, channel, copy);
        results.push({
          city: city.name,
          channel,
          preview: copy.substring(0, 100) + "...",
        });

        // Small delay to respect API rate limits
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    return new Response(
      JSON.stringify({ success: true, generated: results.length, results }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Copy generator error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Generation failed" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
