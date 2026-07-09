"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { isJoined, getGroup, getGroupName } from "@/lib/group";
import { useAmbient } from "@/lib/ambient";
import { Icon } from "@/components/Art";
import Dashboard from "@/components/Dashboard";

export default function DataPage() {
  const store = useStore();
  const { temp: air, live } = useAmbient();
  const [mounted, setMounted] = useState(false);
  const [globalRs, setGlobalRs] = useState(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isJoined()) {
      fetch("/api/readings?scope=global", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setGlobalRs(Array.isArray(d) ? d : []))
        .catch(() => setGlobalRs([]));
    }
  }, [mounted]);

  const loading = <div className="pt-10 text-center font-semibold text-[var(--color-ink-2)]">Loading…</div>;
  if (!mounted) return loading;

  const joined = isJoined();

  if (joined) {
    if (!store.ready) return loading;
    return (
      <div className="pt-4">
        <ViewBanner joined name={getGroupName() || getGroup()} />
        <AirChip air={air} live={live} />
        <Dashboard rs={store.readings()} exportName={getGroup()} onDelete={store.removeReading} onReset={store.resetDemo} />
      </div>
    );
  }

  // Not in a group → everyone's readings, read-only.
  if (globalRs === null) return loading;
  return (
    <div className="pt-4">
      <ViewBanner name="Everyone's readings" />
      <AirChip air={air} live={live} />
      <Dashboard rs={globalRs} readOnly exportName="all-islands" />
    </div>
  );
}

// Tells the user exactly which dataset they're looking at.
function ViewBanner({ joined = false, name }) {
  return (
    <div className={`mb-3 flex items-center gap-2 rounded-2xl border-2 border-[var(--color-ink)] p-2.5 ${joined ? "bg-[var(--color-sun)]" : "bg-[color-mix(in_oklch,var(--color-cool)_26%,white)]"}`}>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border-2 border-[var(--color-ink)] bg-[color-mix(in_oklch,var(--color-paper)_88%,white)] text-[var(--color-ink)]">
        <Icon name={joined ? "flag" : "globe"} size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-2)]">Viewing</div>
        <div className="truncate font-display text-sm font-extrabold text-[var(--color-ink)]">
          {name}{!joined && <span className="text-[var(--color-ink-2)]"> · all islands</span>}
        </div>
      </div>
      {!joined && <Link href="/teachers" className="shrink-0 font-display text-xs font-extrabold text-[var(--color-accent-2)]">Join a group →</Link>}
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
