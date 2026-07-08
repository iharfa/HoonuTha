# Heat Detectives 🌡️

A Progressive Web App for kids (10+) to run a real **citizen-science** investigation:
measure how hot different surfaces get around the Maldives, then discover the
**Urban Heat Island effect**, **albedo**, and how **trees & evapotranspiration**
cool our islands.

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
Next.js 15 · React 19 · Tailwind 4. Data is stored in `localStorage`
(`lib/store.js`) with a shape ready to swap for a real backend. Charts are
hand-drawn SVG so everything works **offline** (service worker in `public/`).

## Run
```bash
npm install
npm run icons   # once, generates PWA icons (needs sharp)
npm run dev
```
