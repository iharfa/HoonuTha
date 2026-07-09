"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { MATERIALS, COLORS, SHADE_LIST, SHADE_SOURCE_LIST, matById, colorById, estAlbedo, tempColor, tempFeel, fmtTemp } from "@/lib/data";
import { byMaterial, labelFor } from "@/lib/insights";
import { Card, Btn } from "@/components/ui";
import { SurfaceArt, DetectiveSun, Icon } from "@/components/Art";

const BLANK = { temp: 40, material: null, color: null, shade: null, shadeSource: null, airTemp: "", place: "", by: "" };

export default function Measure() {
  const store = useStore();
  const [step, setStep] = useState(0);
  const [r, setR] = useState(BLANK);
  const [savedId, setSavedId] = useState(null);
  const [gps, setGps] = useState(null); // {lat, lon} once the device fixes

  // Grab the location up front so it's ready by the last step. ~11 m precision
  // (4 decimals) records the surface, not the child.
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setGps({ lat: +p.coords.latitude.toFixed(4), lon: +p.coords.longitude.toFixed(4) }),
      () => {}, // denied/unavailable: the typed place becomes required instead
      { timeout: 15000, maximumAge: 300000 }
    );
  }, []);

  const mat = matById(r.material);
  const needsColor = !!mat?.colors;
  const needsSource = r.shade && r.shade !== "full-sun"; // ask what casts the shade
  const steps = ["temp", "material", ...(needsColor ? ["color"] : []), "shade", ...(needsSource ? ["shadeSource"] : []), "details"];
  const key = steps[step];
  const set = (patch) => setR((x) => ({ ...x, ...patch }));
  const canNext =
    (key === "temp" && r.temp) ||
    (key === "material" && r.material) ||
    (key === "color" && r.color) ||
    (key === "shade" && r.shade) ||
    (key === "shadeSource" && r.shadeSource) ||
    (key === "details" && (gps || r.place.trim())); // location must be recorded: GPS fix or a typed place

  function save() {
    setSavedId(store.addReading({ ...r, ...(gps || {}) }));
  }
  function again() {
    setR(BLANK);
    setStep(0);
    setSavedId(null);
  }

  if (savedId) return <Saved reading={{ ...r, id: savedId }} readings={store.readings()} onAgain={again} />;

  return (
    <div className="pt-4">
      <Progress step={step} total={steps.length} />

      {key === "temp" && <TempStep temp={r.temp} onChange={(t) => set({ temp: t })} />}
      {key === "material" && (
        <ChoiceGrid
          title="What surface is it?"
          items={MATERIALS.map((m) => ({ id: m.id, label: m.label, art: m.id, sub: m.family }))}
          value={r.material}
          onPick={(id) => set({ material: id, color: null })}
        />
      )}
      {key === "color" && (
        <ChoiceGrid
          title={`What colour is the ${mat.label.toLowerCase()}?`}
          items={COLORS.filter((c) => mat.colorSet.includes(c.id)).map((c) => ({ id: c.id, label: c.label, swatch: c.hex }))}
          value={r.color}
          onPick={(id) => set({ color: id })}
          cols="grid-cols-3"
        />
      )}
      {key === "shade" && (
        <ChoiceGrid
          title="How much sun is on it?"
          items={SHADE_LIST.map((s) => ({ id: s.id, label: s.label, iconName: s.iconName, sub: s.hint }))}
          value={r.shade}
          onPick={(id) => set(id === "full-sun" ? { shade: id, shadeSource: null } : { shade: id })}
          cols="grid-cols-1"
        />
      )}
      {key === "shadeSource" && (
        <ChoiceGrid
          title="What's making the shade?"
          items={SHADE_SOURCE_LIST.map((s) => ({ id: s.id, label: s.label, iconName: s.iconName, sub: s.hint }))}
          value={r.shadeSource}
          onPick={(id) => set({ shadeSource: id })}
          cols="grid-cols-1"
        />
      )}
      {key === "details" && <DetailsStep r={r} set={set} gps={gps} />}

      <div className="mt-6 flex items-center gap-2">
        {step > 0 && <Btn variant="ghost" onClick={() => setStep((s) => s - 1)}>← Back</Btn>}
        <div className="flex-1" />
        {key !== "details" ? (
          <Btn disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Next →</Btn>
        ) : (
          <Btn disabled={!canNext} onClick={save}>Save reading</Btn>
        )}
      </div>
    </div>
  );
}

function Progress({ step, total }) {
  return (
    <div className="mb-4 flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-2 flex-1 rounded-full border-2 border-[var(--color-ink)] ${i <= step ? "bg-[var(--color-accent)]" : "bg-[var(--color-paper-2)]"}`} />
      ))}
    </div>
  );
}

function TempStep({ temp, onChange }) {
  const c = tempColor(temp);
  return (
    <div>
      <h2 className="font-display text-xl font-extrabold text-[var(--color-ink)]">What temperature did you measure?</h2>
      <p className="text-sm font-semibold text-[var(--color-ink-2)]">Read it off your thermometer and set it below.</p>
      <Card className="mt-4 text-center">
        <div className="font-display text-6xl font-extrabold tabular-nums" style={{ color: c }}>{Math.round(temp)}°C</div>
        <div className="mt-1 font-display text-sm font-extrabold uppercase tracking-wide" style={{ color: c }}>{tempFeel(temp)}</div>
        <input
          type="range" min="15" max="80" step="1" value={temp}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-4 w-full accent-[var(--color-accent)]"
        />
        <div className="flex justify-between text-[11px] font-semibold text-[var(--color-ink-2)]"><span>15°</span><span>80°</span></div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <button onClick={() => onChange(Math.max(15, temp - 1))} className="press grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-paper-2)] text-xl font-bold">−</button>
          <input
            type="number" value={temp} min="0" max="120"
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="w-20 rounded-[14px] border-2 border-[var(--color-ink)] bg-white px-2 py-1.5 text-center font-display text-lg font-extrabold"
          />
          <button onClick={() => onChange(Math.min(120, temp + 1))} className="press grid h-10 w-10 place-items-center rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-paper-2)] text-xl font-bold">+</button>
        </div>
      </Card>
    </div>
  );
}

