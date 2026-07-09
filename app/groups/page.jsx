"use client";
// Public directory: every registered school and its classes/groups, with
// reading counts. Tap through to browse a group's data read-only.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Btn } from "@/components/ui";
import { DetectiveSun, Icon } from "@/components/Art";

export default function GroupsPage() {
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    fetch("/api/groups", { cache: "no-store" })
      .then((r) => r.json())
      .then((g) => setGroups(Array.isArray(g) ? g : []))
      .catch(() => setGroups([]));
  }, []);

  if (groups === null) return <div className="pt-10 text-center font-semibold text-[var(--color-ink-2)]">Loading…</div>;

  const bySchool = groups.reduce((m, g) => ((m[g.school] ||= []).push(g), m), {});

  return (
    <div className="pt-4">
      <div className="flex items-center gap-3">
        <DetectiveSun size={56} />
        <div>
          <h1 className="font-display text-xl font-extrabold text-[var(--color-ink)]">Schools & groups</h1>
          <p className="text-sm font-semibold text-[var(--color-ink-2)]">Heat detectives across the islands — browse what each group found.</p>
        </div>
      </div>

      <div className="mt-4 space-y-5">
        {Object.entries(bySchool).map(([school, list]) => (
          <section key={school}>
            <h2 className="mb-2 flex items-center gap-1.5 font-display text-base font-extrabold text-[var(--color-accent-2)]">
              <Icon name="city" size={18} /> {school}
            </h2>
            <div className="space-y-2">
              {list.map((g) => (
                <Link key={g.id} href={`/groups/${g.id}`} className="block">
                  <Card lift className="flex items-center gap-2.5 p-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-sun)] text-[var(--color-ink)]"><Icon name="flag" size={18} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-sm font-extrabold text-[var(--color-ink)]">{g.label}</span>
                      <span className="block text-[11px] font-semibold text-[var(--color-ink-2)]">{g.count} reading{g.count === 1 ? "" : "s"}</span>
                    </span>
                    <span className="font-display text-sm font-extrabold text-[var(--color-accent-2)]">Browse →</span>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Card tint className="mt-6 text-center text-sm text-[var(--color-ink-2)]">
        Teaching a class or leading a group?
        <Link href="/teachers" className="block"><Btn variant="soft" className="mt-2">Create your class group</Btn></Link>
      </Card>
    </div>
  );
}
