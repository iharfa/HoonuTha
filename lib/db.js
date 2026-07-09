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
const seedGroup = { id: 1, code: "demo", school: "Hoonu Tha", label: "Demo playground", contact: "", phone: "", status: "approved", at: 0 };

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
  db.groups.forEach((g) => { g.status ||= "approved"; g.phone ||= ""; g.contact ||= ""; }); // groups from before approvals
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
    await sql`ALTER TABLE readings ADD COLUMN IF NOT EXISTS lat real`;
    await sql`ALTER TABLE readings ADD COLUMN IF NOT EXISTS lon real`;
    await sql`CREATE TABLE IF NOT EXISTS groups (
      id serial PRIMARY KEY,
      code text UNIQUE NOT NULL,
      school text NOT NULL,
      label text NOT NULL,
      contact text NOT NULL DEFAULT '',
      phone text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'pending',
      at timestamptz NOT NULL DEFAULT now())`;
    // Groups created before the approval flow existed count as approved.
    await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS contact text NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT ''`;
    await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved'`;
    await sql`INSERT INTO groups (code, school, label, status) VALUES ('demo', 'Hoonu Tha', 'Demo playground', 'approved') ON CONFLICT (code) DO NOTHING`;
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
  place: row.place || "", by: row.by_name || "", lat: row.lat ?? null, lon: row.lon ?? null,
  at: new Date(row.at).getTime(),
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

// Reject junk coordinates at the trust boundary; null is fine (GPS denied).
const coord = (v, max) => (Number.isFinite(Number(v)) && Math.abs(Number(v)) <= max && v !== null && v !== "" ? Number(v) : null);

export async function addReading(r, grp = "demo") {
  const rec = {
    material: r.material, color: r.color ?? null, shade: r.shade,
    shadeSource: r.shadeSource ?? null,
    temp: Number(r.temp), airTemp: r.airTemp != null && r.airTemp !== "" ? Number(r.airTemp) : null,
    place: r.place || "", by: r.by || "", lat: coord(r.lat, 90), lon: coord(r.lon, 180), grp,
  };
  if (!url()) {
    const db = fileDb();
    const row = { id: db.nextId++, ...rec, at: Date.now() };
    db.readings.push(row);
    saveFile(db);
    return row;
  }
  const sql = await pg();
  const [row] = await sql`INSERT INTO readings (material, color, shade, shade_source, temp, air_temp, place, by_name, lat, lon, grp)
    VALUES (${rec.material}, ${rec.color}, ${rec.shade}, ${rec.shadeSource}, ${rec.temp}, ${rec.airTemp}, ${rec.place}, ${rec.by}, ${rec.lat}, ${rec.lon}, ${grp})
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

// ---------- groups (classes / clubs; requests are approved by the admin) ----------
// Ad-hoc codes still work for logging; only approved groups are listed publicly.
export async function listGroups(all = false) {
  if (!url()) {
    const db = fileDb();
    return db.groups
      .filter((g) => all || g.status === "approved")
      .map((g) => ({ ...g, count: db.readings.filter((r) => (r.grp || "demo") === g.code).length }))
      .sort((a, b) => a.school.localeCompare(b.school) || a.label.localeCompare(b.label));
  }
  const sql = await pg();
  const rows = await sql`SELECT g.*, count(r.id)::int AS count
    FROM groups g LEFT JOIN readings r ON r.grp = g.code
    WHERE ${all} OR g.status = 'approved'
    GROUP BY g.id ORDER BY g.status DESC, g.school, g.label`;
  return rows.map((g) => ({ ...g, at: new Date(g.at).getTime() }));
}

// Files a pending request. Returns the new group, or null if the code is taken.
export async function createGroup({ code, school, label, contact, phone }) {
  if (!url()) {
    const db = fileDb();
    if (db.groups.some((g) => g.code === code)) return null;
    const row = { id: db.nextGroupId++, code, school, label, contact, phone, status: "pending", at: Date.now() };
    db.groups.push(row);
    saveFile(db);
    return row;
  }
  const sql = await pg();
  const [row] = await sql`INSERT INTO groups (code, school, label, contact, phone, status)
    VALUES (${code}, ${school}, ${label}, ${contact}, ${phone}, 'pending')
    ON CONFLICT (code) DO NOTHING RETURNING *`;
  return row ? { ...row, at: new Date(row.at).getTime() } : null;
}

export async function approveGroup(id) {
  if (!url()) {
    const db = fileDb();
    const g = db.groups.find((x) => x.id === id);
    if (g) { g.status = "approved"; saveFile(db); }
    return g || null;
  }
  const sql = await pg();
  const [row] = await sql`UPDATE groups SET status = 'approved' WHERE id = ${id} RETURNING *`;
  return row || null;
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
