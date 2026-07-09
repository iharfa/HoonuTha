// Hand-drawn storybook illustrations + a line-icon set, all as clean inline SVG
// (no filters, no raster). Illustrations fill from theme CSS vars so they
// recolour with the system. Any Math-derived coordinate is rounded (rnd) to
// keep server and client markup byte-identical.
const INK = "var(--color-ink)";
const rnd = (n) => Math.round(n * 100) / 100;

// Shared <defs> rendered once in the root layout (the sun gradient).
export function SvgDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="sunFill" cx="42%" cy="38%">
          <stop offset="0%" stopColor="var(--color-sun)" />
          <stop offset="100%" stopColor="var(--color-sun-deep)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ── Line-icon set (replaces decorative emoji) ─────────────────────────────
const GLYPHS = {
  home: <><path d="M3 11.5 11 4a1.5 1.5 0 0 1 2 0l8 7.5" /><path d="M5 10v10h14V10" /></>,
  book: <><path d="M12 5.5C10.5 4.2 8 4 4 4v14c4 0 6.5.2 8 1.5" /><path d="M12 5.5C13.5 4.2 16 4 20 4v14c-4 0-6.5.2-8 1.5" /></>,
  thermometer: <><path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z" /><circle cx="12" cy="18" r="2.2" fill="currentColor" stroke="none" /></>,
  chart: <><path d="M4 20h16" /><path d="M7 20v-6M12 20v-11M17 20v-8" /></>,
  flask: <><path d="M9 3h6" /><path d="M10 3v6l-5.2 8.4A2 2 0 0 0 6.5 20.5h11a2 2 0 0 0 1.7-3.1L14 9V3" /><path d="M7.5 15h9" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M19.1 4.9l-1.5 1.5M6.4 17.6l-1.5 1.5" /></>,
  cloudSun: <><circle cx="8" cy="8" r="3" /><path d="M8 2.5v1.5M2.5 8H4M11.6 4.4l-1 1M4.4 4.4l1 1" /><path d="M7 19h9a3 3 0 0 0 .2-6A4.2 4.2 0 0 0 8.7 12 3.2 3.2 0 0 0 7 19z" /></>,
  tree: <><path d="M12 3 5 13h4l-3 5h12l-3-5h4z" /><path d="M12 18v3" /></>,
  flame: <><path d="M12 3c3.2 3 4.5 5.2 4.5 8.2a4.5 4.5 0 0 1-9 0c0-1.6.8-2.9 1.7-3.7C10.5 8.5 12 6.5 12 3z" /></>,
  layers: <><path d="M12 3 2 8l10 5 10-5z" /><path d="M2 13l10 5 10-5" /></>,
  albedo: <><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none" /></>,
  play: <><path d="M5 20V8" /><path d="M5 8 19 19" /><path d="M9 20V6M12.5 20V7" /><path d="M4 20h4M17 19h3" /></>,
  palette: <><path d="M12 3a9 9 0 1 0 0 18c1.4 0 1.8-1 1.2-1.9-.6-.9 0-2.1 1.3-2.1H18a3 3 0 0 0 3-3c0-5-4-8-9-8z" /><circle cx="8" cy="11" r="1.1" fill="currentColor" stroke="none" /><circle cx="12" cy="8" r="1.1" fill="currentColor" stroke="none" /><circle cx="16" cy="10" r="1.1" fill="currentColor" stroke="none" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  ruler: <><rect x="3" y="8.5" width="18" height="7" rx="1" /><path d="M7 8.5v2.5M11 8.5v3.5M15 8.5v2.5M19 8.5v3.5" /></>,
  repeat: <><path d="M4 10a6 6 0 0 1 6-6h6" /><path d="M14 1.5 17 4l-3 2.5" /><path d="M20 14a6 6 0 0 1-6 6H8" /><path d="M10 22.5 7 20l3-2.5" /></>,
  warn: <><path d="M12 3.5 22 20H2z" /><path d="M12 10v4M12 17.2v.3" /></>,
  bulb: <><path d="M9.5 18h5M10.5 21h3" /><path d="M12 3a6 6 0 0 0-3.7 10.7c.8.7 1.2 1.5 1.2 2.3h5c0-.8.4-1.6 1.2-2.3A6 6 0 0 0 12 3z" /></>,
  city: <><path d="M3 21V9l6-3v15" /><path d="M9 21V6l6 3v12" /><path d="M3 21h18" /><path d="M5.5 12h1.5M5.5 16h1.5M11.5 12h1.5M11.5 16h1.5" /></>,
  flag: <><path d="M5 21V4" /><path d="M5 4c4-2 7 2 11 0v9c-4 2-7-2-11 0" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
};

