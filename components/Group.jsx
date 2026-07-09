"use client";
// Group chip in the header. Students tap it and type the 4-digit code their
// teacher hands out; the device then logs + views that group's data. Links like
// ?join=3847 (pin) or ?group=grade-7b (slug) also work.
import { useEffect, useState } from "react";
import { getGroup, getGroupName, isJoined, joinGroup, leaveGroup, setGroup, norm } from "@/lib/group";
import { Icon } from "@/components/Art";

export default function GroupChip() {
  const [name, setName] = useState(null); // null until mounted (avoids SSR mismatch)

  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const joinPin = url.searchParams.get("join");
      const fromLink = url.searchParams.get("group");
      if (joinPin) {
        try {
          const res = await fetch(`/api/groups/join?pin=${encodeURIComponent(joinPin)}`, { cache: "no-store" });
          if (res.ok) { const g = await res.json(); joinGroup(g.code, `${g.label} · ${g.school}`); }
        } catch {}
        url.searchParams.delete("join");
        window.history.replaceState({}, "", url);
      } else if (fromLink && norm(fromLink) !== getGroup()) {
        setGroup(fromLink);
        url.searchParams.delete("group");
        window.history.replaceState({}, "", url);
      }
      setName(isJoined() ? getGroupName() || getGroup() : "");
    })();
  }, []);

  async function change() {
    const joined = isJoined();
    const v = window.prompt(
      joined
        ? "Enter a 4-digit code to switch group, or leave empty to leave your group."
        : "Enter your 4-digit group code (ask your teacher or leader)."
    );
    if (v == null) return;
    const pin = v.trim();
    if (!pin) {
      if (joined) { leaveGroup(); window.location.reload(); }
      return;
    }
    if (!/^\d{4}$/.test(pin)) { window.alert("The join code is 4 digits, like 3847."); return; }
    try {
      const res = await fetch(`/api/groups/join?pin=${encodeURIComponent(pin)}`, { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) { window.alert(body.error || "Couldn't join that group."); return; }
      joinGroup(body.code, `${body.label} · ${body.school}`);
      window.location.reload();
    } catch { window.alert("Network error — try again."); }
  }

  if (name === null) return null;
  return (
    <button onClick={change} title="Join or change your class / group"
      className="press ml-auto flex max-w-[42vw] items-center gap-1.5 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-sun)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-ink)]">
      <Icon name="flag" size={14} />
      <span className="truncate">{name || "Join a group"}</span>
    </button>
  );
}
