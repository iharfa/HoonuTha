"use client";
// Group chip in the header: shows which class/group this device logs to.
// Joining: tap the chip and type the code the teacher made up, or open a
// shared link like https://app-url/?group=grade-7b (QR-code friendly).
import { useEffect, useState } from "react";
import { getGroup, setGroup, norm, DEMO } from "@/lib/group";
import { Icon } from "@/components/Art";

export default function GroupChip() {
  const [g, setG] = useState(null); // null until mounted (avoids SSR mismatch)

  useEffect(() => {
    const url = new URL(window.location.href);
    const fromLink = url.searchParams.get("group");
    if (fromLink && norm(fromLink) !== getGroup()) {
      setGroup(fromLink);
      url.searchParams.delete("group");
      window.history.replaceState({}, "", url);
    }
    setG(getGroup());
  }, []);

  function change() {
    const v = window.prompt(
      "Enter your class or group code (ask your teacher or leader).\nLeave empty for the demo group.",
      g === DEMO ? "" : g
    );
    if (v == null) return;
    setGroup(v);
    window.location.reload(); // ponytail: reload swaps the dataset + store state wholesale; in-app refetch if this ever feels slow
  }

  if (g === null) return null;
  return (
    <button onClick={change} title="Change class / group"
      className="press ml-auto flex max-w-[40vw] items-center gap-1.5 rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-sun)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-ink)]">
      <Icon name="flag" size={14} />
      <span className="truncate">{g === DEMO ? "Join a group" : g}</span>
    </button>
  );
}