export function Icon({ name, size = 22, className = "", strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {GLYPHS[name] || null}
    </svg>
  );
}

// Icon for a shade condition (used across the app).
export const SHADE_ICON = { "full-sun": "sun", partial: "cloudSun", shade: "tree" };

// ── Detective Sun — the recurring mascot ──────────────────────────────────
export function DetectiveSun({ size = 64, spin = false, className = "" }) {
  const rays = Array.from({ length: 12 }).map((_, i) => {
    const a = (i * Math.PI) / 6;
    return { x1: rnd(50 + Math.cos(a) * 33), y1: rnd(50 + Math.sin(a) * 33), x2: rnd(50 + Math.cos(a) * 44), y2: rnd(50 + Math.sin(a) * 44) };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label="Detective Sun, the guide">
      <g className={spin ? "hd-rays" : ""}>
        {rays.map((r, i) => (
          <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="var(--color-sun-deep)" strokeWidth="4.5" strokeLinecap="round" />
        ))}
      </g>
      <circle cx="22" cy="30" r="8" fill="var(--color-accent-2)" stroke={INK} strokeWidth="3" />
      <circle cx="78" cy="30" r="8" fill="var(--color-accent-2)" stroke={INK} strokeWidth="3" />
      <circle cx="50" cy="52" r="30" fill="url(#sunFill)" stroke={INK} strokeWidth="3.5" />
      <path d="M20 30 Q50 6 80 30 Q50 24 20 30 Z" fill="var(--color-accent-2)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M18 32 Q50 20 82 32 Q50 40 18 32 Z" fill="var(--color-accent)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="50" cy="14" r="3.5" fill="var(--color-sun)" stroke={INK} strokeWidth="2.5" />
      <circle cx="39" cy="58" r="4.5" fill="var(--color-accent)" opacity="0.45" />
      <circle cx="61" cy="58" r="4.5" fill="var(--color-accent)" opacity="0.45" />
      <ellipse className="hd-eye" cx="42" cy="50" rx="3" ry="4.5" fill={INK} />
      <ellipse className="hd-eye" cx="58" cy="50" rx="3" ry="4.5" fill={INK} />
      <path d="M40 60 Q50 68 60 60" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="76" cy="70" r="13" fill="var(--color-cool)" fillOpacity="0.3" stroke={INK} strokeWidth="3.5" />
      <line x1="85" y1="79" x2="95" y2="90" stroke={INK} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

// ── Hero cover: a storybook island scene ──────────────────────────────────
export function HeroCover({ className = "" }) {
  return (
    <svg viewBox="0 0 360 210" className={className} role="img"
      aria-label="A sunny Maldivian island: a hot road with shimmering heat, a cool shady palm, and a big friendly thermometer.">
      <path d="M0 0 H360 V128 H0 Z" fill="var(--color-cool)" fillOpacity="0.16" />
      <path d="M0 118 Q120 108 220 120 T360 116 V150 H0 Z" fill="var(--color-cool)" fillOpacity="0.28" />
      <path d="M0 138 Q90 128 360 140 V210 H0 Z" fill="var(--color-paper-3)" />
      <g transform="translate(276 8) scale(0.72)"><use href="#hero-sun" /></g>
      {/* palm tree with shade puddle */}
      <ellipse cx="70" cy="182" rx="52" ry="12" fill="var(--color-cool)" fillOpacity="0.35" />
      <path d="M66 182 Q60 150 70 120" fill="none" stroke="var(--color-ink)" strokeWidth="9" strokeLinecap="round" />
      <g stroke="var(--color-leaf)" strokeWidth="9" strokeLinecap="round" fill="none">
        <path d="M70 120 Q40 104 16 116" />
        <path d="M70 120 Q46 92 30 82" />
        <path d="M70 120 Q70 92 68 74" />
        <path d="M70 120 Q98 94 116 84" />
        <path d="M70 120 Q100 106 124 118" />
      </g>
      <circle cx="70" cy="120" r="6" fill="var(--color-leaf)" stroke={INK} strokeWidth="2.5" />
      <circle cx="62" cy="126" r="4.5" fill="#8a5a2b" stroke={INK} strokeWidth="2" />
      <circle cx="78" cy="127" r="4.5" fill="#8a5a2b" stroke={INK} strokeWidth="2" />
      {/* hot road strip */}
      <path d="M150 210 L210 210 L188 150 L172 150 Z" fill="var(--color-ink)" fillOpacity="0.82" />
      <line x1="180" y1="150" x2="180" y2="210" stroke="var(--color-sun)" strokeWidth="4" strokeDasharray="7 8" strokeLinecap="round" />
      <g className="hd-shimmer" stroke="var(--color-accent)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M166 150 q6 -9 0 -18 q-6 -9 0 -18" />
        <path d="M194 150 q6 -9 0 -18 q-6 -9 0 -18" />
      </g>
      {/* big friendly thermometer */}
      <g className="hd-bob" transform="translate(262 96)">
        <rect x="-12" y="-2" width="24" height="74" rx="12" fill="var(--color-paper)" stroke={INK} strokeWidth="3.5" />
        <rect x="-5" y="16" width="10" height="52" rx="5" fill="var(--color-accent)" />
        <circle cx="0" cy="80" r="16" fill="var(--color-accent)" stroke={INK} strokeWidth="3.5" />
        <circle cx="-5" cy="76" r="4" fill="#fff" fillOpacity="0.6" />
        {[6, 18, 30, 42].map((y) => <line key={y} x1="12" y1={y} x2="18" y2={y} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />)}
      </g>
      <defs>
        <g id="hero-sun">
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return <line key={i} x1={rnd(50 + Math.cos(a) * 33)} y1={rnd(50 + Math.sin(a) * 33)} x2={rnd(50 + Math.cos(a) * 45)} y2={rnd(50 + Math.sin(a) * 45)} stroke="var(--color-sun-deep)" strokeWidth="5" strokeLinecap="round" />;
          })}
          <circle cx="50" cy="50" r="30" fill="url(#sunFill)" stroke={INK} strokeWidth="3.5" />
          <ellipse className="hd-eye" cx="42" cy="48" rx="3" ry="4.5" fill={INK} />
          <ellipse className="hd-eye" cx="58" cy="48" rx="3" ry="4.5" fill={INK} />
          <path d="M40 58 Q50 66 60 58" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      </defs>
    </svg>
  );
}

