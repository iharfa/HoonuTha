// Generates PWA icons from an inline SVG. Run once: npm run icons
import sharp from "sharp";
import { mkdirSync } from "fs";

const rays = Array.from({ length: 12 }).map((_, i) => {
  const a = (i * Math.PI) / 6;
  const px = (k) => (256 + Math.cos(a) * k).toFixed(1);
  const py = (k) => (250 + Math.sin(a) * k).toFixed(1);
  return `<line x1="${px(120)}" y1="${py(120)}" x2="${px(158)}" y2="${py(158)}" stroke="#f6c34a" stroke-width="22" stroke-linecap="round"/>`;
}).join("");

const svg = (pad) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${pad ? 0 : 110}" fill="#e0632f"/>
  <g transform="${pad ? "scale(0.86) translate(42 42)" : ""}">
    ${rays}
    <circle cx="256" cy="250" r="112" fill="#fbd36a" stroke="#4a2f22" stroke-width="14"/>
    <ellipse cx="228" cy="238" rx="12" ry="18" fill="#4a2f22"/>
    <ellipse cx="284" cy="238" rx="12" ry="18" fill="#4a2f22"/>
    <path d="M222 286 Q256 320 290 286" fill="none" stroke="#4a2f22" stroke-width="13" stroke-linecap="round"/>
    <circle cx="330" cy="322" r="46" fill="none" stroke="#4a2f22" stroke-width="14"/>
    <line x1="362" y1="354" x2="398" y2="392" stroke="#4a2f22" stroke-width="20" stroke-linecap="round"/>
  </g>
</svg>`);

mkdirSync("public", { recursive: true });
await sharp(svg(false)).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(svg(false)).resize(512, 512).png().toFile("public/icon-512.png");
await sharp(svg(true)).resize(512, 512).png().toFile("public/icon-maskable-512.png");
console.log("icons written");
