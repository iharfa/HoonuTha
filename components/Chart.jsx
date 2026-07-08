"use client";
import { SurfaceArt, Icon } from "./Art";
import { tempColor, AMBIENT } from "@/lib/data";
// Tiny hand-drawn charts — no chart library, so everything works offline.

const INK = "var(--color-ink)";
const rnd = (n) => Math.round(n * 100) / 100;

// A horizontal thermometer: bulb + mercury filled to a surface temperature,
// with a dashed marker for the ambient air baseline and a highlighted value.
export function Thermometer({ temp, ambient = AMBIENT, min = 28, max = 70 }) {
  const bulbX = 22, tubeL = 42, tubeR = 288;
  const tubeY = 30, tubeH = 16, midY = tubeY + tubeH / 2;
  const clamp = (t) => Math.min(max, Math.max(min, t));
  const posX = (t) => rnd(tubeL + ((clamp(t) - min) / (max - min)) * (tubeR - tubeL));
  const fx = posX(temp), ax = posX(ambient), c = tempColor(temp);
  const bubbleX = rnd(Math.min(Math.max(fx, 30), 270));
  return (
    <svg viewBox="0 0 300 74" className="w-full" role="img"
      aria-label={`Thermometer: about ${Math.round(temp)} degrees Celsius in full sun, compared with ${ambient} degree air.`}>
      {/* highlighted value bubble on the mercury tip */}
      <rect x={rnd(bubbleX - 27)} y="1" width="54" height="21" rx="10" fill={c} stroke={INK} strokeWidth="2" />
      <text x={bubbleX} y="16" textAnchor="middle" className="font-display" fontSize="12.5" fontWeight="800" fill="#fff">≈{Math.round(temp)}°C</text>
      <path d={`M${rnd(fx - 4)} 22 L${rnd(fx + 4)} 22 L${fx} 27 Z`} fill={c} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      {/* cooler / hotter labels */}
      <text x={tubeL - 4} y={tubeY - 4} fontSize="9.5" fontWeight="700" fill="var(--color-ink-2)">cooler</text>
      <text x={tubeR} y={tubeY - 4} textAnchor="end" fontSize="9.5" fontWeight="700" fill="var(--color-ink-2)">hotter</text>
      {/* glass tube + bulb */}
      <rect x={tubeL - 6} y={tubeY} width={tubeR - tubeL + 10} height={tubeH} rx={tubeH / 2} fill="var(--color-paper-2)" stroke={INK} strokeWidth="2.5" />
      <circle cx={bulbX} cy={midY} r="14" fill={c} stroke={INK} strokeWidth="2.5" />
      {/* mercury */}
      <rect x={bulbX} y={tubeY + 3} width={Math.max(3, rnd(fx - bulbX))} height={tubeH - 6} rx={(tubeH - 6) / 2} fill={c} />
      {/* ambient air baseline marker */}
      <line x1={ax} y1={tubeY - 3} x2={ax} y2={tubeY + tubeH + 6} stroke="var(--color-cool)" strokeWidth="2.5" strokeDasharray="3 3" />
      <text x={ax} y={tubeY + tubeH + 18} textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--color-cool)">air {ambient}°</text>
    </svg>
  );
}