function ChoiceGrid({ title, items, value, onPick, cols = "grid-cols-2" }) {
  return (
    <div>
      <h2 className="mb-3 font-display text-xl font-extrabold text-[var(--color-ink)]">{title}</h2>
      <div className={`grid ${cols} gap-2.5`}>
        {items.map((it) => {
          const on = value === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onPick(it.id)}
              className={`press flex items-center gap-2.5 rounded-[18px] border-2 p-2.5 text-left ${on ? "border-[var(--color-ink)] bg-[var(--color-sun)] shadow-[var(--shadow-card)]" : "border-[var(--color-rule)] bg-[color-mix(in_oklch,var(--color-paper)_88%,white)]"}`}
            >
              {it.swatch ? (
                <span className="h-9 w-9 shrink-0 rounded-full border-2 border-[var(--color-ink)]" style={{ background: it.swatch }} />
              ) : it.art ? (
                <SurfaceArt id={it.art} />
              ) : (
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-[var(--color-ink)] bg-[var(--color-sun)] text-[var(--color-ink)]"><Icon name={it.iconName} size={20} /></span>
              )}
              <span className="min-w-0">
                <span className="block font-display text-sm font-extrabold text-[var(--color-ink)]">{it.label}</span>
                {it.sub && <span className="block text-[11px] font-semibold text-[var(--color-ink-2)]">{it.sub}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DetailsStep({ r, set, gps }) {
  const mat = matById(r.material);
  const col = r.color ? colorById(r.color) : null;
  return (
    <div>
      <h2 className="font-display text-xl font-extrabold text-[var(--color-ink)]">Almost done!</h2>
      <p className="text-sm font-semibold text-[var(--color-ink-2)]">Tell us where you measured — the rest is optional but makes your data more useful.</p>
      <div className={`mt-2 flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold ${gps ? "border-[var(--color-ink)] bg-[color-mix(in_oklch,var(--color-leaf)_20%,white)] text-[var(--color-ink)]" : "border-[var(--color-rule)] bg-[var(--color-paper-2)] text-[var(--color-ink-2)]"}`}>
        <Icon name="pin" size={14} />
        {gps ? `Location recorded (${gps.lat}, ${gps.lon})` : "No GPS signal — please type where you are below"}
      </div>
      <Card className="mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <SurfaceArt id={r.material} />
          <b className="font-display text-[var(--color-ink)]">{col ? `${col.label} ` : ""}{mat?.label}</b>
          <span className="ml-auto rounded-full border-2 border-[var(--color-ink)] bg-[var(--color-paper-2)] px-2 py-0.5 text-xs font-bold text-[var(--color-ink)]">
            albedo ≈ {estAlbedo(r.material, r.color)}
          </span>
        </div>
        <Field label="Air temperature right now (°C)">
          <input type="number" value={r.airTemp} placeholder="e.g. 31" onChange={(e) => set({ airTemp: e.target.value })} className="hd-input" />
        </Field>
        <Field label={gps ? "Where are you? (island / place)" : "Where are you? (island / place) — required"}>
          <input value={r.place} placeholder="e.g. Hulhumalé, school playground" onChange={(e) => set({ place: e.target.value })} className="hd-input" />
        </Field>
        <Field label="Your name or team">
          <input value={r.by} placeholder="e.g. Aishath" onChange={(e) => set({ by: e.target.value })} className="hd-input" />
        </Field>
      </Card>
      <style jsx>{`
        :global(.hd-input) {
          width: 100%;
          border: 2px solid var(--color-rule);
          border-radius: 14px;
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
        :global(.hd-input:focus) { border-color: var(--color-accent); outline: none; }
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

function Saved({ reading, readings, onAgain }) {
  const c = tempColor(reading.temp);
  const line = useMemo(() => {
    const all = readings.filter((x) => x.id !== reading.id);
    if (!all.length) return "First reading logged — keep going!";
    const cooler = all.filter((x) => x.temp < reading.temp).length;
    const pct = Math.round((cooler / all.length) * 100);
    const hottestOther = byMaterial(all)[0];
    if (reading.temp >= Math.max(...all.map((x) => x.temp)))
      return "🔥 That's the hottest surface you've measured so far!";
    return `Hotter than ${pct}% of your other readings. Your hottest surface type is still ${hottestOther?.label.toLowerCase()}.`;
  }, [reading, readings]);

  return (
    <div className="pt-6 text-center">
      <div className="mx-auto w-fit"><DetectiveSun size={92} spin /></div>
      <h2 className="mt-2 font-display text-2xl font-extrabold text-[var(--color-ink)]">Reading saved!</h2>
      <Card className="mt-4">
        <div className="font-display text-5xl font-extrabold" style={{ color: c }}>{fmtTemp(reading.temp)}</div>
        <div className="mt-1 text-sm font-bold text-[var(--color-ink-2)]">{labelFor(reading)} · {tempFeel(reading.temp)}</div>
        <p className="mt-3 text-sm text-[var(--color-ink-2)]">{line}</p>
      </Card>
      <div className="mt-5 flex justify-center gap-2">
        <Btn onClick={onAgain}>Measure another</Btn>
        <Link href="/data"><Btn variant="cool">See charts</Btn></Link>
      </div>
    </div>
  );
}
