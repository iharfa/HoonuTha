"use client";
// Client-side store backed by localStorage. Shapes are kept simple so this can
// later be swapped for a real backend (Neon/Supabase) with the same reading fields.
import { useEffect, useState, useCallback } from "react";
import { buildSeed } from "./seed";

const KEY = "hd-data-v3"; // v3: added shade pairs for the per-surface breakdown
let cache = null;

function load() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return (cache = JSON.parse(raw));
  } catch {}
  cache = { readings: buildSeed(), nextId: 1, seeded: true };
  persist();
  return cache;
}
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn("storage full?", e);
  }
  window.dispatchEvent(new Event("hd-change"));
}

export function useStore() {
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    load();
    setReady(true);
    window.addEventListener("hd-change", refresh);
    return () => window.removeEventListener("hd-change", refresh);
  }, [refresh]);
  return { ready, ...api };
}

const readings = () => load().readings;

function addReading({ material, color = null, shade, temp, airTemp = null, place = "", by = "" }) {
  const d = load();
  const id = "HD-" + String(d.nextId++).padStart(3, "0");
  d.readings.unshift({ id, material, color, shade, temp: Number(temp), airTemp: airTemp ? Number(airTemp) : null, place, by, at: Date.now() });
  if (d.seeded) {
    // First real reading: drop the samples so kids see their own data.
    d.readings = d.readings.filter((r) => !String(r.id).startsWith("HD-9"));
    d.seeded = false;
  }
  persist();
  return id;
}

const removeReading = (id) => {
  const d = load();
  d.readings = d.readings.filter((r) => r.id !== id);
  persist();
};

function resetDemo() {
  localStorage.removeItem(KEY);
  cache = null;
  load();
}

function exportCSV() {
  const head = "id,at,material,color,shade,temp_c,air_temp_c,place,by";
  const rows = readings().map((r) =>
    [r.id, new Date(r.at).toISOString(), r.material, r.color || "", r.shade, r.temp, r.airTemp ?? "", JSON.stringify(r.place || ""), JSON.stringify(r.by || "")].join(",")
  );
  return [head, ...rows].join("\n");
}

const api = { readings, addReading, removeReading, resetDemo, exportCSV };
