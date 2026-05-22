# Lovable Prompt — Lead Magnet Email Capture Section

> Copy-paste this prompt into Lovable to add the email capture form to the landing page.

---

## Prompt

Add a new **Lead Magnet Email Capture** section to the landing page, positioned **between the Loss Aversion section and the Cities section**. This section offers a free "Colombia Arrival Cheat Sheet" PDF in exchange for the visitor's email address.

### Section Design

**Layout:** Full-width section with `bg-card` background and top/bottom borders (same pattern as Loss Aversion section). Max-width content container centered.

**Structure (top to bottom):**

1. **Mono label** (same style as other sections):
   - Text: `FREE INTEL // ARRIVAL CHEAT SHEET`
   - Style: monospace, 10px, letter-spacing 3px, gold-dim color, uppercase

2. **Headline:**
   - Text: "Land in Colombia like you've been before."
   - Style: 2xl-3xl bold, white

3. **Subtext:**
   - Text: "Free 1-page PDF — airport hacks, taxi prices, first-day survival moves. Delivered to your inbox in 60 seconds. No spam, just intel."
   - Style: text-secondary, max-width ~lg

4. **Email form (inline on desktop, stacked on mobile):**
   - Email input field: placeholder "your@email.com", dark background (#0a0a0a), border matching other cards
   - Submit button: "Send Me the Cheat Sheet" — gold background, black text, same style as main CTAs
   - The input and button should be side-by-side on desktop (flex-row), stacked on mobile (flex-col)

5. **Trust line below the form:**
   - Text: "Join 2,847+ travelers who showed up prepared. Unsubscribe anytime."
   - Style: text-xs text-muted, centered

### Form Behavior

**States:**
- **Idle:** Form visible, button says "Send Me the Cheat Sheet"
- **Loading:** Button shows a spinner or "Sending..." text, input disabled
- **Success:** Hide the form. Show a success message: "Check your inbox — intel incoming." with a checkmark icon in gold
- **Error:** Show inline error below the form in red: "Something went wrong. Try again or email us at hola@megusta.com.co"

**Validation:**
- Client-side email format validation before submitting
- Show validation error inline: "Enter a valid email address"

### Form Submission — Brevo Integration

Use Brevo's (formerly Sendinblue) API to add the contact. Since this is a client-side app, use one of these approaches:

**Option A — Brevo embedded form (simplest):**
Embed Brevo's subscription form using an iframe or their JS snippet. The form ID will be provided after Brevo setup. For now, use a placeholder:

```html
<!-- Replace with actual Brevo form embed code -->
<iframe src="https://sibforms.com/serve/PLACEHOLDER_FORM_ID" style="border:none;width:100%;"></iframe>
```

**Option B — Custom form with Brevo DOI API (better UX):**
Submit to Brevo's double opt-in endpoint (no API key needed client-side):

```typescript
const handleSubmit = async (email: string) => {
  const response = await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': import.meta.env.VITE_BREVO_API_KEY, // set in environment
    },
    body: JSON.stringify({
      email,
      includeListIds: [parseInt(import.meta.env.VITE_BREVO_LIST_ID)],
      templateId: 1, // Brevo DOI confirmation template ID
      redirectionUrl: 'https://megusta.com.co',
    }),
  });
  // handle response...
};
```

**Option C — Placeholder for now:**
If Brevo isn't set up yet, implement the form UI with a `console.log` of the email on submit, and show the success state. Add a `TODO` comment where the API call should go. This lets us ship the UI now and wire up Brevo later.

**Use Option C for now** — we'll wire up Brevo after account setup.

### Environment Variables (when Brevo is ready)

Add to the project's environment:
```
VITE_BREVO_API_KEY=your-brevo-api-key
VITE_BREVO_LIST_ID=your-list-id
```

### Animations

- Section should fade in on scroll (same as other sections with Framer Motion)
- Success state should animate in smoothly
- Button hover: same gold-light transition as other CTAs

### Responsive

- Desktop: input + button side by side in a single row
- Mobile: input full width, button full width below it
- Padding and spacing consistent with other sections (py-24 px-6)

### Section ID

Add `id="free-intel"` to the section so we can link to it from the nav or other CTAs. Also consider updating the "Want this city?" text on coming-soon cards to link to `#free-intel` instead of being a dead link.
