"use client";
// Client store backed by the /api/readings endpoint (shared Neon DB, or the
// JSON-file fallback in dev). Readings are cached in localStorage so the app
// works offline, and any reading made while offline is queued and synced when
// the connection returns. The getter interface stays synchronous + optimistic.
import { useEffect, useState, useCallback } from "react";
import { getGroup } from "@/lib/group";

const CACHE = () => `hd-cache-v1:${getGroup()}`; // last known list from the server, per group
const QUEUE = "hd-queue-v1"; // readings created offline, awaiting sync (payload carries its group)
const H = { "content-type": "application/json" };

let list = null; // composed list (pending + server), null until first load
let queue = []; // [{ reading, payload }]
let ready = false;
let tmpId = -1; // negative ids mark unsynced local readings

const emit = () => window.dispatchEvent(new Event("hd-change"));

// Only queued readings for the current group show up in the list; readings
// queued under another group still sync, they just aren't displayed here.
const pendingHere = () => queue.filter((q) => (q.payload.group || "demo") === getGroup()).map((q) => q.reading);

function saveLocal() {
  try {
    localStorage.setItem(CACHE(), JSON.stringify((list || []).filter((r) => r.id > 0)));
    localStorage.setItem(QUEUE, JSON.stringify(queue));
  } catch {}
}
function loadLocal() {
  let cache = [];
  try { cache = JSON.parse(localStorage.getItem(CACHE()) || "[]"); } catch {}
  try { queue = JSON.parse(localStorage.getItem(QUEUE) || "[]"); } catch {}
  if (!Array.isArray(cache)) cache = [];
  if (!Array.isArray(queue)) queue = [];
  list = [...pendingHere(), ...cache];
  ready = true;
}

// Fetch the server list and flush any queued (offline) readings.
async function sync() {
  const listUrl = () => `/api/readings?group=${encodeURIComponent(getGroup())}`;
  let server;
  try {
    const r = await fetch(listUrl(), { cache: "no-store" });
    server = r.ok ? await r.json() : null;
  } catch { server = null; }
  if (!Array.isArray(server)) { ready = true; emit(); return; } // offline: keep cache

  if (queue.length) {
    const remaining = [];
    for (const item of queue) {
      try {
        const res = await fetch("/api/readings", { method: "POST", headers: H, body: JSON.stringify(item.payload) });
        if (!res.ok) throw new Error();
      } catch { remaining.push(item); }
    }
    const changed = remaining.length !== queue.length;
    queue = remaining;
    if (changed) {
      try { const r = await fetch(listUrl(), { cache: "no-store" }); if (r.ok) server = await r.json(); } catch {}
    }
  }
  list = [...pendingHere(), ...server];
  ready = true;
  saveLocal();
  emit();
}

export function useStore() {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    if (list === null) { loadLocal(); sync(); }
    window.addEventListener("hd-change", rerender);
    window.addEventListener("online", sync);
    return () => {
      window.removeEventListener("hd-change", rerender);
      window.removeEventListener("online", sync);
    };
  }, [rerender]);
  return { ready, readings, addReading, removeReading, resetDemo };
}

const readings = () => list || [];

function addReading({ material, color = null, shade, shadeSource = null, temp, airTemp = null, ambient = null, place = "", by = "", lat = null, lon = null }) {
  // at = measurement time, captured now on the device so offline readings keep
  // their real time when they sync later (the server clamps it, not overrides).
  const payload = { material, color, shade, shadeSource, temp: Number(temp), airTemp: airTemp ? Number(airTemp) : null, ambient: ambient != null ? Number(ambient) : null, place, by, lat, lon, at: Date.now(), group: getGroup() };
  const reading = { id: tmpId--, ...payload, _pending: true };
  list = [reading, ...(list || [])];
  queue.push({ reading, payload });
  saveLocal();
  emit();
  sync(); // fire-and-forget; replaces the temp row with the server one
  return reading.id;
}

function removeReading(id) {
  list = (list || []).filter((r) => r.id !== id);
  if (id < 0) queue = queue.filter((q) => q.reading.id !== id);
  else fetch(`/api/readings?id=${id}&group=${encodeURIComponent(getGroup())}`, { method: "DELETE" }).catch(() => {});
  saveLocal();
  emit();
}

function resetDemo() {
  fetch("/api/readings/reset", { method: "POST", headers: H, body: JSON.stringify({ group: getGroup() }) })
    .then((r) => r.json())
    .then((server) => { if (Array.isArray(server)) { queue = queue.filter((q) => (q.payload.group || "demo") !== getGroup()); list = server; ready = true; saveLocal(); emit(); } })
    .catch(() => {});
}
