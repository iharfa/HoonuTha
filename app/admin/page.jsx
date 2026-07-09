"use client";
// Admin console: review teacher requests, approve them, and copy the join
// code / share link to send after the onboarding call. Gated by ADMIN_KEY.
// ponytail: key-in-a-box auth is the whole admin story; real accounts only if more admins ever exist.
import { useEffect, useState } from "react";
import { Card, Btn } from "@/components/ui";

const KEY_STORE = "hd-admin-key";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [groups, setGroups] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY_STORE);
    if (saved) { setKey(saved); load(saved); }
  }, []);

  async function load(k) {
    setError("");
    const res = await fetch(`/api/groups?key=${encodeURIComponent(k)}`, { cache: "no-store" });
    if (!res.ok) {
      sessionStorage.removeItem(KEY_STORE);
      setGroups(null);
      setError(res.status === 403 ? "Wrong key (or ADMIN_KEY is not set on the server)." : "Failed to load.");
      return;
    }
    sessionStorage.setItem(KEY_STORE, k);
    setGroups(await res.json());
  }

  async function approve(id) {
    const res = await fetch("/api/groups", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, key }) });
    if (res.ok) load(key);
    else setError("Approve failed.");
  }

  if (groups === null)
    return (
      <div className="pt-8">
        <h1 className="font-display text-xl font-extrabold text-[var(--color-ink)]">Admin</h1>
        <Card className="mt-4 space-y-3">
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin key"
            className="w-full rounded-[14px] border-2 border-[var(--color-rule)] bg-white px-3 py-2 text-sm" />
          {error && <p className="text-sm font-bold text-[var(--color-accent-2)]">{error}</p>}
          <Btn onClick={() => load(key)} disabled={!key} className="w-full">Open</Btn>
        </Card>
      </div>
    );

  const pending = groups.filter((g) => g.status === "pending");
  const approved = groups.filter((g) => g.status === "approved");

  return (
    <div className="pt-4">
      <h1 className="font-display text-xl font-extrabold text-[var(--color-ink)]">Group requests</h1>

      <h2 className="mt-4 font-display text-base font-extrabold text-[var(--color-accent-2)]">Pending ({pending.length})</h2>
      <div className="mt-2 space-y-2">
        {pending.length === 0 && <p className="text-sm font-semibold text-[var(--color-ink-2)]">No requests waiting.</p>}
        {pending.map((g) => <GroupCard key={g.id} g={g} onApprove={() => approve(g.id)} />)}
      </div>

      <h2 className="mt-6 font-display text-base font-extrabold text-[var(--color-leaf)]">Approved ({approved.length})</h2>
      <div className="mt-2 space-y-2">
        {approved.map((g) => <GroupCard key={g.id} g={g} />)}
      </div>
    </div>
  );
}

function GroupCard({ g, onApprove }) {
  const [copied, setCopied] = useState(false);
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/?group=${g.code}`;
  const copy = () => navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });

  return (
    <Card className="text-sm">
      <div className="flex items-center gap-2">
        <b className="font-display text-[var(--color-ink)]">{g.label}</b>
        <span className="text-[var(--color-ink-2)]">· {g.school}</span>
        <span className="ml-auto rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-paper-2)] px-2 py-0.5 text-xs font-bold">{g.count} readings</span>
      </div>
      {(g.contact || g.phone) && (
        <p className="mt-1 text-[var(--color-ink-2)]">
          {g.contact}{g.phone && <> · <a href={`tel:${g.phone}`} className="font-bold text-[var(--color-accent-2)]">{g.phone}</a></>}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <code className="rounded-lg border-2 border-[var(--color-rule)] bg-white px-2 py-0.5 text-xs font-bold">{g.code}</code>
        <button onClick={copy} className="text-xs font-bold text-[var(--color-accent-2)]">{copied ? "Copied!" : "Copy join link"}</button>
        {onApprove && <Btn variant="soft" onClick={onApprove} className="ml-auto !py-1.5 text-xs">Approve</Btn>}
      </div>
    </Card>
  );
}