// ── Per-surface vignettes for the Field Guide ─────────────────────────────
function Tile({ children, label }) {
  return (
    <svg viewBox="0 0 64 64" width="52" height="52" role="img" aria-label={label}>
      <rect x="4" y="4" width="56" height="56" rx="14" fill="var(--color-paper-2)" stroke={INK} strokeWidth="3" />
      {children}
    </svg>
  );
}
const grains = (fill) =>
  [[18, 40], [30, 46], [44, 41], [24, 50], [38, 51], [48, 48]].map(([x, y], i) => (
    <circle key={i} cx={x} cy={y} r="2.4" fill={fill} />
  ));

const SURFACE = {
  "white-sand": (
    <Tile label="White sand">
      <path d="M8 44 Q32 34 56 44 V56 H8 Z" fill="#f4ecd8" stroke={INK} strokeWidth="2.5" />
      {grains("#d8c9a4")}
      <circle cx="46" cy="20" r="8" fill="url(#sunFill)" stroke={INK} strokeWidth="2.5" />
    </Tile>
  ),
  "grey-sand": (
    <Tile label="Grey sand">
      <path d="M8 44 Q32 34 56 44 V56 H8 Z" fill="#c7c3ba" stroke={INK} strokeWidth="2.5" />
      {grains("#8f8b82")}
    </Tile>
  ),
  "brown-sand": (
    <Tile label="Brown sand">
      <path d="M8 44 Q32 34 56 44 V56 H8 Z" fill="#b78a55" stroke={INK} strokeWidth="2.5" />
      {grains("#7d5a30")}
    </Tile>
  ),
  "black-sand": (
    <Tile label="Black sand">
      <path d="M8 44 Q32 34 56 44 V56 H8 Z" fill="#3b3630" stroke={INK} strokeWidth="2.5" />
      {grains("#6a625a")}
      <path d="M40 22 q4 -9 0 -14" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" className="hd-shimmer" />
    </Tile>
  ),
  asphalt: (
    <Tile label="Asphalt road">
      <rect x="8" y="34" width="48" height="22" rx="4" fill="#2f2b27" stroke={INK} strokeWidth="2.5" />
      <line x1="14" y1="45" x2="50" y2="45" stroke="var(--color-sun)" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
    </Tile>
  ),
  pavers: (
    // Grey interlocking "unipaver" I-blocks — the common Maldivian paving.
    <Tile label="Concrete pavers">
      {[[12, 22], [28, 28], [44, 22]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} h14 v4 h-4 v12 h4 v4 h-14 v-4 h4 v-12 h-4 z`}
          fill={i === 1 ? "#c3c0b6" : "#b1aea4"} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      ))}
    </Tile>
  ),
  playground: (
    <Tile label="Playground rubber">
      <rect x="8" y="34" width="48" height="22" rx="6" fill="var(--color-cool)" stroke={INK} strokeWidth="2.5" />
      <rect x="8" y="34" width="24" height="22" rx="6" fill="var(--color-accent)" fillOpacity="0.85" stroke={INK} strokeWidth="2.5" />
      <path d="M20 30 v-6 M32 30 v-9 M44 30 v-6" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </Tile>
  ),
  "road-marking": (
    <Tile label="Road-marking paint">
      <rect x="8" y="30" width="48" height="26" rx="4" fill="#2f2b27" stroke={INK} strokeWidth="2.5" />
      <line x1="18" y1="36" x2="18" y2="52" stroke="#f6f2e6" strokeWidth="4" strokeLinecap="round" />
      <line x1="32" y1="36" x2="32" y2="52" stroke="var(--color-sun)" strokeWidth="4" strokeLinecap="round" />
      <line x1="46" y1="36" x2="46" y2="52" stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" />
    </Tile>
  ),
  turf: (
    // Manufactured green mat: flat rect, uniform blades, a pitch line + heat
    // shimmer — looks green but runs hot (no evapotranspiration).
    <Tile label="Artificial turf">
      <rect x="8" y="34" width="48" height="22" rx="4" fill="#3f9d5a" stroke={INK} strokeWidth="2.5" />
      {[14, 20, 26, 38, 44, 50].map((x, i) => (
        <line key={i} x1={x} y1="55" x2={x} y2="40" stroke="#2f7a44" strokeWidth="2" strokeLinecap="round" />
      ))}
      <line x1="32" y1="34" x2="32" y2="56" stroke="#f6f2e6" strokeWidth="2.5" />
      <path d="M48 30 q4 -8 0 -13" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" className="hd-shimmer" />
    </Tile>
  ),
  grass: (
    <Tile label="Grass and plants">
      <path d="M8 50 Q32 44 56 50 V56 H8 Z" fill="var(--color-leaf)" stroke={INK} strokeWidth="2.5" />
      {[16, 24, 32, 40, 48].map((x, i) => (
        <path key={i} d={`M${x} 50 q${i % 2 ? 3 : -3} -8 0 -14`} fill="none" stroke="var(--color-leaf)" strokeWidth="3" strokeLinecap="round" />
      ))}
    </Tile>
  ),
};
export function SurfaceArt({ id }) {
  return SURFACE[id] || <Tile label={id}><circle cx="32" cy="40" r="12" fill="var(--color-paper-3)" stroke={INK} strokeWidth="2.5" /></Tile>;
}

// ── Learn scenes ──────────────────────────────────────────────────────────
export function CityScene({ className = "" }) {
  return (
    <svg viewBox="0 0 360 160" className={className} role="img" aria-label="A hot concrete city beside a cool green park">
      <rect x="0" y="70" width="180" height="90" fill="var(--color-accent)" fillOpacity="0.14" />
      <rect x="180" y="70" width="180" height="90" fill="var(--color-leaf)" fillOpacity="0.18" />
      {[[20, 96], [58, 80], [96, 100], [134, 78]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="30" height={160 - y} fill="var(--color-ink)" fillOpacity="0.82" stroke={INK} strokeWidth="2.5" />
          {[0, 1].map((r) => <rect key={r} x={x + 6 + r * 12} y={y + 8} width="6" height="8" fill="var(--color-sun)" />)}
        </g>
      ))}
      <g className="hd-shimmer" stroke="var(--color-accent)" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M44 70 q5 -8 0 -15" /><path d="M110 70 q5 -8 0 -15" />
      </g>
      {[210, 252, 300].map((x, i) => (
        <g key={i} transform={`translate(${x} 132)`}>
          <path d="M0 28 V6" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <circle cy="-4" r="16" fill="var(--color-leaf)" stroke={INK} strokeWidth="2.5" />
        </g>
      ))}
      <text x="90" y="150" textAnchor="middle" className="font-display" fontSize="13" fontWeight="800" fill="var(--color-accent-2)">hot city</text>
      <text x="270" y="150" textAnchor="middle" className="font-display" fontSize="13" fontWeight="800" fill="var(--color-leaf)">cool park</text>
    </svg>
  );
}

export function AlbedoScene({ className = "" }) {
  return (
    <svg viewBox="0 0 360 160" className={className} role="img" aria-label="Sunlight bounces off a white tile but sinks into a black tile">
      <circle cx="180" cy="30" r="20" fill="url(#sunFill)" stroke={INK} strokeWidth="3" />
      <rect x="34" y="112" width="118" height="30" rx="6" fill="#f4ecd8" stroke={INK} strokeWidth="3" />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={66 + i * 22} y1="110" x2={150 + i * 6} y2="54" stroke="var(--color-cool)" strokeWidth="4" strokeLinecap="round" />
      ))}
      <text x="93" y="132" textAnchor="middle" className="font-display" fontSize="12" fontWeight="800" fill="var(--color-ink)">bright = cool</text>
      <rect x="208" y="112" width="118" height="30" rx="6" fill="#33302b" stroke={INK} strokeWidth="3" />
      {[0, 1, 2].map((i) => (
        <line key={i} x1={210 + i * 6} y1="54" x2={236 + i * 22} y2="110" stroke="var(--color-sun-deep)" strokeWidth="4" strokeLinecap="round" />
      ))}
      <g className="hd-shimmer" stroke="var(--color-accent)" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M250 112 q5 -8 0 -14" /><path d="M290 112 q5 -8 0 -14" />
      </g>
      <text x="267" y="132" textAnchor="middle" className="font-display" fontSize="12" fontWeight="800" fill="var(--color-accent-ink)">dark = hot</text>
    </svg>
  );
}

export function TreeScene({ className = "" }) {
  return (
    <svg viewBox="0 0 360 160" className={className} role="img" aria-label="A tree drinks water from the ground and breathes out cool mist">
      <path d="M0 128 Q180 118 360 128 V160 H0 Z" fill="var(--color-leaf)" fillOpacity="0.22" />
      <path d="M176 132 V70" stroke={INK} strokeWidth="9" strokeLinecap="round" />
      <circle cx="180" cy="54" r="34" fill="var(--color-leaf)" stroke={INK} strokeWidth="3" />
      <circle cx="150" cy="66" r="22" fill="var(--color-leaf)" stroke={INK} strokeWidth="3" />
      <circle cx="210" cy="66" r="22" fill="var(--color-leaf)" stroke={INK} strokeWidth="3" />
      {[172, 180].map((x, i) => (
        <path key={i} d={`M${x} 128 V74`} fill="none" stroke="var(--color-cool)" strokeWidth="2.5" strokeDasharray="3 5" strokeLinecap="round" />
      ))}
      {[[150, 30], [210, 26], [180, 16]].map(([x, y], i) => (
        <circle key={i} className="hd-drop" cx={x} cy={y} r="4" fill="var(--color-cool)" style={{ animationDelay: `${i * 0.7}s` }} />
      ))}
      <text x="288" y="60" textAnchor="middle" className="font-display" fontSize="12" fontWeight="800" fill="var(--color-cool)">cool air</text>
    </svg>
  );
}
