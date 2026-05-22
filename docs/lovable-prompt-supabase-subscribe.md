# Lovable Prompt — Supabase Edge Function + Update Lead Capture Form

> Single prompt that creates the Edge Function and updates the frontend

---

## Prompt

We need to move the Brevo API call from the frontend to a Supabase Edge Function so the API key stays server-side. This fixes the "authentication not found in headers" error and is more secure.

### 1. Create Supabase Edge Function: `subscribe`

Create a new Edge Function called `subscribe` that acts as a proxy to Brevo's contacts API. It should:

- Accept POST requests with `{ email }` in the body
- Validate the email format
- Call Brevo's API at `https://api.brevo.com/v3/contacts` using the `BREVO_API_KEY` secret (stored in Supabase Edge Function secrets, accessed via `Deno.env.get("BREVO_API_KEY")`)
- Send the contact to list ID 3 with `updateEnabled: true`
- Handle duplicate contacts gracefully (Brevo returns `duplicate_parameter` — treat as success)
- Return `{ success: true }` on success or `{ error: "message" }` on failure
- Include CORS headers for `Access-Control-Allow-Origin: *` and handle OPTIONS preflight
- **Disable JWT verification** — this function is called publicly from the landing page form without authentication

Here's the Edge Function code:

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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
    const { email } = await req.json();

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

    if (brevoResponse.status === 204 || brevoResponse.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const brevoData = await brevoResponse.json();

    if (brevoData.code === "duplicate_parameter") {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: brevoData.message || "Subscription failed" }), {
      status: brevoResponse.status,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
```

### 2. Update the lead capture form in `src/pages/Index.tsx`

Replace the current `handleLeadSubmit` function. Instead of calling Brevo directly from the browser, call the Supabase Edge Function:

```typescript
const handleLeadSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!leadEmail || !leadEmail.includes('@')) {
    setLeadError('Enter a valid email address');
    setLeadStatus('error');
    return;
  }

  setLeadStatus('loading');
  setLeadError('');

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/subscribe`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: leadEmail }),
      }
    );

    const data = await response.json();

    if (data.success) {
      setLeadStatus('success');
    } else {
      setLeadError(data.error || 'Something went wrong. Try again or email hola@megusta.com.co');
      setLeadStatus('error');
    }
  } catch (err) {
    setLeadError('Connection error. Try again or email hola@megusta.com.co');
    setLeadStatus('error');
  }
};
```

### 3. Clean up

- Remove any references to `import.meta.env.VITE_BREVO_API_KEY` — no longer needed
- Remove the `api-key` header from any frontend fetch calls
- Remove any console.log debug lines related to the Brevo key
- The `VITE_SUPABASE_URL` should already be available since Lovable connects to Supabase automatically

### 4. Add Supabase Edge Function Secret

After deploying the Edge Function, add the Brevo API key as a secret called `BREVO_API_KEY` in the Supabase Edge Function secrets. The API key value is the Brevo API key from the project credentials.

### Summary

The flow is now:
```
Browser form → Supabase Edge Function → Brevo API
               (BREVO_API_KEY stored here)
```

No API keys in the frontend. More secure. No Lovable Cloud build secrets needed.
