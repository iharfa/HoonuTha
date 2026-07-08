// Turns a list of readings into charts data + plain-language insights.
// The goal is that the story comes from the kids' OWN numbers, with gentle
// teaching fallbacks when they haven't collected enough yet.
import { MATERIALS, SHADE, matById, colorById, estAlbedo, tempColor, tempFeel, fmtTemp } from "./data";

const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
const r1 = (n) => Math.round(n * 10) / 10;

export function labelFor(r) {
  const m = matById(r.material);
  const c = r.color ? colorById(r.color) : null;
  return c ? `${c.label} ${m?.label?.toLowerCase()}` : m?.label || r.material;
}

// Average temperature per material, hottest first — the main bar chart.
export function byMaterial(readings) {
  const groups = {};
  for (const r of readings) (groups[r.material] ||= []).push(r);
  return Object.entries(groups)
    .map(([id, rs]) => {
      const temps = rs.map((r) => r.temp);
      const m = matById(id);
      const a = r1(avg(temps));
      return {
        id, label: m?.label || id, icon: m?.icon || "",
        count: rs.length, avg: a, min: Math.min(...temps), max: Math.max(...temps),
        color: tempColor(a),
      };
    })
    .sort((a, b) => b.avg - a.avg);
}

// Every reading as an (albedo, temperature) point — the science scatter plot.
export function albedoPoints(readings) {
  return readings.map((r) => ({
    x: estAlbedo(r.material, r.color),
    y: r.temp,
    label: labelFor(r),
    color: tempColor(r.temp),
  }));
}

// Same idea, but averaged sun vs shade.
export function shadeEffect(readings) {
  const sun = readings.filter((r) => r.shade === "full-sun").map((r) => r.temp);
  const shd = readings.filter((r) => r.shade === "shade").map((r) => r.temp);
  if (sun.length < 1 || shd.length < 1) return null;
  return { sun: r1(avg(sun)), shade: r1(avg(shd)), diff: r1(avg(sun) - avg(shd)), sunN: sun.length, shadeN: shd.length };
}

// Tree shade vs building shade (full-shade readings only) + full sun. Shows the
// evapotranspiration effect. Returns null until there's at least one of each
// shade type to compare.
export function shadeSourceEffect(readings) {
  const fs = readings.filter((r) => r.shade === "full-sun").map((r) => r.temp);
  const tree = readings.filter((r) => r.shade === "shade" && r.shadeSource === "tree").map((r) => r.temp);
  const bld = readings.filter((r) => r.shade === "shade" && r.shadeSource === "building").map((r) => r.temp);
  if (!tree.length || !bld.length) return null;
  const e = {
    sun: fs.length ? r1(avg(fs)) : null,
    tree: r1(avg(tree)),
    building: r1(avg(bld)),
    treeN: tree.length,
    buildingN: bld.length,
  };
  e.etGap = r1(e.building - e.tree); // how much cooler tree shade is
  return e;
}

export function extremes(readings) {
  if (!readings.length) return null;
  const s = [...readings].sort((a, b) => b.temp - a.temp);
  return { hottest: s[0], coolest: s[s.length - 1] };
}

// Per-surface performance across shade conditions. Returns only materials the
// kids measured in at least two of {full-sun, partial, shade}, so each row is a
// real comparison. Hottest full-sun first.
export function shadeMatrix(readings) {
  const groups = {};
  for (const r of readings) {
    (groups[r.material] ||= {});
    (groups[r.material][r.shade] ||= []).push(r.temp);
  }
  return Object.entries(groups)
    .map(([id, byShade]) => {
      const cell = (s) => (byShade[s] ? r1(avg(byShade[s])) : null);
      const cells = { "full-sun": cell("full-sun"), partial: cell("partial"), shade: cell("shade") };
      const present = Object.values(cells).filter((v) => v != null);
      const m = matById(id);
      return {
        id, label: m?.label || id, cells,
        filled: present.length,
        drop: present.length >= 2 ? r1(Math.max(...present) - Math.min(...present)) : 0,
        sortKey: cells["full-sun"] ?? cells.partial ?? cells.shade ?? 0,
      };
    })
    .filter((x) => x.filled >= 2)
    .sort((a, b) => b.sortKey - a.sortKey);
}

export function stats(readings) {
  if (!readings.length) return { count: 0, materials: 0, avg: 0, max: 0 };
  const temps = readings.map((r) => r.temp);
  return {
    count: readings.length,
    materials: new Set(readings.map((r) => r.material)).size,
    avg: r1(avg(temps)),
    max: Math.max(...temps),
  };
}

