"use client";
// Admin console: review teacher requests, approve them, hand over the 4-digit
// join code, and rename or delete groups. Gated by ADMIN_KEY.
// ponytail: key-in-a-box auth is the whole admin story; real accounts only if more admins ever exist.
import { useEffect, useState } from "react";
import { Card, Btn } from "@/components/ui";

const KEY_STORE = "hd-admin-key";
const H = { "content-type": "application/json" };

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

  const patch = async (payload, fail) => {
    const res = await fetch("/api/groups", { method: "PATCH", headers: H, body: JSON.stringify({ ...payload, key }) });
    if (res.ok) load(key); else setError(fail);
  };

  async function rename(g) {
    const school = window.prompt("School / organisation:", g.school);
    if (school == null) return;
    const label = window.prompt("Class / group name:", g.label);
    if (label == null) return;
    patch({ id: g.id, school, label }, "Rename failed.");
  }

  async function del(g) {
    if (!window.confirm(`Delete “${g.label} · ${g.school}” and ALL its readings?\nThis cannot be undone.`)) return;
    const res = await fetch("/api/groups", { method: "DELETE", headers: H, body: JSON.stringify({ id: g.id, key }) });
    if (res.ok) load(key); else setError("Delete failed.");
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
      {error && <p className="mt-2 text-sm font-bold text-[var(--color-accent-2)]">{error}</p>}

      <h2 className="mt-4 font-display text-base font-extrabold text-[var(--color-accent-2)]">Pending ({pending.length})</h2>
      <div className="mt-2 space-y-2">
        {pending.length === 0 && <p className="text-sm font-semibold text-[var(--color-ink-2)]">No requests waiting.</p>}
        {pending.map((g) => (
          <GroupCard key={g.id} g={g} onApprove={() => patch({ id: g.id, action: "approve" }, "Approve failed.")} onRename={() => rename(g)} onDelete={() => del(g)} />
        ))}
      </div>

      <h2 className="mt-6 font-display text-base font-extrabold text-[var(--color-leaf)]">Approved ({approved.length})</h2>
      <div className="mt-2 space-y-2">
        {approved.map((g) => <GroupCard key={g.id} g={g} onRename={() => rename(g)} onDelete={() => del(g)} />)}
      </div>
    </div>
  );
}

function GroupCard({ g, onApprove, onRename, onDelete }) {
  const [copied, setCopied] = useState(false);
  const link = `${typeof window !== "undefined" ? window.location.origin : ""}/?join=${g.pin || ""}`;
  const copy = () => navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  const isDemo = g.code === "demo";

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

      {g.pin && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-2)]">Join code</span>
          <span className="rounded-lg border-2 border-[var(--color-ink)] bg-[var(--color-sun)] px-3 py-1 font-display text-lg font-extrabold tracking-[0.2em] text-[var(--color-ink)]">{g.pin}</span>
          <button onClick={copy} className="text-xs font-bold text-[var(--color-accent-2)]">{copied ? "Copied link!" : "Copy join link"}</button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {onApprove && <Btn variant="soft" onClick={onApprove} className="!py-1.5 text-xs">Approve</Btn>}
        <Btn variant="ghost" onClick={onRename} className="!py-1.5 text-xs">Rename</Btn>
        {!isDemo && <Btn variant="ghost" onClick={onDelete} className="!py-1.5 text-xs !text-[var(--color-accent-2)]">Delete</Btn>}
      </div>
    </Card>
  );
}
