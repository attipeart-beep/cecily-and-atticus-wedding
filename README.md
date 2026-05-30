# Cecily & Atticus — Wedding Website

A static, multi-page wedding website. No build step, no dependencies — just open the files or drop the folder on any static host.

**10th December 2026 · Babington House, Somerset**

## Pages
| File | Purpose |
|------|---------|
| `index.html`    | Home — hero, countdown, details at a glance |
| `schedule.html` | The Day — arrival info, hour-by-hour timeline, dress code |
| `rsvp.html`     | RSVP form (wired to Formspree) |
| `travel.html`   | Travel & Accommodation, map, practicalities |
| `faq.html`      | Q&A accordion |

Shared styling lives in `css/styles.css`; shared behaviour in `js/main.js`. Images are in `images/`.

## 1. Wire up RSVPs (Formspree)
The RSVP form currently runs in **demo mode** (it shows the thank-you message but doesn't send anywhere).

To receive real RSVPs by email:
1. Go to [formspree.io](https://formspree.io), sign up (free tier is fine), and create a **New form**.
2. Copy the form's endpoint — it looks like `https://formspree.io/f/abcdwxyz`.
3. In `rsvp.html`, find this line and replace `YOUR_FORM_ID` with your real ID:
   ```html
   <form id="rsvp-form" ... action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
4. Submit one test RSVP and confirm the first email (Formspree asks you to verify once).

RSVPs will then arrive in your email and in the Formspree dashboard. The form already sends: name, email, attending (yes/no), guest count, staying-over, dietary needs, song request, and a message.

## 2. Things to personalise
- **Contact email:** replace `hello@example.com` in `rsvp.html` and `faq.html`.
- **RSVP deadline:** currently *1st October 2026* (in `rsvp.html` and `faq.html`).
- **Schedule times:** placeholder timings in `schedule.html` — update to your real running order.
- **Venue address / map:** the map points to Babington House BA11 3RW — adjust in `travel.html` if needed.
- **Gift list, plus-ones, taxi numbers:** edit the relevant answers in `faq.html`.

## 3. Preview locally
```bash
cd cecily-and-atticus-wedding
python3 -m http.server 8000
# then open http://localhost:8000
```

## 4. Publish (free options)
- **Netlify Drop:** drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **Vercel / GitHub Pages:** push the folder to a repo and connect it.
- Or upload to any web host — it's plain HTML/CSS/JS.

## Design
Palette and typography are drawn from the invitation stationery: olive green, cream, and burgundy
pinstripe on a sage background, with *Pinyon Script* (names), *Cormorant Garamond* (headings) and
*EB Garamond* (body). The couple's black-and-white photo is the lead image on the home page.
