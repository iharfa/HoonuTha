"use client";
// The full charts + insights view for one group's readings. Used twice:
// /data (own group, can delete/reset) and /groups/[id] (public, read-only).
import { useState } from "react";
import Link from "next/link";
import { byMaterial, albedoPoints, shadeEffect, shadeSourceEffect, shadeMatrix, insights, stats, labelFor, EMPTY_TIPS } from "@/lib/insights";
import { SHADE, srcById, tempColor } from "@/lib/data";
import { BarChart, Scatter, SunShade, ShadeSourceBars, ShadeMatrix } from "@/components/Chart";
import { SurfaceArt, DetectiveSun, Icon } from "@/components/Art";
import { Section, Card, Stat, Btn, Insight, TempChip } from "@/components/ui";

export default function Dashboard({ rs, readOnly = false, exportName = "readings", onDelete, onReset }) {
  const [showAll, setShowAll] = useState(false);

  if (!rs.length)
    return (
      <div className="pt-10 text-center">
        <div className="mx-auto w-fit"><DetectiveSun size={84} /></div>
        <h2 className="mt-2 font-display text-lg font-extrabold text-[var(--color-ink)]">No readings yet</h2>
        {readOnly ? (
          <p className="mt-1 text-sm text-[var(--color-ink-2)]">This group hasn't logged any readings yet.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-[var(--color-ink-2)]">Measure a few surfaces and your charts will appear here.</p>
            <Link href="/measure"><Btn className="mt-4">Start measuring</Btn></Link>
          </>
        )}
      </div>
    );

  const s = stats(rs);
  const bars = byMaterial(rs);
  const pts = albedoPoints(rs);
  const shade = shadeEffect(rs);
  const src = shadeSourceEffect(rs);
  const matrix = shadeMatrix(rs);
  const cards = insights(rs);
  const shown = showAll ? rs : rs.slice(0, 6);

  return (
    <div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Stat label="Readings" value={s.count} tone="text-[var(--color-accent-2)]" />
        <Stat label="Avg temp" value={`${Math.round(s.avg)}°`} tone="text-[var(--color-sun-deep)]" />
        <Stat label="Hottest" value={`${Math.round(s.max)}°`} tone="text-[var(--color-accent)]" />
      </div>

      <Section title="Average heat by surface" sub="Which materials store the most heat?">
        <Card><BarChart data={bars} /></Card>
      </Section>

      <Section title="How shade helps each surface" sub="Same surface, measured in sun, part-sun and shade">
        {matrix.length ? (
          <Card>
            <ShadeMatrix rows={matrix} />
            <p className="mt-3 text-center text-[11px] text-[var(--color-ink-2)]">Green number = how much cooler shade made that surface.</p>
          </Card>
        ) : (
          <Insight icon="tree" title="Unlock this comparison" body="Measure the SAME surface in full sun and again in the shade. Do it for a few surfaces and this table will show how much each one cools down." />
        )}
      </Section>

      <Section title="Bright vs dark" sub="Albedo = how much sunlight a surface reflects">
        <Card>
          <Scatter points={pts} />
          <p className="mt-2 text-center text-xs text-[var(--color-ink-2)]">Each dot is one reading. Notice how dots on the <b className="text-[var(--color-ink)]">left</b> (dark) sit higher (hotter).</p>
        </Card>
      </Section>

      {shade && (
        <Section title="The power of shade" sub={`From ${shade.sunN} sunny + ${shade.shadeN} shaded readings`}>
          <Card>
            <SunShade effect={shade} />
            <p className="mt-3 text-center text-sm font-extrabold text-[var(--color-leaf)]">Shade was {shade.diff}°C cooler on average</p>
          </Card>
        </Section>
      )}

      {src && (
        <Section title="Tree shade vs building shade" sub={`${src.treeN} tree + ${src.buildingN} building readings`}>
          <Card>
            <ShadeSourceBars effect={src} />
            <p className="mt-3 text-center text-sm text-[var(--color-ink-2)]">
              {src.etGap > 0 ? (
                <>Tree shade was <b className="text-[var(--color-leaf)]">{src.etGap}°C cooler</b> than building shade — that's <b className="text-[var(--color-ink)]">evapotranspiration</b>. Trees breathe out water that cools the air, not just block the sun.</>
              ) : (
                <>Both tree and building shade beat full sun. Trees add extra cooling by releasing water vapour (evapotranspiration).</>
              )}
            </p>
          </Card>
        </Section>
      )}

      <Section title={readOnly ? "What this data says" : "What your data says"} sub={readOnly ? "Insights from this group's measurements" : "Insights from your own measurements"}>
        <div className="space-y-2.5">
          {cards.map((c, i) => <Insight key={i} {...c} />)}
          {EMPTY_TIPS.filter(() => cards.length < 3).map((t, i) => <Insight key={"tip" + i} {...t} />)}
        </div>
      </Section>

      <Section title="All readings" action={<span className="text-xs font-semibold text-[var(--color-ink-2)]">{rs.length} total</span>}>
        <div className="space-y-2">
          {shown.map((r) => (
            <Card key={r.id} className="flex items-center gap-2.5 p-2.5">
              <SurfaceArt id={r.material} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-sm font-extrabold text-[var(--color-ink)]">{labelFor(r)}</div>
                <div className="flex items-center gap-1 truncate text-[11px] font-semibold text-[var(--color-ink-2)]">
                  <Icon name={SHADE[r.shade]?.iconName} size={13} /> {SHADE[r.shade]?.label}
                  {r.shadeSource ? ` · ${srcById(r.shadeSource)?.short}` : ""}
                  {r.place ? ` · ${r.place}` : ""}
                  {r.airTemp ? ` · air ${Math.round(r.airTemp)}°` : ""}
                </div>
              </div>
              <TempChip temp={r.temp} color={tempColor(r.temp)} />
              {!readOnly && (
                <button onClick={() => onDelete(r.id)} aria-label="Delete reading"
                  className="rounded-lg px-2 py-1 text-[var(--color-rule)] hover:text-[var(--color-accent)]">✕</button>
              )}
            </Card>
          ))}
        </div>
        {rs.length > 6 && (
          <button onClick={() => setShowAll((v) => !v)} className="mt-3 w-full font-display text-sm font-extrabold text-[var(--color-accent-2)]">
            {showAll ? "Show less" : `Show all ${rs.length} →`}
          </button>
        )}
      </Section>

      <div className="mt-6 flex items-center justify-center gap-2">
        <Btn variant="ghost" onClick={() => download(toCSV(rs), exportName)}>Export CSV</Btn>
        {!readOnly && (
          <Btn variant="ghost" onClick={() => { if (confirm("Clear all of your group's readings? This affects everyone in the group.")) onReset(); }}>Reset</Btn>
        )}
      </div>
    </div>
  );
}

export function toCSV(rows) {
  const head = "id,at,material,color,shade,temp_c,air_temp_c,place,lat,lon,by";
  const lines = rows.map((r) =>
    [r.id, new Date(r.at).toISOString(), r.material, r.color || "", r.shade, r.temp, r.airTemp ?? "", JSON.stringify(r.place || ""), r.lat ?? "", r.lon ?? "", JSON.stringify(r.by || "")].join(",")
  );
  return [head, ...lines].join("\n");
}

function download(csv, name) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hoonu-tha-${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
