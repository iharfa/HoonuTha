// Generates the social share image. Run: node scripts/og.mjs  ->  public/og.png
import sharp from "sharp";

const INK = "#3a2a1e";
// Detective Sun, drawn at 0..100 then transformed into place.
const rays = Array.from({ length: 12 }).map((_, i) => {
  const a = (i * Math.PI) / 6;
  const p = (r, o) => (o + Math.cos(a) * r).toFixed(1);
  const q = (r, o) => (o + Math.sin(a) * r).toFixed(1);
  return `<line x1="${p(33, 50)}" y1="${q(33, 50)}" x2="${p(45, 50)}" y2="${q(45, 50)}" stroke="#e0a83a" stroke-width="5" stroke-linecap="round"/>`;
}).join("");

const sun = `<g transform="translate(858 176) scale(2.72)">
  ${rays}
  <circle cx="22" cy="30" r="8" fill="#c94f28" stroke="${INK}" stroke-width="3"/>
  <circle cx="78" cy="30" r="8" fill="#c94f28" stroke="${INK}" stroke-width="3"/>
  <circle cx="50" cy="52" r="30" fill="#fbd36a" stroke="${INK}" stroke-width="3.5"/>
  <path d="M20 30 Q50 6 80 30 Q50 24 20 30 Z" fill="#c94f28" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M18 32 Q50 20 82 32 Q50 40 18 32 Z" fill="#e0632f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="50" cy="14" r="3.5" fill="#fbd36a" stroke="${INK}" stroke-width="2.5"/>
  <circle cx="39" cy="58" r="4.5" fill="#e0632f" opacity="0.45"/>
  <circle cx="61" cy="58" r="4.5" fill="#e0632f" opacity="0.45"/>
  <ellipse cx="42" cy="50" rx="3" ry="4.5" fill="${INK}"/>
  <ellipse cx="58" cy="50" rx="3" ry="4.5" fill="${INK}"/>
  <path d="M40 60 Q50 68 60 60" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="76" cy="70" r="13" fill="#6bb6c9" fill-opacity="0.3" stroke="${INK}" stroke-width="3.5"/>
  <line x1="85" y1="79" x2="95" y2="90" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
</g>`;

const swatches = ["#3a352f", "#e0632f", "#b1aea4", "#f4ecd8", "#5aa564"]
  .map((c, i) => `<rect x="${90 + i * 58}" y="512" width="48" height="48" rx="10" fill="${c}" stroke="${INK}" stroke-width="3"/>`).join("");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#dceffb"/><stop offset="0.5" stop-color="#fbf3e2"/><stop offset="1" stop-color="#f6e3b8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="10" y="10" width="1180" height="610" rx="34" fill="none" stroke="${INK}" stroke-width="6"/>
  ${sun}
  <text x="88" y="238" font-family="'Segoe UI','DejaVu Sans',Arial,sans-serif" font-size="112" font-weight="800" fill="${INK}">Hoonu Tha</text>
  <text x="90" y="292" font-family="'Segoe UI','DejaVu Sans',Arial,sans-serif" font-size="30" font-weight="700" fill="#8a7256">Dhivehi for “is it hot?”</text>
  <text x="92" y="352" font-family="'Segoe UI','DejaVu Sans',Arial,sans-serif" font-size="40" font-weight="700" fill="#6b5a48">Measure the temperature of your island —</text>
  <text x="92" y="404" font-family="'Segoe UI','DejaVu Sans',Arial,sans-serif" font-size="40" font-weight="700" fill="#6b5a48">and learn how to keep it cool.</text>
  ${swatches}
  <text x="410" y="546" font-family="'Segoe UI','DejaVu Sans',Arial,sans-serif" font-size="30" font-weight="700" fill="#8a7256">Citizen science · Maldives · ages 10+</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/og.png");
console.log("og.png written");
