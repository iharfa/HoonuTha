# Hoonu Tha 🌡️

**Hoonu Tha** (Dhivehi for *"is it hot?"*) is a Progressive Web App for kids (10+)
to run a real **citizen-science** investigation: measure the temperature of the
surfaces around their islands, then discover the **Urban Heat Island effect**,
**albedo**, and how **trees, shade & evapotranspiration** keep the islands cool.

## What it does
- **Measure** — a guided wizard: temperature → surface material → colour (for
  pavers, playground rubber and road-marking paint) → sun/shade → optional air
  temp, place and name. Ends with an instant mini-insight.
- **My Data** — charts built from the child's own readings: average heat by
  surface, an albedo-vs-temperature scatter, sun-vs-shade comparison, plus
  plain-language insights. Export to CSV.
- **Field Guide** — every surface (white/grey/brown/black sand, asphalt, pavers,
  playground rubber, road-marking paint, grass) with its albedo and what to expect.
- **Learn** — illustrated explainers: heat islands, albedo, trees &
  evapotranspiration, why materials differ.

## Science model
`lib/data.js` holds each material's approximate **albedo**; colour adjusts the
estimate (white/yellow/red road paint, coloured pavers & rubber); shade is
recorded per reading. Insights in `lib/insights.js` are driven by the kids'
own measurements, with teaching fallbacks when data is thin.

## Stack
Next.js 15 · React 19 · Tailwind 4. Charts are hand-drawn SVG so everything
works **offline** (service worker in `public/`).

## Classes & groups (for teachers / leaders)
Every reading belongs to a **group code** — one shared dataset per class, Scout
troop or Environment Club. Groups are approved by the programme admin:
1. A teacher goes to **/teachers** ("I'm a teacher" on the home page) and
   requests a group: school, class/group name, their name and **phone number**.
2. The admin reviews requests at **/admin** (enter `ADMIN_KEY`), calls the
   teacher for a run-through, taps **Approve**, and shares the join code /
   link (`/?group=<code>`) from there.
3. Kids join by tapping the **flag chip** in the header and typing the code,
   or by opening the share link — QR it on a projector. Everyone in the group
   sees the same charts and insights; **Export CSV** downloads the group's data.

**Location is recorded per reading**: the Measure wizard grabs GPS (rounded to
~11 m so it marks the surface, not the child) and falls back to requiring the
typed island/place if GPS is unavailable. Coordinates are in the CSV export.

Approved groups appear in the **public directory at /groups**, browsable
read-only by numeric id — join codes and phone numbers are never exposed
publicly (a code is also write access). Ad-hoc codes typed straight into the
chip still work for informal use — they're just not listed.

Devices with no code use the shared `demo` group (pre-seeded with sample data).
Note the optional "name" on readings is publicly visible; first names or team
names are best.

**Setup:** add an `ADMIN_KEY` environment variable (any long secret) in Vercel
→ Settings → Environment Variables, and locally in `.env.local`. Without it,
/admin and approvals are disabled.

## Data / backend
Readings are stored server-side via `/api/readings` so every child's data pools
into one shared dataset. `lib/db.js` uses **Neon Postgres** when `DATABASE_URL`
is set, and falls back to a local JSON file (`data/db.json`) for zero-config
dev. The client (`lib/store.js`) reads through the API, caches to `localStorage`
for offline use, and **queues readings made offline**, syncing them when the
connection returns. The `readings` table is created and seeded automatically on
first use.

To enable the shared online database:
1. Create a free Postgres database at [neon.tech](https://neon.tech) (or add the
   Neon integration from the Vercel marketplace, which sets `DATABASE_URL` for you).
2. Copy `.env.example` to `.env.local` and paste the connection string into
   `DATABASE_URL`.

Without it, the app still runs — it just uses the local JSON file, which does
**not** persist on serverless hosts like Vercel.

## Run
```bash
npm install
npm run icons   # once, generates PWA icons (needs sharp)
npm run og      # once, generates the social share image
npm run dev
```