// Correlation between albedo and temperature (Pearson r). Negative is what we
// expect: brighter (higher albedo) surfaces are cooler.
function correlation(pts) {
  if (pts.length < 3) return null;
  const mx = avg(pts.map((p) => p.x)), my = avg(pts.map((p) => p.y));
  let sxy = 0, sxx = 0, syy = 0;
  for (const p of pts) { const dx = p.x - mx, dy = p.y - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

// The narrated insight cards shown under the charts.
export function insights(readings) {
  const out = [];
  const ex = extremes(readings);
  const byMat = byMaterial(readings);
  const shade = shadeEffect(readings);
  const r = correlation(albedoPoints(readings));

  if (ex) {
    const diff = r1(ex.hottest.temp - ex.coolest.temp);
    out.push({
      icon: "flame",
      title: `Your hottest spot was ${fmtTemp(ex.hottest.temp)}`,
      body: `${labelFor(ex.hottest)} in ${SHADE[ex.hottest.shade]?.label.toLowerCase()} felt ${tempFeel(ex.hottest.temp)}. Your coolest was ${labelFor(ex.coolest)} at ${fmtTemp(ex.coolest.temp)} — a ${diff}°C difference on the same island!`,
    });
  }

  if (byMat.length >= 2) {
    const hot = byMat[0], cool = byMat[byMat.length - 1];
    out.push({
      icon: "layers",
      title: "Material matters",
      body: `On average, ${hot.label.toLowerCase()} was your hottest surface (${fmtTemp(hot.avg)}) and ${cool.label.toLowerCase()} your coolest (${fmtTemp(cool.avg)}). Dark, paved surfaces store the sun's heat; bright and living surfaces let it go.`,
    });
  }

  if (shade && shade.diff > 0) {
    out.push({
      icon: "tree",
      title: `Shade cooled things by ${shade.diff}°C`,
      body: `Full-sun spots averaged ${fmtTemp(shade.sun)} but shaded spots only ${fmtTemp(shade.shade)}. A single tree can shade the ground AND cool the air by breathing out water — that's the Urban Heat Island fix in action.`,
    });
  }

  const src = shadeSourceEffect(readings);
  if (src) {
    const bothVsSun = src.sun != null ? ` Both beat full sun (${fmtTemp(src.sun)}) — any shade helps!` : "";
    out.push(
      src.etGap > 0
        ? {
            icon: "tree",
            title: `Tree shade beat building shade by ${src.etGap}°C`,
            body: `Under a tree you measured ${fmtTemp(src.tree)}, but under a building ${fmtTemp(src.building)}. Trees don't just block the sun — their leaves breathe out water (evapotranspiration) that cools the air too.${bothVsSun}`,
          }
        : {
            icon: "tree",
            title: "Shade keeps things cool",
            body: `Tree shade averaged ${fmtTemp(src.tree)} and building shade ${fmtTemp(src.building)}.${bothVsSun} Trees add extra cooling by releasing water vapour (evapotranspiration).`,
          }
    );
  }

  if (r != null && r < -0.3) {
    out.push({
      icon: "albedo",
      title: "Bright surfaces stayed cooler",
      body: `Your data shows a clear pattern: the higher a surface's albedo (how much light it reflects), the cooler it was. Painting roofs white or using light pavers keeps cities cooler — you just proved it with real measurements!`,
    });
  }

  const rubber = readings.filter((r) => r.material === "playground");
  if (rubber.length) {
    const hotRubber = rubber.sort((a, b) => b.temp - a.temp)[0];
    if (hotRubber.temp >= 50)
      out.push({
        icon: "play",
        title: "Careful on the playground!",
        body: `You measured ${labelFor(hotRubber)} at ${fmtTemp(hotRubber.temp)}. Dark rubber play surfaces can get hot enough to hurt bare feet. Light colours and shade sails make a big difference.`,
      });
  }

  return out;
}

// Teaching prompts shown when there isn't enough data yet.
export const EMPTY_TIPS = [
  { icon: "sun", title: "Measure the same spot in sun and shade", body: "The difference shows you exactly what a tree does for a city." },
  { icon: "palette", title: "Compare colours of the same material", body: "Try white vs black pavers, or white vs red road paint." },
  { icon: "clock", title: "Measure around midday", body: "That's when surfaces are hottest and the differences are biggest." },
];
