# RSVP tracker + styled email — setup

This gives you **two things at once**, using only your existing Google account
(`cecandatti@gmail.com`) — no Zapier, no paid services:

1. **A live Google Sheet** that gains a row for every RSVP.
2. **A branded email** (in your wedding colours) to you for every RSVP.

It works by having Netlify send each RSVP to a tiny script attached to your Sheet.
Total time: ~10 minutes, mostly clicking.

---

## Step 1 — Make the tracker Sheet
1. Go to [sheets.new](https://sheets.new) (signed in as cecandatti@gmail.com).
2. Name it something like **“Wedding RSVPs”** (top-left).

## Step 2 — Add the script
1. In the Sheet menu: **Extensions → Apps Script**. A code editor opens in a new tab.
2. Delete any sample code in the editor.
3. Open **`rsvp-tracker.gs`** (in this folder), copy **all** of it, and paste it in.
4. Click the **💾 Save** icon.

## Step 3 — Deploy it as a web app (this creates the link Netlify will use)
1. Top-right: **Deploy → New deployment**.
2. Click the gear ⚙️ next to “Select type” → choose **Web app**.
3. Set:
   - **Description:** `RSVP receiver`
   - **Execute as:** **Me (cecandatti@gmail.com)**
   - **Who has access:** **Anyone**  ← important, so Netlify can reach it
4. Click **Deploy**.
5. It will ask you to **Authorize access** → choose your Google account →
   on the “Google hasn’t verified this app” screen, click **Advanced →
   Go to … (unsafe)** → **Allow**. (This is normal for your own scripts.)
6. Copy the **Web app URL** it shows (ends in `/exec`). Keep it handy.

> Quick check: paste that URL into a browser. You should see
> “Cecily & Atticus RSVP tracker is live.” If so, it’s working.

## Step 4 — Point Netlify at it
1. Netlify → your site → **Forms** (or **Site configuration → Notifications**).
2. Under **Form submission notifications** → **Add notification** →
   **Outgoing webhook**.
3. Set:
   - **Event to listen for:** New form submission
   - **URL to notify:** paste the **Web app URL** from Step 3
   - **Form:** `rsvp`
4. **Save.**

## Step 5 — Turn off the old plain email (optional but recommended)
You’re now getting the nicer email from the script, so the basic one is just a
duplicate (and it’s been unreliable):
- Same Notifications screen → find the **Email notification** → **delete** it
  (or leave it if you’d like both).

## Step 6 — Test
1. Submit a test RSVP on your live site (use a name like “Jane Smith”).
2. Within a few seconds you should get a **styled email** titled
   *“New RSVP from Jane”*, **and** a new row should appear in your Sheet.

---

## Changing things later
- **Email recipient / colours / wording:** edit `rsvp-tracker.gs`, then in the
  Apps Script editor do **Deploy → Manage deployments → ✏️ Edit → Version: New
  version → Deploy**. (Editing the code alone isn’t live until you redeploy.)
- **Spam guard:** set `SHARED_SECRET` in the script to a word, redeploy, and add
  `?key=THATWORD` to the end of the URL in the Netlify webhook.

## Troubleshooting
- **Row appears but no email:** the first run may need you to re-authorize
  `MailApp`. Re-run Step 3’s authorize, or in the editor run `doGet` once to
  trigger the permission prompt.
- **Nothing happens:** confirm the webhook URL ends in `/exec` (not `/dev`), and
  that “Who has access” is **Anyone**.
- **Email but no row:** make sure you pasted the script into the Apps Script of
  the *same* Sheet you’re checking.
