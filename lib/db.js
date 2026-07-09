// Storage adapter for readings: Neon Postgres when DATABASE_URL is set (a
// shared dataset across every device), otherwise a local JSON file for
// zero-config dev/demo. Mirrors the pattern used across the other RTI apps.
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";
import { buildSeed } from "./seed";

const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL;

// 4-digit join code teachers hand out (1000–9999, no leading-zero ambiguity).
const genPin = () => String(Math.floor(1000 + Math.random() * 9000));

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
  // Backfill 4-digit join codes for groups made before pins existed (skip demo).
  const used = new Set(db.groups.map((g) => g.pin).filter(Boolean));
  let changed = false;
  for (const g of db.groups) if (!g.pin && g.code !== "demo") { g.pin = filePin(used); used.add(g.pin); changed = true; }
  if (changed) saveFile(db);
  return db;
}
const filePin = (used) => { let p; do { p = genPin(); } while (used.has(p)); return p; };
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
    await sql`ALTER TABLE groups ADD COLUMN IF NOT EXISTS pin text`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS groups_pin_key ON groups(pin)`;
    await sql`INSERT INTO groups (code, school, label, status) VALUES ('demo', 'Hoonu Tha', 'Demo playground', 'approved') ON CONFLICT (code) DO NOTHING`;
    // Backfill 4-digit join codes for groups made before pins existed (skip demo).
    for (const g of await sql`SELECT id FROM groups WHERE pin IS NULL AND code <> 'demo'`)
      await sql`UPDATE groups SET pin = ${await uniquePin(sql)} WHERE id = ${g.id}`;
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

// Every reading from every group — the "global" view for users not in a group.
export async function listAllReadings() {
  if (!url()) return fileDb().readings.slice().sort((a, b) => b.at - a.at);
  const sql = await pg();
  const rows = await sql`SELECT * FROM readings ORDER BY at DESC, id DESC`;
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

// Find a free 4-digit pin (Neon).
async function uniquePin(sql) {
  for (let i = 0; i < 60; i++) {
    const p = genPin();
    const [x] = await sql`SELECT 1 FROM groups WHERE pin = ${p}`;
    if (!x) return p;
  }
  return genPin();
}

// Files a pending request. Returns the new group (incl. its pin), or null if
// the code is taken.
export async function createGroup({ code, school, label, contact, phone }) {
  if (!url()) {
    const db = fileDb();
    if (db.groups.some((g) => g.code === code)) return null;
    const pin = filePin(new Set(db.groups.map((g) => g.pin).filter(Boolean)));
    const row = { id: db.nextGroupId++, code, school, label, contact, phone, status: "pending", pin, at: Date.now() };
    db.groups.push(row);
    saveFile(db);
    return row;
  }
  const sql = await pg();
  const pin = await uniquePin(sql);
  const [row] = await sql`INSERT INTO groups (code, school, label, contact, phone, status, pin)
    VALUES (${code}, ${school}, ${label}, ${contact}, ${phone}, 'pending', ${pin})
    ON CONFLICT (code) DO NOTHING RETURNING *`;
  return row ? { ...row, at: new Date(row.at).getTime() } : null;
}

// Admin edit: update any of school / label / status. The code (scoping key +
// join identity) never changes, so joined devices and tagged readings survive.
export async function updateGroup(id, { school, label, status }) {
  if (!url()) {
    const db = fileDb();
    const g = db.groups.find((x) => x.id === id);
    if (!g) return null;
    if (school != null) g.school = school;
    if (label != null) g.label = label;
    if (status != null) g.status = status;
    saveFile(db);
    return g;
  }
  const sql = await pg();
  const [row] = await sql`UPDATE groups SET
      school = COALESCE(${school ?? null}, school),
      label = COALESCE(${label ?? null}, label),
      status = COALESCE(${status ?? null}, status)
    WHERE id = ${id} RETURNING *`;
  return row || null;
}

// Admin delete: removes the group and all its readings. The demo playground is
// protected so the app always has a default dataset.
export async function deleteGroup(id) {
  if (!url()) {
    const db = fileDb();
    const g = db.groups.find((x) => x.id === id);
    if (!g || g.code === "demo") return false;
    db.groups = db.groups.filter((x) => x.id !== id);
    db.readings = db.readings.filter((r) => (r.grp || "demo") !== g.code);
    saveFile(db);
    return true;
  }
  const sql = await pg();
  const [g] = await sql`SELECT code FROM groups WHERE id = ${id}`;
  if (!g || g.code === "demo") return false;
  await sql`DELETE FROM readings WHERE grp = ${g.code}`;
  await sql`DELETE FROM groups WHERE id = ${id}`;
  return true;
}

// Resolve a 4-digit join code to its (approved) group, so students join with
// the pin instead of the internal slug.
export async function groupByPin(pin) {
  const p = String(pin ?? "").trim();
  if (!/^\d{4}$/.test(p)) return null;
  if (!url()) return fileDb().groups.find((g) => g.pin === p && g.status === "approved") || null;
  const sql = await pg();
  const [row] = await sql`SELECT * FROM groups WHERE pin = ${p} AND status = 'approved'`;
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
