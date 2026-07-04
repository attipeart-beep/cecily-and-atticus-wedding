# Cecily & Atticus — Wedding Website

A static, multi-page wedding website. No build step, no dependencies — just open the files or drop the folder on any static host.

**10th December 2026 · Babington House, Somerset**

## Pages
| File | Purpose |
|------|---------|
| `index.html`    | Home — hero, countdown, details at a glance |
| `schedule.html` | The Day — arrival info, hour-by-hour timeline, dress code |
| `rsvp.html`     | RSVP form (wired to Netlify Forms) |
| `travel.html`   | Travel & Accommodation, map, practicalities |
| `faq.html`      | Q&A accordion |

Shared styling lives in `css/styles.css`; shared behaviour in `js/main.js`. Images are in `images/`.

## 1. Publish on Netlify

The site is plain HTML/CSS/JS with no build step. Two ways to get it live:

**Option A — Netlify Drop (fastest, no account juggling)**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop) (sign in / sign up — free).
2. Drag the **whole `cecily-and-atticus-wedding` folder** onto the page.
3. It deploys in seconds to a `something-random.netlify.app` URL.
4. To redeploy after edits, drag the folder on again (or connect Git, below).

**Option B — Connect a Git repo (auto-deploys on every push)**
1. Push this folder to a GitHub repo.
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repo.
3. Leave build command blank and publish directory as `.` (the included `netlify.toml` already sets this). Deploy.
4. Every `git push` now redeploys automatically.

Either way, add a custom domain later under **Site → Domain management** if you want `cecilyandatticus.com` instead of the `.netlify.app` address.

## 2. RSVPs by email (Netlify Forms — already wired)

The RSVP form is set up for **Netlify Forms** — no third-party account, no API keys. Netlify detects the form on deploy and captures every submission.

After your **first deploy**, turn on email notifications:
1. Netlify dashboard → your site → **Forms**. You should see a form named **`rsvp`** (it appears once the site is deployed and the form has been detected).
2. Open it → **Settings & notifications** → **Add notification → Email notification**.
3. Send notifications to **cecandatti@gmail.com**. Save.
4. Submit one test RSVP on the live site and confirm the email arrives.

Every submission is also stored in the **Forms** tab, and you can export them as CSV. The form captures: guest 1 name/email/attendance, optional guest 2 name/email/attendance, on-site accommodation, dietary needs, and a message.

> **Local preview note:** when you open the site locally (file:// or `localhost`) there's no Netlify backend, so the form runs in **demo mode** — it shows the thank-you message but doesn't send. It only sends for real once deployed to Netlify. The free tier covers 100 submissions/month, which is plenty for a wedding.

### Optional: live spreadsheet tracker + branded email
For a Google Sheet that auto-fills with every RSVP **and** a styled notification
email in the wedding colours — all from your own Google account, no extra
services — follow **`tracker/SETUP.md`**. (It replaces the plain Netlify email.)

## 3. Things to personalise
- **RSVP deadline:** currently *1st August 2026* (in `rsvp.html` and `faq.html`).
- **Venue address / map:** the map points to Babington House BA11 3RW — adjust in `travel.html` if needed.
- **Taxi numbers:** placeholder entries in `travel.html`.

## 4. Preview locally
```bash
cd cecily-and-atticus-wedding
python3 -m http.server 8000
# then open http://localhost:8000
```

## Design
Palette and typography are drawn from the invitation stationery: olive green, cream, and burgundy
pinstripe on a sage background, with *Dawning of a New Day* (names & script headings), *Cormorant
Garamond* (headings) and *EB Garamond* (body). The couple's black-and-white photo is the lead image
on the home page.
