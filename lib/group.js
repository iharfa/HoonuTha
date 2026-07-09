// Group = the multi-tenancy story. Students join a class/club with the 4-digit
// code their teacher hands out; every reading is then tagged + filtered by that
// group's slug. Not joined = the shared "demo" pool, and a global data view.
// ponytail: honor-system codes; the 4-digit pin is the only join gate.

export const DEMO = "demo";

// Normalize a slug code so it always lands in the same bucket.
export const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "").slice(0, 40);

export function getGroup() {
  try { return localStorage.getItem("hd-group") || DEMO; } catch { return DEMO; }
}

// Friendly name ("Grade 7B · Ameeniyya School") shown once joined.
export function getGroupName() {
  try { return localStorage.getItem("hd-group-name") || ""; } catch { return ""; }
}

// True once the device has joined a real class/group (not the demo pool).
export function isJoined() {
  return getGroup() !== DEMO;
}

export function joinGroup(code, name) {
  try {
    localStorage.setItem("hd-group", norm(code) || DEMO);
    if (name) localStorage.setItem("hd-group-name", name);
  } catch {}
}

export function leaveGroup() {
  try {
    localStorage.removeItem("hd-group");
    localStorage.removeItem("hd-group-name");
  } catch {}
}

// Kept for the ?group= share-link path (joins by slug, no friendly name).
export function setGroup(g) {
  try { localStorage.setItem("hd-group", norm(g) || DEMO); } catch {}
}