// Horizontal bars: great for material labels on a narrow phone screen.
export function BarChart({ data, unit = "°C", max }) {
  if (!data?.length) return null;
  const top = max || Math.max(...data.map((d) => d.avg ?? d.value)) * 1.1;
  return (
    <div className="space-y-2.5">
      {data.map((d) => {
        const v = d.avg ?? d.value;
        return (
          <div key={d.id || d.label} className="flex items-center gap-2">
            <div className="flex w-24 shrink-0 items-center justify-end gap-1 text-right text-xs font-bold text-[var(--color-ink)]">
              <span className="truncate">{d.label}</span>
            </div>
            <div className="relative h-7 flex-1 overflow-hidden rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-paper-2)]">
              <div
                className="flex h-full items-center justify-end rounded-full pr-2 font-display text-[11px] font-extrabold text-white transition-all"
                style={{ width: `${Math.max(16, (v / top) * 100)}%`, background: d.color }}
              >
                {Math.round(v)}{unit}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Scatter of albedo (x, 0..1) vs temperature (y). Shows the cooling trend.
export function Scatter({ points, yMin = 25, yMax = 70 }) {
  if (!points?.length) return null;
  const W = 320, H = 200, P = 34;
  const x = (a) => P + a * (W - P - 10);
  const y = (t) => H - P - ((Math.min(yMax, Math.max(yMin, t)) - yMin) / (yMax - yMin)) * (H - P - 10);
  const yTicks = [30, 40, 50, 60, 70].filter((t) => t >= yMin && t <= yMax);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={P} x2={W - 10} y1={y(t)} y2={y(t)} stroke="var(--color-rule)" strokeDasharray="2 4" />
          <text x={P - 5} y={y(t) + 3} textAnchor="end" fontSize="9" fill="var(--color-ink-2)">{t}°</text>
        </g>
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((a) => (
        <text key={a} x={x(a)} y={H - P + 14} textAnchor="middle" fontSize="9" fill="var(--color-ink-2)">{a}</text>
      ))}
      <text x={W - 10} y={y(yMin) + 8} textAnchor="end" fontSize="9" fontWeight="700" fill="var(--color-leaf)">brighter → cooler</text>
      {points.map((p, i) => (
        <circle key={i} cx={x(p.x)} cy={y(p.y)} r="6.5" fill={p.color} stroke={INK} strokeWidth="2">
          <title>{p.label}: {Math.round(p.y)}°C · albedo {p.x}</title>
        </circle>
      ))}
      <text x={(W + P) / 2} y={H - 2} textAnchor="middle" fontSize="9" fill="var(--color-ink-2)">albedo (reflectiveness) →</text>
    </svg>
  );
}

// Two-bar sun-vs-shade comparison.
export function SunShade({ effect }) {
  if (!effect) return null;
  const top = Math.max(effect.sun, effect.shade) * 1.15;
  const Bar = ({ label, icon, val, fill }) => (
    <div className="flex flex-1 flex-col items-center gap-1.5">
      <div className="flex h-32 w-full items-end justify-center">
        <div className="flex w-14 items-start justify-center rounded-t-xl border-2 border-b-0 border-[var(--color-ink)] pt-1 font-display text-xs font-extrabold text-white"
          style={{ height: `${(val / top) * 100}%`, background: fill }}>
          {Math.round(val)}°
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-ink)]"><Icon name={icon} size={16} /> {label}</div>
    </div>
  );
  return (
    <div className="flex items-end gap-6 border-b-2 border-[var(--color-ink)] px-6 pb-0">
      <Bar label="Full sun" icon="sun" val={effect.sun} fill="var(--color-accent)" />
      <Bar label="Shade" icon="tree" val={effect.shade} fill="var(--color-cool)" />
    </div>
  );
}

// Full sun vs building shade vs tree shade — the evapotranspiration story.
export function ShadeSourceBars({ effect }) {
  if (!effect) return null;
  const bars = [
    effect.sun != null ? { label: "Full sun", icon: "sun", val: effect.sun, fill: "var(--color-accent)" } : null,
    { label: "Building", icon: "city", val: effect.building, fill: "var(--color-ink-2)" },
    { label: "Tree", icon: "tree", val: effect.tree, fill: "var(--color-leaf)" },
  ].filter(Boolean);
  const top = Math.max(...bars.map((b) => b.val)) * 1.15;
  return (
    <div className="flex items-end gap-5 border-b-2 border-[var(--color-ink)] px-4 pb-0">
      {bars.map((b) => (
        <div key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex h-32 w-full items-end justify-center">
            <div className="flex w-14 items-start justify-center rounded-t-xl border-2 border-b-0 border-[var(--color-ink)] pt-1 font-display text-xs font-extrabold text-white"
              style={{ height: `${(b.val / top) * 100}%`, background: b.fill }}>{Math.round(b.val)}°</div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-ink)]"><Icon name={b.icon} size={16} /> {b.label}</div>
        </div>
      ))}
    </div>
  );
}

// Per-surface performance across sun / partial / shade. Each surface is its own
// stacked block: full name on top, then a 3-column grid of equal-size boxes.
export function ShadeMatrix({ rows }) {
  if (!rows?.length) return null;
  const cols = [["full-sun", "sun", "Sun"], ["partial", "cloudSun", "Part sun"], ["shade", "tree", "Shade"]];
  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.id}>
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <span className="font-display text-sm font-extrabold text-[var(--color-ink)]">{r.label}</span>
            {r.drop > 0 && <span className="shrink-0 text-[11px] font-bold text-[var(--color-leaf)]">shade −{r.drop}°</span>}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {cols.map(([s, icon, lbl]) => {
              const v = r.cells[s];
              return (
                <div key={s} className="flex flex-col items-center gap-1">
                  <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--color-ink-2)]">
                    <Icon name={icon} size={13} /> {lbl}
                  </span>
                  {v != null ? (
                    <span className="grid h-9 w-full place-items-center rounded-xl border-2 border-[var(--color-ink)] font-display text-sm font-extrabold text-white" style={{ background: tempColor(v) }}>{Math.round(v)}°</span>
                  ) : (
                    <span className="grid h-9 w-full place-items-center rounded-xl border-2 border-dashed border-[var(--color-rule)] text-sm text-[var(--color-ink-2)]">–</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
