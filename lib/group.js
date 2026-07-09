// Group code = the whole multi-tenancy story. A teacher invents a code
// ("grade7b", "male-scouts"), shares it (or a ?group= link/QR), and every
// reading is tagged + filtered by it. No accounts, no passwords.
// ponytail: honor-system codes; add a teacher PIN per group if abuse ever shows up.

export const DEMO = "demo";

// Normalize so "Grade 7B" on the whiteboard and "grade 7b" typed by a kid land
// in the same bucket.
export const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "").slice(0, 40);

export function getGroup() {
  try { return localStorage.getItem("hd-group") || DEMO; } catch { return DEMO; }
}

export function setGroup(g) {
  try { localStorage.setItem("hd-group", norm(g) || DEMO); } catch {}
}
