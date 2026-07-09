"use client";
// Teachers / leaders request a class group here. Requests land as "pending";
// the programme admin approves, calls the teacher, hands over the join code
// and walks them through the activity.
import { useState } from "react";
import Link from "next/link";
import { Card, Btn } from "@/components/ui";
import { DetectiveSun, Icon } from "@/components/Art";

export default function TeachersPage() {
  const [f, setF] = useState({ school: "", label: "", contact: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/groups", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(f) });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong — try again.");
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  if (sent)
    return (
      <div className="pt-6 text-center">
        <div className="mx-auto w-fit"><DetectiveSun size={92} spin /></div>
        <h2 className="mt-2 font-display text-2xl font-extrabold text-[var(--color-ink)]">Request sent!</h2>
        <Card className="mt-4 text-left text-sm text-[var(--color-ink-2)]">
          <p>Thank you, <b className="text-[var(--color-ink)]">{f.contact}</b>! We'll call you on{" "}
          <b className="text-[var(--color-ink)]">{f.phone}</b> to set up{" "}
          <b className="text-[var(--color-ink)]">{f.label}</b> at {f.school}, give you your class join code,
          and walk you through how the activity works.</p>
          <p className="mt-2">In the meantime, feel free to explore the app — the demo data shows what your class's charts will look like.</p>
        </Card>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/data"><Btn variant="cool">See demo charts</Btn></Link>
          <Link href="/"><Btn variant="soft">Home</Btn></Link>
        </div>
      </div>
    );

  return (
    <div className="pt-4">
      <div className="flex items-center gap-3">
        <DetectiveSun size={56} />
        <div>
          <h1 className="font-display text-xl font-extrabold text-[var(--color-ink)]">Request a class or group</h1>
          <p className="text-sm font-semibold text-[var(--color-ink-2)]">For teachers, Scout leaders and club organisers.</p>
        </div>
      </div>

      <Card className="mt-4">
        <form onSubmit={submit} className="space-y-3">
          <Field label="School or organisation">
            <input value={f.school} onChange={set("school")} placeholder="e.g. Ameeniyya School" required maxLength={60} className="tp-input" />
          </Field>
          <Field label="Class or group name">
            <input value={f.label} onChange={set("label")} placeholder="e.g. Grade 7B, Scouts, Environment Club" required maxLength={60} className="tp-input" />
          </Field>
          <Field label="Your name">
            <input value={f.contact} onChange={set("contact")} placeholder="e.g. Aminath Shaira" required maxLength={60} className="tp-input" />
          </Field>
          <Field label="Your phone number">
            <input value={f.phone} onChange={set("phone")} type="tel" placeholder="e.g. 7XX XXXX" required maxLength={20} className="tp-input" />
          </Field>
          {error && <p className="text-sm font-bold text-[var(--color-accent-2)]">{error}</p>}
          <Btn type="submit" disabled={busy} className="w-full">{busy ? "Sending…" : "Request my group"}</Btn>
        </form>
      </Card>

      <Card tint className="mt-4 flex gap-3 text-sm text-[var(--color-ink-2)]">
        <span className="mt-0.5 shrink-0 text-[var(--color-accent-2)]"><Icon name="bulb" size={20} /></span>
        <span><b className="text-[var(--color-ink)]">What happens next:</b> we'll call you to approve your group,
        give you the join code your students will use, and walk you through running the activity —
        plus any support you need along the way.</span>
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-[var(--color-ink-2)]">{label}</span>
      {children}
    </label>
  );
}
