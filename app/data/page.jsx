"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useAmbient } from "@/lib/ambient";
import { byMaterial, albedoPoints, shadeEffect, shadeMatrix, insights, stats, labelFor, EMPTY_TIPS } from "@/lib/insights";
import { SHADE, tempColor } from "@/lib/data";
import { BarChart, Scatter, SunShade, ShadeMatrix } from "@/components/Chart";
import { SurfaceArt, DetectiveSun, Icon } from "@/components/Art";
import { Section, Card, Stat, Btn, Insight, TempChip } from "@/components/ui";

export default function DataPage() {
  const store = useStore();
  const { temp: air, live } = useAmbient();
  const [showAll, setShowAll] = useState(false);
  if (!store.ready) return <div className="pt-10 text-center font-semibold text-[var(--color-ink-2)]">Loading…</div>;

  const rs = store.readings();
  const s = stats(rs);
  const bars = byMaterial(rs);
  const pts = albedoPoints(rs);
  const shade = shadeEffect(rs);
  const matrix = shadeMatrix(rs);
  const cards = insights(rs);
  const shown = showAll ? rs : rs.slice(0, 6);

  if (!rs.length)
    return (
      <div className="pt-10 text-center">
        <div className="mx-auto w-fit"><DetectiveSun size={84} /></div>
        <h2 className="mt-2 font-display text-lg font-extrabold text-[var(--color-ink)]">No readings yet</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-2)]">Measure a few surfaces and your charts will appear here.</p>
        <Link href="/measure"><Btn className="mt-4">Start measuring</Btn></Link>
      </div>
    );

  return (
    <div className="pt-4">
      <AirChip air={air} live={live} />

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

      <Section title="What your data says" sub="Insights from your own measurements">
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
                  {r.place ? ` · ${r.place}` : ""}
                  {r.airTemp ? ` · air ${Math.round(r.airTemp)}°` : ""}
                </div>
              </div>
              <TempChip temp={r.temp} color={tempColor(r.temp)} />
              <button onClick={() => store.removeReading(r.id)} aria-label="Delete reading"
                className="rounded-lg px-2 py-1 text-[var(--color-rule)] hover:text-[var(--color-accent)]">✕</button>
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
        <Btn variant="ghost" onClick={() => download(store.exportCSV())}>Export CSV</Btn>
        <Btn variant="ghost" onClick={() => { if (confirm("Clear your readings and restore the samples?")) store.resetDemo(); }}>Reset</Btn>
      </div>
    </div>
  );
}

function AirChip({ air, live }) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-full border-2 border-[var(--color-ink)] bg-[color-mix(in_oklch,var(--color-cool)_24%,white)] px-3 py-1.5 text-xs font-bold text-[var(--color-ink)]">
      <span className="text-[var(--color-cool)]"><Icon name="thermometer" size={16} /></span>
      Maldives air today: <b>≈{Math.round(air)}°C</b>
      <span className="font-semibold text-[var(--color-ink-2)]">{live ? "· live" : "· estimate"}</span>
    </div>
  );
}

function download(csv) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "heat-detectives-readings.csv";
  a.click();
  URL.revokeObjectURL(url);
}
