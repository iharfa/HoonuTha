"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { stats } from "@/lib/insights";
import { HeroCover, Icon } from "@/components/Art";
import { Section, Card, Stat, Btn } from "@/components/ui";

const MISSIONS = [
  { icon: "thermometer", title: "Collect", body: "Measure the temperature of sand, roads, pavers, playgrounds and road paint.", href: "/measure", cta: "Measure" },
  { icon: "chart", title: "Discover", body: "See charts and insights built from your own readings.", href: "/data", cta: "See my data" },
  { icon: "book", title: "Identify", body: "Use the Field Guide to know each surface and its albedo.", href: "/guide", cta: "Field Guide" },
  { icon: "flask", title: "Understand", body: "Learn about heat islands, albedo, trees and evapotranspiration.", href: "/learn", cta: "Learn" },
];

const TIPS = [
  { icon: "clock", node: <><b className="text-[var(--color-ink)]">Measure near midday</b>, when surfaces are hottest.</> },
  { icon: "ruler", node: <>Hold the thermometer close to the surface (or point an infrared one straight down).</> },
  { icon: "repeat", node: <>Measure the <b className="text-[var(--color-ink)]">same material in sun and in shade</b> to see the difference.</> },
  { icon: "palette", node: <>Compare <b className="text-[var(--color-ink)]">colours</b> — white vs black pavers, white vs red road paint.</> },
  { icon: "warn", node: <>Never touch a surface that looks very hot with bare skin!</> },
];

export default function Home() {
  const store = useStore();
  const rs = store.ready ? store.readings() : [];
  const s = stats(rs);

  return (
    <div>
      <Card className="mt-4 overflow-hidden p-0">
        <HeroCover className="w-full" />
        <div className="p-4">
          <h1 className="font-display text-2xl font-extrabold leading-tight text-[var(--color-ink)]">
            Why do some streets feel like an <span className="squiggle">oven?</span>
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-2)]">
            Grab a thermometer, measure the surfaces around you, and become a heat detective.
            Your readings uncover the <b className="text-[var(--color-accent-2)]">Urban Heat Island</b> — and
            how trees, colour and shade cool our islands.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/measure" className="flex-1"><Btn className="w-full">Start measuring</Btn></Link>
            <Link href="/learn"><Btn variant="soft">How it works</Btn></Link>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="Readings" value={s.count} tone="text-[var(--color-accent-2)]" />
        <Stat label="Surfaces" value={s.materials} tone="text-[var(--color-leaf)]" />
        <Stat label="Hottest" value={s.max ? `${Math.round(s.max)}°` : "—"} tone="text-[var(--color-accent)]" />
      </div>

      <Section title="Your mission" sub="A real citizen-science investigation">
        <div className="grid gap-3 sm:grid-cols-2">
          {MISSIONS.map((m) => (
            <Card key={m.title} lift className="flex flex-col">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-sun)] text-[var(--color-ink)]">
                <Icon name={m.icon} size={24} />
              </div>
              <div className="mt-2 font-display text-base font-extrabold text-[var(--color-ink)]">{m.title}</div>
              <p className="mt-0.5 flex-1 text-sm text-[var(--color-ink-2)]">{m.body}</p>
              <Link href={m.href} className="mt-2 font-display text-sm font-extrabold text-[var(--color-accent-2)]">{m.cta} →</Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="How to measure well" sub="Tips for good scientists">
        <Card tint>
          <ul className="space-y-2.5 text-sm text-[var(--color-ink-2)]">
            {TIPS.map((t, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-[var(--color-accent-2)]"><Icon name={t.icon} size={18} /></span>
                <span>{t.node}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      <p className="mt-6 text-center text-[11px] font-semibold text-[var(--color-ink-2)]">Works offline · Your data stays on your device</p>
    </div>
  );
}
