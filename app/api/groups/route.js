import { listGroups, createGroup, approveGroup } from "@/lib/db";
import { norm } from "@/lib/group";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin = whoever knows ADMIN_KEY (set it in Vercel env vars / .env.local).
const isAdmin = (key) => !!process.env.ADMIN_KEY && key === process.env.ADMIN_KEY;

// Public directory: approved groups only, with contact details and join codes
// stripped — a code is also write/reset access to that group.
export async function GET(request) {
  try {
    const key = new URL(request.url).searchParams.get("key");
    if (key != null) {
      if (!isAdmin(key)) return Response.json({ error: "wrong key" }, { status: 403 });
      return Response.json(await listGroups(true)); // everything, incl. pending + phones + codes
    }
    const groups = await listGroups();
    return Response.json(groups.map(({ code, phone, contact, status, ...pub }) => pub));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

// A teacher's request: stored as pending, join code NOT revealed — the admin
// approves and gets in touch to hand over the code and do a run-through.
export async function POST(request) {
  try {
    const body = await request.json();
    const field = (k, len) => String(body?.[k] || "").trim().slice(0, len);
    const school = field("school", 60);
    const label = field("label", 60);
    const contact = field("contact", 60);
    const phone = field("phone", 20);
    if (!school || !label || !contact || !phone)
      return Response.json({ error: "school, class/group name, your name and phone are all required" }, { status: 400 });
    if (phone.replace(/\D/g, "").length < 7)
      return Response.json({ error: "that phone number looks too short" }, { status: 400 });
    const code = norm(`${school} ${label}`);
    if (code.length < 3) return Response.json({ error: "name is too short" }, { status: 400 });
    const row = await createGroup({ code, school, label, contact, phone });
    if (!row) return Response.json({ error: "A group with this school and name already exists — tweak the class or group name." }, { status: 409 });
    return Response.json({ ok: true, id: row.id }, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (!isAdmin(body?.key)) return Response.json({ error: "wrong key" }, { status: 403 });
    const row = await approveGroup(Number(body?.id));
    if (!row) return Response.json({ error: "group not found" }, { status: 404 });
    return Response.json(row);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
