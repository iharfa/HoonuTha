// Storage adapter for readings: Neon Postgres when DATABASE_URL is set (a
// shared dataset across every device), otherwise a local JSON file for
// zero-config dev/demo. Mirrors the pattern used across the other RTI apps.
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import { buildSeed } from "./seed";

const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Client-facing reading shape:
// { id, material, color, shade, shadeSource, temp, airTemp, place, by, at(ms) }
const seedRows = () =>
  buildSeed().map((r, i) => ({
    id: i + 1,
    material: r.material,
    color: r.color ?? null,
    shade: r.shade,
    shadeSource: r.shadeSource ?? null,
    temp: r.temp,
    airTemp: r.airTemp ?? null,
    place: r.place ?? "",
    by: r.by ?? "",
    grp: "demo",
    at: r.at,
  }));

// ---------- JSON file mode ----------
const FILE = path.join(process.cwd(), "data", "db.json");

// The demo playground is a registered group so the directory is never empty.
const seedGroup = { id: 1, code: "demo", school: "Hoonu Tha", label: "Demo playground", at: 0 };

function fileDb() {
  if (!fs.existsSync(FILE)) {
    const rows = seedRows();
    const db = { readings: rows, nextId: rows.length + 1, groups: [seedGroup], nextGroupId: 2 };
    try {
      fs.mkdirSync(path.dirname(FILE), { recursive: true });
      fs.writeFileSync(FILE, JSON.stringify(db));
    } catch {} // read-only fs: serve seed read-only
    return db;
  }
  const db = JSON.parse(fs.readFileSync(FILE, "utf8"));
  if (!db.groups) { db.groups = [seedGroup]; db.nextGroupId = 2; } // migrate pre-groups files
  return db;
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
      shade_source text,
      temp real NOT NULL,
      air_temp real,
      place text DEFAULT '',
      by_name text DEFAULT '',
      grp text NOT NULL DEFAULT 'demo',
      at timestamptz NOT NULL DEFAULT now())`;
    // Migrate tables created before shade_source / grp existed.
    await sql`ALTER TABLE readings ADD COLUMN IF NOT EXISTS shade_source text`;
    await sql`ALTER TABLE readings ADD COLUMN IF NOT EXISTS grp text NOT NULL DEFAULT 'demo'`;
    await sql`CREATE TABLE IF NOT EXISTS groups (
      id serial PRIMARY KEY,
      code text UNIQUE NOT NULL,
      school text NOT NULL,
      label text NOT NULL,
      at timestamptz NOT NULL DEFAULT now())`;
    await sql`INSERT INTO groups (code, school, label) VALUES ('demo', 'Hoonu Tha', 'Demo playground') ON CONFLICT (code) DO NOTHING`;
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM readings`;
    if (n === 0) await seedSql(sql);
    ensured = true;
  }
  return sql;
}
async function seedSql(sql) {
  const rows = seedRows().map((r) => ({
    material: r.material, color: r.color, shade: r.shade, shade_source: r.shadeSource,
    temp: r.temp, air_temp: r.airTemp, place: r.place, by_name: r.by, at_ms: r.at,
  }));
  await sql`INSERT INTO readings (material, color, shade, shade_source, temp, air_temp, place, by_name, grp, at)
    SELECT material, color, shade, shade_source, temp, air_temp, place, by_name, 'demo', to_timestamp(at_ms / 1000.0)
    FROM jsonb_to_recordset(${JSON.stringify(rows)}::jsonb)
    AS x(material text, color text, shade text, shade_source text, temp real, air_temp real, place text, by_name text, at_ms bigint)`;
}
const fromPg = (row) => ({
  id: row.id, material: row.material, color: row.color, shade: row.shade,
  shadeSource: row.shade_source, temp: row.temp, airTemp: row.air_temp,
  place: row.place || "", by: row.by_name || "", at: new Date(row.at).getTime(),
});

