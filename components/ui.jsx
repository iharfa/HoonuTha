"use client";
import { Icon } from "@/components/Art";

export function Section({ title, sub, action, children }) {
  return (
    <section className="mt-7">
      {(title || action) && (
        <div className="mb-2.5 flex items-end justify-between gap-2">
          <div>
            {title && <h2 className="font-display text-lg font-extrabold text-[var(--color-accent-2)]">{title}</h2>}
            {sub && <p className="text-xs font-semibold text-[var(--color-ink-2)]">{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({ className = "", tint = false, lift = false, children, ...p }) {
  return (
    <div className={`sticker ${tint ? "sticker-tint" : ""} ${lift ? "lift" : ""} p-4 ${className}`} {...p}>
      {children}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "text-[var(--color-ink)]" }) {
  return (
    <Card className="text-center">
      <div className={`font-display text-2xl font-extrabold leading-none ${tone}`}>{value}</div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-wide text-[var(--color-ink-2)]">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] text-[var(--color-ink-2)]">{sub}</div>}
    </Card>
  );
}

export function Btn({ children, variant = "primary", className = "", ...props }) {
  const base = "press inline-flex items-center justify-center gap-1.5 rounded-[16px] border-2 border-[var(--color-ink)] px-4 py-2.5 font-display text-sm font-extrabold disabled:opacity-40";
  const styles = {
    primary: "bg-[var(--color-accent)] text-[var(--color-accent-ink)] shadow-[var(--shadow-card)]",
    soft: "bg-[var(--color-sun)] text-[var(--color-ink)]",
    cool: "bg-[var(--color-cool)] text-[var(--color-ink)]",
    ghost: "bg-[color-mix(in_oklch,var(--color-paper)_88%,white)] text-[var(--color-ink)]",
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Insight({ icon, title, body }) {
  return (
    <Card className="flex gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border-2 border-[var(--color-ink)] bg-[var(--color-sun)] text-[var(--color-ink)]">
        <Icon name={icon} size={22} />
      </div>
      <div>
        <div className="font-display text-sm font-extrabold text-[var(--color-ink)]">{title}</div>
        <p className="mt-0.5 text-sm leading-snug text-[var(--color-ink-2)]">{body}</p>
      </div>
    </Card>
  );
}

// Coloured temperature chip — background comes from the perceptual data scale.
export function TempChip({ temp, color }) {
  return (
    <span className="inline-flex items-center rounded-full border-2 border-[var(--color-ink)] px-2.5 py-0.5 font-display text-xs font-extrabold text-white" style={{ background: color }}>
      {Math.round(temp)}°C
    </span>
  );
}
