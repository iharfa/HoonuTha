"use client";
// Live ambient air temperature for the Maldives, used as the baseline that
// surface temperatures are compared against. Fetched from Open-Meteo (free, no
// key, CORS-friendly) and cached in localStorage so it updates only ONCE PER
// DAY. Falls back to AMBIENT (a sensible default) when offline or on error.
import { useEffect, useState } from "react";
import { AMBIENT } from "./data";

const KEY = "hd-ambient";
// Malé, Maldives. We use today's forecast maximum air temperature — the hot
// part of the day, which is when surfaces are hottest and worth measuring.
const URL =
  "https://api.open-meteo.com/v1/forecast?latitude=4.1755&longitude=73.5093" +
  "&daily=temperature_2m_max&timezone=auto&forecast_days=1";

const today = () => new Date().toISOString().slice(0, 10);

function cached() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (v && v.date === today() && typeof v.temp === "number") return v;
  } catch {}
  return null;
}

export function useAmbient() {
  const [temp, setTemp] = useState(AMBIENT);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const hit = cached();
    if (hit) {
      setTemp(hit.temp);
      setLive(true);
      return;
    }
    let ok = true;
    fetch(URL)
      .then((r) => r.json())
      .then((d) => {
        const t = Math.round(d?.daily?.temperature_2m_max?.[0]);
        if (!ok || !Number.isFinite(t)) return;
        localStorage.setItem(KEY, JSON.stringify({ date: today(), temp: t }));
        setTemp(t);
        setLive(true);
      })
      .catch(() => {}); // offline → keep the default
    return () => { ok = false; };
  }, []);

  // `live` = we have a real reading for the Maldives today (vs the fallback).
  return { temp, live };
}
