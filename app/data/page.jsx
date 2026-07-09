"use client";
import { useStore } from "@/lib/store";
import { getGroup } from "@/lib/group";
import { useAmbient } from "@/lib/ambient";
import { Icon } from "@/components/Art";
import Dashboard from "@/components/Dashboard";

export default function DataPage() {
  const store = useStore();
  const { temp: air, live } = useAmbient();
  if (!store.ready) return <div className="pt-10 text-center font-semibold text-[var(--color-ink-2)]">Loading…</div>;

  return (
    <div className="pt-4">
      <AirChip air={air} live={live} />
      <Dashboard rs={store.readings()} exportName={getGroup()} onDelete={store.removeReading} onReset={store.resetDemo} />
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
