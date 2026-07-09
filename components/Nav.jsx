"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Art";

const TABS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/guide", label: "Guide", icon: "book" },
  { href: "/measure", label: "Measure", icon: "thermometer", primary: true },
  { href: "/data", label: "My Data", icon: "chart" },
  { href: "/learn", label: "Learn", icon: "flask" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-[var(--color-ink)] bg-[color-mix(in_oklch,var(--color-paper)_94%,white)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-2xl items-stretch gap-1.5 px-2 py-1.5">
        {TABS.map((t) => {
          const active = path === t.href;
          const cls = t.primary
            ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)] shadow-[var(--shadow-card)]"
            : active
              ? "bg-[var(--color-sun)] text-[var(--color-ink)]"
              : "text-[var(--color-ink-2)]";
          return (
            <Link key={t.href} href={t.href} aria-label={t.label}
              className={`press flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5 text-[10.5px] font-bold ${cls}`}>
              <Icon name={t.icon} size={t.primary ? 23 : 20} strokeWidth={t.primary ? 2.3 : 2} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
