import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PIXEL_ID = "1525809615712600";
const NOTIFY_EMAIL = "hola@megusta.com.co";

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function sendMetaCAPI(
  email: string,
  sourceUrl: string,
  accessToken: string,
  eventId: string,
): Promise<void> {
  const emailHash = await sha256(email);
  const eventTime = Math.floor(Date.now() / 1000);

  const payload = {
    data: [{
      event_name: "Lead",
      event_time: eventTime,
      event_id: eventId,
      action_source: "website",
      event_source_url: sourceUrl,
      user_data: {
        em: [emailHash],
      },
    }],
  };

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const result = await res.json();
  console.log("Meta CAPI:", JSON.stringify(result));
}

async function sendLeadNotification(
  email: string,
  sourceUrl: string,
  userAgent: string,
  brevoApiKey: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  const colombiaTime = new Date().toLocaleString("es-CO", { timeZone: "America/Bogota" });

  const htmlContent = `
    <!DOCTYPE html>
    <html><body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background:#0a0a0a; color:#fff; padding:24px; max-width:560px; margin:0 auto;">
      <div style="border-left: 3px solid #d4a843; padding-left:16px; margin-bottom:24px;">
        <p style="color:#d4a843; font-family: monospace; font-size:11px; letter-spacing:0.2em; margin:0 0 4px;">NEW LEAD // MEGUSTA.COM.CO</p>
        <h1 style="color:#fff; font-size:24px; margin:0;">${email}</h1>
      </div>
      <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <tr><td style="color:#888; padding:6px 12px 6px 0; vertical-align:top;">Hora (COL)</td><td style="color:#fff; padding:6px 0;">${colombiaTime}</td></tr>
        <tr><td style="color:#888; padding:6px 12px 6px 0; vertical-align:top;">UTC</td><td style="color:#fff; padding:6px 0;">${timestamp}</td></tr>
        <tr><td style="color:#888; padding:6px 12px 6px 0; vertical-align:top;">Source URL</td><td style="color:#fff; padding:6px 0; word-break:break-all;">${sourceUrl}</td></tr>
        <tr><td style="color:#888; padding:6px 12px 6px 0; vertical-align:top;">User Agent</td><td style="color:#aaa; padding:6px 0; font-size:11px; word-break:break-all;">${userAgent}</td></tr>
      </table>
      <p style="color:#666; font-size:11px; margin-top:24px; font-family:monospace;">Sent automatically by /functions/v1/subscribe</p>
    </body></html>
  `.trim();

  const payload = {
    sender: { name: "Me Gusta Intel", email: NOTIFY_EMAIL },
    to: [{ email: NOTIFY_EMAIL, name: "Me Gusta Admin" }],
    subject: `Nuevo lead: ${email}`,
    htmlContent,
  };

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": brevoApiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("Lead notification email failed:", res.status, errBody);
  } else {
    console.log("Lead notification email sent for", email);
  }
}

async function contactAlreadyInList(
  email: string,
  brevoApiKey: string,
  listId: number
): Promise<boolean> {
  const res = await fetch(
    `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`,
    { headers: { "accept": "application/json", "api-key": brevoApiKey } }
  );
  if (res.status === 404) return false;
  if (!res.ok) {
    console.error("Brevo contact lookup failed:", res.status, await res.text());
    return false; // fail open — treat as new lead rather than silently drop it
  }
  const data = await res.json();
  const listIds: number[] = data.listIds || [];
  return listIds.includes(listId);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { email, event_id } = await req.json();
    const eventId: string = event_id || crypto.randomUUID();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      console.error("BREVO_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Checked BEFORE the upsert below — with updateEnabled:true, Brevo always
    // returns success (merge/update) for an existing contact, it never returns
    // duplicate_parameter. Relying on that error code to detect repeat
    // submissions was silently dead code and re-notified/re-fired CAPI on
    // every resubmit (e.g. the same visitor submitting both the hero form and
    // the sticky mobile bar). This pre-check is the real duplicate guard.
    const isDuplicate = await contactAlreadyInList(email, BREVO_API_KEY, 3);

    const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        listIds: [3],
        updateEnabled: true,
      }),
    });

    const isSuccess = brevoResponse.status === 204 || brevoResponse.ok;

    if (!isSuccess) {
      const brevoData = await brevoResponse.json();
      console.error("Brevo API error:", JSON.stringify(brevoData));
      return new Response(
        JSON.stringify({ error: brevoData.message || "Subscription failed" }),
        {
          status: brevoResponse.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const sourceUrl = req.headers.get("referer") || "https://megusta.com.co";
    const userAgent = req.headers.get("user-agent") || "unknown";

    if (!isDuplicate) {
      // Notificación a hola@megusta.com.co — fire-and-forget
      sendLeadNotification(email, sourceUrl, userAgent, BREVO_API_KEY).catch(err =>
        console.error("Lead notification error (non-blocking):", err)
      );

      // Meta CAPI — fire-and-forget
      const CAPI_TOKEN = Deno.env.get("META_CAPI_ACCESS_TOKEN");
      if (CAPI_TOKEN) {
        sendMetaCAPI(email, sourceUrl, CAPI_TOKEN, eventId).catch(err =>
          console.error("Meta CAPI error (non-blocking):", err)
        );
      }
    }

    return new Response(JSON.stringify({ success: true, isDuplicate }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Subscribe function error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
