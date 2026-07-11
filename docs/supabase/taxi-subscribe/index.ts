import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BREVO_LIST_ID = 3; // misma lista que subscribe existente

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
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { nombre, email, source, ciudad } = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Checked BEFORE the upsert — with updateEnabled:true, Brevo always
    // returns success (merge/update) for an existing contact, it never
    // returns duplicate_parameter. Same bug/fix as docs/supabase/subscribe.
    const isDuplicate = await contactAlreadyInList(email, BREVO_API_KEY, BREVO_LIST_ID);

    const brevoRes = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: nombre || "",
          SOURCE: source || "taxi-calculator",
          CIUDAD: ciudad ? ciudad.toUpperCase() : "",
        },
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    });

    // 204 = created, 2xx = ok
    if (brevoRes.status === 204 || brevoRes.ok) {
      return new Response(JSON.stringify({ success: true, isDuplicate }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const brevoData = await brevoRes.json();

    return new Response(
      JSON.stringify({ error: brevoData.message || "Subscription failed" }),
      {
        status: brevoRes.status,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      }
    );
  } catch (_err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
