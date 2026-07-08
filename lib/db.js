// Storage adapter for readings: Neon Postgres when DATABASE_URL is set (a
// shared dataset across every device), otherwise a local JSON file for
// zero-config dev/demo. Mirrors the pattern used across the other RTI apps.
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import { buildSeed } from "./seed";

const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Client-facing reading shape: { id, material, color, shade, temp, airTemp, place, by, at(ms) }
const seedRows = () =>
  buildSeed().map((r, i) => ({
    id: i + 1,
    material: r.material,
    color: r.color ?? null,
    shade: r.shade,
    temp: r.temp,
    airTemp: r.airTemp ?? null,
    place: r.place ?? "",
    by: r.by ?? "",
    at: r.at,
  }));

// ---------- JSON file mode ----------
const FILE = path.join(process.cwd(), "data", "db.json");

function fileDb() {
  if (!fs.existsSync(FILE)) {
    const rows = seedRows();
    const db = { readings: rows, nextId: rows.length + 1 };
    try {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      fs.writeFileSync(FILE, JSON.stringify(db));
    } catch {} // read-only fs: serve seed read-only
    return db;
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}
const saveFile = (db) => {
  try { fs.writeFileSync(FILE, JSON.stringify(db)); } catch {}
};

// ---------- Neon mode ----------
let ensured = false;
async function pg() {
  const sql = neon(url());
  if (!ensured) {
    await sql`CREATE TABLE IF NOT EXISTS readings (
      id serial PRIMARY KEY,
      material text NOT NULL,
      color text,
      shade text NOT NULL,
      temp real NOT NULL,
      air_temp real,
      place text DEFAULT '',
      by_name text DEFAULT '',
      at timestamptz NOT NULL DEFAULT now())`;
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM readings`;
    if (n === 0) await seedSql(sql);
    ensured = true;
  }
  return sql;
}
async function seedSql(sql) {
  const rows = seedRows();
  await sql`INSERT INTO readings (material, color, shade, temp, air_temp, place, by_name, at)
    SELECT material, color, shade, temp, air_temp, place, by_name, to_timestamp(at_ms / 1000.0)
    FROM jsonb_to_recordset(${JSON.stringify(rows.map((r) => ({
      material: r.material, color: r.color, shade: r.shade, temp: r.temp,
      air_temp: r.airTemp, place: r.place, by_name: r.by, at_ms: r.at,
    })))}::jsonb)
    AS x(material text, color text, shade text, temp real, air_temp real, place text, by_name text, at_ms bigint)`;
}
const fromPg = (row) => ({
  id: row.id, material: row.material, color: row.color, shade: row.shade,
  temp: row.temp, airTemp: row.air_temp, place: row.place || "", by: row.by_name || "",
  at: new Date(row.at).getTime(),
});

// ---------- public API ----------
export async function listReadings() {
  if (!url()) return fileDb().readings.slice().sort((a, b) => b.at - a.at);
  const sql = await pg();
  const rows = await sql`SELECT * FROM readings ORDER BY at DESC, id DESC`;
  return rows.map(fromPg);
}

export async function addReading(r) {
  const rec = {
    material: r.material, color: r.color ?? null, shade: r.shade,
    temp: Number(r.temp), airTemp: r.airTemp != null && r.airTemp !== "" ? Number(r.airTemp) : null,
    place: r.place || "", by: r.by || "",
  };
  if (!url()) {
    const db = fileDb();
    const row = { id: db.nextId++, ...rec, at: Date.now() };
    db.readings.push(row);
    saveFile(db);
    return row;
  }
  const sql = await pg();
  const [row] = await sql`INSERT INTO readings (material, color, shade, temp, air_temp, place, by_name)
    VALUES (${rec.material}, ${rec.color}, ${rec.shade}, ${rec.temp}, ${rec.airTemp}, ${rec.place}, ${rec.by})
    RETURNING *`;
  return fromPg(row);
}

export async function deleteReading(id) {
  if (!url()) {
    const db = fileDb();
    db.readings = db.readings.filter((r) => r.id !== id);
    saveFile(db);
    return;
  }
  const sql = await pg();
  await sql`DELETE FROM readings WHERE id = ${id}`;
}

export async function resetReadings() {
  if (!url()) {
    if (fs.existsSync(FILE)) { try { fs.rmSync(FILE); } catch {} }
    fileDb();
    return listReadings();
  }
  const sql = await pg();
  await sql`TRUNCATE readings RESTART IDENTITY`;
  await seedSql(sql);
  return listReadings();
}
