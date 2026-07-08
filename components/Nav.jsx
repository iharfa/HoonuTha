"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/Art";

const TABS = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/guide", label: "Guide", icon: "book" },
  { href: "/measure", label: "Measure", icon: "thermometer", big: true },
  { href: "/data", label: "My Data", icon: "chart" },
  { href: "/learn", label: "Learn", icon: "flask" },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-[var(--color-ink)] bg-[color-mix(in_oklch,var(--color-paper)_92%,white)] pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2">
        {TABS.map((t) => {
          const active = path === t.href;
          if (t.big)
            return (
              <Link key={t.href} href={t.href} aria-label="Measure a surface"
                className="press -mt-6 grid h-16 w-16 place-items-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-accent)] text-[var(--color-accent-ink)] shadow-[var(--shadow-lift)]">
                <Icon name={t.icon} size={28} strokeWidth={2.4} />
              </Link>
            );
          return (
            <Link key={t.href} href={t.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-bold transition-colors ${active ? "bg-[var(--color-sun)] text-[var(--color-ink)]" : "text-[var(--color-ink-2)]"}`}>
              <Icon name={t.icon} size={21} />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
