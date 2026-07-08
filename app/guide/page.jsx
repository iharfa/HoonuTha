"use client";
import Link from "next/link";
import { MATERIALS, COLORS } from "@/lib/data";
import { useAmbient } from "@/lib/ambient";
import { SurfaceArt, DetectiveSun } from "@/components/Art";
import { Thermometer } from "@/components/Chart";
import { Section, Card, Btn } from "@/components/ui";

export default function Guide() {
  const { temp: air } = useAmbient();
  const families = [...new Set(MATERIALS.map((m) => m.family))];
  return (
    <div className="pt-4">
      <Card tint className="flex items-center gap-3">
        <DetectiveSun size={56} />
        <div>
          <h1 className="font-display text-lg font-extrabold text-[var(--color-ink)]">Surface Field Guide</h1>
          <p className="mt-0.5 text-sm text-[var(--color-ink-2)]">
            Every surface has an <b className="text-[var(--color-accent-2)]">albedo</b> — how much sunlight it bounces
            back. Brighter = cooler. The thermometer shows a typical midday temperature in full sun, next to
            today's <b className="text-[var(--color-ink)]">≈{Math.round(air)}°C Maldives air</b>.
          </p>
        </div>
      </Card>

      {families.map((fam) => (
        <Section key={fam} title={fam}>
          <div className="space-y-2.5">
            {MATERIALS.filter((m) => m.family === fam).map((m) => {
              const delta = Math.round(m.sunTemp - air);
              return (
                <Card key={m.id} lift>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0"><SurfaceArt id={m.id} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-display text-sm font-extrabold text-[var(--color-ink)]">{m.label}</div>
                        <span className="rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-paper-2)] px-2 py-0.5 text-[11px] font-bold text-[var(--color-ink)]">albedo {m.albedo}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-[var(--color-ink-2)]">{m.about}</p>
                      {m.colors && (
                        <div className="mt-1.5 flex items-center gap-1">
                          <span className="text-[11px] font-semibold text-[var(--color-ink-2)]">comes in:</span>
                          {COLORS.filter((c) => m.colorSet.includes(c.id)).map((c) => (
                            <span key={c.id} title={c.label} className="h-4 w-4 rounded-full border border-[var(--color-ink)]" style={{ background: c.hex }} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <Thermometer temp={m.sunTemp} ambient={air} />
                    <p className="mt-1 text-center text-[11px] font-semibold text-[var(--color-ink-2)]">
                      <b className="text-[var(--color-ink)]">≈{m.sunTemp}°C</b> in full sun — about{" "}
                      <b className="text-[var(--color-accent-2)]">+{delta}° hotter</b> than today's {Math.round(air)}° air.
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      ))}

      <Link href="/measure" className="mt-6 block"><Btn className="w-full">Measure a surface</Btn></Link>
    </div>
  );
}