// ---------- public API ----------
// Every operation is scoped to a group code (see lib/group.js). "demo" is the
// out-of-the-box shared playground that holds the seed data.
export async function listReadings(grp = "demo") {
  if (!url()) return fileDb().readings.filter((r) => (r.grp || "demo") === grp).sort((a, b) => b.at - a.at);
  const sql = await pg();
  const rows = await sql`SELECT * FROM readings WHERE grp = ${grp} ORDER BY at DESC, id DESC`;
  return rows.map(fromPg);
}

export async function addReading(r, grp = "demo") {
  const rec = {
    material: r.material, color: r.color ?? null, shade: r.shade,
    shadeSource: r.shadeSource ?? null,
    temp: Number(r.temp), airTemp: r.airTemp != null && r.airTemp !== "" ? Number(r.airTemp) : null,
    place: r.place || "", by: r.by || "", grp,
  };
  if (!url()) {
    const db = fileDb();
    const row = { id: db.nextId++, ...rec, at: Date.now() };
    db.readings.push(row);
    saveFile(db);
    return row;
  }
  const sql = await pg();
  const [row] = await sql`INSERT INTO readings (material, color, shade, shade_source, temp, air_temp, place, by_name, grp)
    VALUES (${rec.material}, ${rec.color}, ${rec.shade}, ${rec.shadeSource}, ${rec.temp}, ${rec.airTemp}, ${rec.place}, ${rec.by}, ${grp})
    RETURNING *`;
  return fromPg(row);
}

export async function deleteReading(id, grp = "demo") {
  if (!url()) {
    const db = fileDb();
    db.readings = db.readings.filter((r) => !(r.id === id && (r.grp || "demo") === grp));
    saveFile(db);
    return;
  }
  const sql = await pg();
  await sql`DELETE FROM readings WHERE id = ${id} AND grp = ${grp}`;
}

// ---------- groups (registered classes / clubs, shown in the public directory) ----------
// Ad-hoc codes still work for logging; registering just lists the group publicly.
export async function listGroups() {
  if (!url()) {
    const db = fileDb();
    return db.groups
      .map((g) => ({ ...g, count: db.readings.filter((r) => (r.grp || "demo") === g.code).length }))
      .sort((a, b) => a.school.localeCompare(b.school) || a.label.localeCompare(b.label));
  }
  const sql = await pg();
  const rows = await sql`SELECT g.id, g.code, g.school, g.label, g.at, count(r.id)::int AS count
    FROM groups g LEFT JOIN readings r ON r.grp = g.code
    GROUP BY g.id ORDER BY g.school, g.label`;
  return rows.map((g) => ({ ...g, at: new Date(g.at).getTime() }));
}

// Returns the new group, or null if the code is already taken.
export async function createGroup({ code, school, label }) {
  if (!url()) {
    const db = fileDb();
    if (db.groups.some((g) => g.code === code)) return null;
    const row = { id: db.nextGroupId++, code, school, label, at: Date.now() };
    db.groups.push(row);
    saveFile(db);
    return row;
  }
  const sql = await pg();
  const [row] = await sql`INSERT INTO groups (code, school, label) VALUES (${code}, ${school}, ${label})
    ON CONFLICT (code) DO NOTHING RETURNING *`;
  return row ? { ...row, at: new Date(row.at).getTime() } : null;
}

// Resolve a public numeric id to its group (browse pages address groups by id
// so the directory never exposes join codes, which double as write access).
export async function groupById(id) {
  if (!url()) return fileDb().groups.find((g) => g.id === id) || null;
  const sql = await pg();
  const [row] = await sql`SELECT * FROM groups WHERE id = ${id}`;
  return row || null;
}

// Clears the group's readings; the demo group gets reseeded with samples.
export async function resetReadings(grp = "demo") {
  if (!url()) {
    const db = fileDb();
    db.readings = db.readings.filter((r) => (r.grp || "demo") !== grp);
    if (grp === "demo") db.readings.push(...seedRows().map((r) => ({ ...r, id: db.nextId++ })));
    saveFile(db);
    return listReadings(grp);
  }
  const sql = await pg();
  await sql`DELETE FROM readings WHERE grp = ${grp}`;
  if (grp === "demo") await seedSql(sql);
  return listReadings(grp);
}
