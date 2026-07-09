"use client";
// Read-only view of one registered group's data: same charts as My Data,
// addressed by public directory id so the join code is never exposed.
import { use, useEffect, useState } from "react";
import Link from "next/link";
import Dashboard from "@/components/Dashboard";
import { Icon } from "@/components/Art";

export default function GroupPage({ params }) {
  const { id } = use(params);
  const [rs, setRs] = useState(null);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    fetch(`/api/readings?gid=${id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setRs(Array.isArray(d) ? d : []))
      .catch(() => setRs([]));
    fetch("/api/groups", { cache: "no-store" })
      .then((r) => r.json())
      .then((all) => setMeta((Array.isArray(all) && all.find((g) => g.id === Number(id))) || false))
      .catch(() => setMeta(false));
  }, [id]);

  if (rs === null || meta === null) return <div className="pt-10 text-center font-semibold text-[var(--color-ink-2)]">Loading…</div>;

  return (
    <div className="pt-4">
      <Link href="/groups" className="inline-flex items-center gap-1 text-sm font-bold text-[var(--color-accent-2)]">← All schools</Link>
      {meta && (
        <div className="mt-2 flex items-center gap-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-sun)] text-[var(--color-ink)]"><Icon name="flag" size={20} /></span>
          <div>
            <h1 className="font-display text-lg font-extrabold leading-tight text-[var(--color-ink)]">{meta.label}</h1>
            <p className="text-xs font-semibold text-[var(--color-ink-2)]">{meta.school}</p>
          </div>
        </div>
      )}
      <Dashboard rs={rs} readOnly exportName={meta ? `${meta.school}-${meta.label}`.toLowerCase().replace(/\s+/g, "-") : "group"} />
    </div>
  );
}
