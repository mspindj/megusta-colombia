# Brevo Setup Guide — Me Gusta Colombia Lead Magnet

Step-by-step to set up the email automation for the Arrival Cheat Sheet lead magnet.

---

## 1. Create Free Brevo Account

1. Go to [brevo.com](https://www.brevo.com) and sign up (free tier: 300 emails/day)
2. Complete the profile setup (company name: "Me Gusta Colombia")
3. Choose "Email Marketing" as your primary use case

---

## 2. Verify Sender Domain

1. Go to **Settings > Senders, Domains & Dedicated IPs > Domains**
2. Click **Add a domain** and enter `megusta.com.co`
3. Add the DNS records Brevo provides to your domain registrar (Hostinger):
   - **DKIM record** (TXT) — for email authentication
   - **Brevo code** (TXT) — for domain verification
4. Wait for verification (usually 5–30 minutes)
5. Once verified, go to **Senders** and add: `hola@megusta.com.co` with name "Me Gusta Colombia"

---

## 3. Create Contact List

1. Go to **Contacts > Lists**
2. Click **Create a list**
3. Name: `Lead Magnet — Arrival Cheat Sheet`
4. Folder: create a folder called "Me Gusta Colombia" (optional)
5. Note the **List ID** (visible in the list URL or settings) — you'll need this for the form integration

---

## 4. Generate API Key

1. Go to **Settings > SMTP & API > API Keys**
2. Click **Generate a new API key**
3. Name: `Website Lead Capture`
4. Copy and store the key securely
5. This key is used if you integrate via Brevo's API (alternative to embedded forms)

---

## 5. Upload the Cheat Sheet PDF

You have two options for delivering the PDF:

### Option A: Host on your domain (recommended)
1. Upload the PDF to your website's public folder (e.g., `megusta.com.co/downloads/arrival-cheat-sheet.pdf`)
2. Use this URL in Email 1's download button

### Option B: Use a file hosting service
1. Upload to Google Drive, Dropbox, or a file sharing service
2. Get a direct download link
3. Use this URL in Email 1's download button

---

## 6. Create Automation Workflow

1. Go to **Automations > Create an automation**
2. Click **Create a custom automation**
3. **Entry point:** "A contact is added to a list" → select "Lead Magnet — Arrival Cheat Sheet"
4. Add the following steps:

```
TRIGGER: Contact added to list "Lead Magnet — Arrival Cheat Sheet"
  |
  ├── STEP 1: Send Email 1 (Welcome + PDF delivery)
  |   Template: email-1-welcome.html
  |
  ├── WAIT: 2 days
  |
  ├── STEP 2: Send Email 2 (The $40 taxi mistake)
  |   Template: email-2-value.html
  |
  ├── WAIT: 3 days
  |
  ├── STEP 3: Send Email 3 (City picker)
  |   Template: email-3-city-picker.html
  |
  ├── WAIT: 3 days
  |
  └── STEP 4: Send Email 4 (Urgency close)
      Template: email-4-close.html
```

5. For each email step:
   - Click **Send an email**
   - Choose **Design from scratch > Paste your code**
   - Paste the HTML from the corresponding `docs/emails/email-*.html` file
   - Update the subject line as specified in each template
   - **Important:** In Email 1, update the `{{CHEAT_SHEET_PDF_URL}}` placeholder with your actual PDF URL

6. Activate the automation

---

## 7. Set Up the Lead Capture Form

### Option A: Brevo Embedded Form (simplest)

1. Go to **Contacts > Forms**
2. Click **Create a new subscription form**
3. Add field: Email (required)
4. Set the redirect/success message: "Check your inbox — intel incoming."
5. Assign to list: "Lead Magnet — Arrival Cheat Sheet"
6. Get the embed code (HTML snippet)
7. Give this snippet to Lovable to embed in the landing page

### Option B: Brevo AJAX API (more control over UI)

Use Brevo's subscription endpoint (no API key needed — uses list ID):
```
POST https://sibforms.com/serve/YOUR_FORM_ID
Content-Type: application/x-www-form-urlencoded

EMAIL=user@example.com
```

This is the approach the Lovable prompt in `docs/lovable-prompt-lead-capture.md` uses.

---

## 8. Test Everything

1. Subscribe with a test email
2. Verify the contact appears in the list
3. Check that Email 1 arrives immediately with the PDF link
4. Wait (or manually advance) to verify Emails 2–4 arrive on schedule
5. Check emails render correctly on mobile (Gmail app, Apple Mail)
6. Verify the unsubscribe link works in each email

---

## Free Tier Limits

- **300 emails/day** (more than enough to start)
- Unlimited contacts
- Automation workflows included
- No credit card required
- Brevo branding in footer (removable on paid plans)

---

## Upgrade Path

When the list grows past ~300 daily sends:
- **Starter plan:** $9/mo for 5,000 emails/month
- **Business plan:** $18/mo for 5,000 emails/month + no Brevo branding
- Consider upgrading when list reaches 500+ contacts
