"use client";
// Teachers / leaders create a class group here: instant, no approval step.
// Creating it registers the group in the public directory (/groups) and hands
// the teacher the join code + share link.
import { useState } from "react";
import Link from "next/link";
import { setGroup } from "@/lib/group";
import { Card, Btn } from "@/components/ui";
import { DetectiveSun, Icon } from "@/components/Art";

export default function TeachersPage() {
  const [school, setSchool] = useState("");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [made, setMade] = useState(null); // {code, school, label}

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/groups", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ school, label }) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong — try again.");
      setMade(body);
      setGroup(body.code); // the teacher's own device joins the new group
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  if (made) return <Created group={made} />;

  return (
    <div className="pt-4">
      <div className="flex items-center gap-3">
        <DetectiveSun size={56} />
        <div>
          <h1 className="font-display text-xl font-extrabold text-[var(--color-ink)]">Set up your class or group</h1>
          <p className="text-sm font-semibold text-[var(--color-ink-2)]">For teachers, Scout leaders and club organisers.</p>
        </div>
      </div>

      <Card className="mt-4">
        <form onSubmit={submit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-[var(--color-ink-2)]">School or organisation</span>
            <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="e.g. Ameeniyya School" required maxLength={60} className="tp-input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-[var(--color-ink-2)]">Class or group name</span>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Grade 7B, Scouts, Environment Club" required maxLength={60} className="tp-input" />
          </label>
          {error && <p className="text-sm font-bold text-[var(--color-accent-2)]">{error}</p>}
          <Btn type="submit" disabled={busy} className="w-full">{busy ? "Creating…" : "Create group"}</Btn>
        </form>
      </Card>

      <Card tint className="mt-4 text-sm text-[var(--color-ink-2)]">
        <b className="text-[var(--color-ink)]">How it works:</b> you get a short join code. Students enter it once
        (or open your share link) and every reading they log lands in your group's shared dataset —
        charts, insights and a CSV export you can use in class. Your group also appears in the{" "}
        <Link href="/groups" className="font-bold text-[var(--color-accent-2)]">public directory</Link> so
        other schools can see your findings.
      </Card>

      <style jsx>{`
        :global(.tp-input) {
          width: 100%;
          border: 2px solid var(--color-rule);
          border-radius: 14px;
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        :global(.tp-input:focus) { border-color: var(--color-accent); outline: none; }
      `}</style>
    </div>
  );
}

function Created({ group }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/?group=${group.code}` : "";

  function copy() {
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="pt-6 text-center">
      <div className="mx-auto w-fit"><DetectiveSun size={92} spin /></div>
      <h2 className="mt-2 font-display text-2xl font-extrabold text-[var(--color-ink)]">Group created!</h2>
      <p className="mt-1 text-sm font-semibold text-[var(--color-ink-2)]">{group.label} · {group.school}</p>

      <Card className="mt-4">
        <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink-2)]">Join code — write it on the board</div>
        <div className="mt-1 font-display text-3xl font-extrabold tracking-wide text-[var(--color-accent-2)]">{group.code}</div>
        <div className="mt-4 text-xs font-bold uppercase tracking-wide text-[var(--color-ink-2)]">Or share this link</div>
        <div className="mt-1 break-all rounded-[14px] border-2 border-[var(--color-rule)] bg-white px-3 py-2 text-xs font-semibold text-[var(--color-ink)]">{link}</div>
        <Btn variant="soft" onClick={copy} className="mt-3">{copied ? "Copied!" : "Copy link"}</Btn>
      </Card>

      <Card tint className="mt-4 text-left text-sm text-[var(--color-ink-2)]">
        <b className="text-[var(--color-ink)]">Next steps:</b>
        <ol className="mt-1 list-inside list-decimal space-y-1">
          <li>Students open the app and tap the <Icon name="flag" size={13} className="inline" /> chip up top, then type the code.</li>
          <li>Everyone measures surfaces with the <b>Measure</b> tab.</li>
          <li>Watch the group's charts grow under <b>My Data</b>.</li>
        </ol>
      </Card>

      {/* plain <a>: full reload so the store + header chip pick up the newly joined group */}
      <div className="mt-5 flex justify-center gap-2">
        <a href="/measure"><Btn>Start measuring</Btn></a>
        <a href="/groups"><Btn variant="cool">See all schools</Btn></a>
      </div>
    </div>
  );
}
