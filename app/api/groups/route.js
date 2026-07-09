import { listGroups, createGroup, updateGroup, deleteGroup } from "@/lib/db";
import { norm } from "@/lib/group";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin = whoever knows ADMIN_KEY (set it in Vercel env vars / .env.local).
const isAdmin = (key) => !!process.env.ADMIN_KEY && key === process.env.ADMIN_KEY;

// Public directory: approved groups only, with contact details and join codes
// (slug + 4-digit pin) stripped — those double as write/reset access.
export async function GET(request) {
  try {
    const key = new URL(request.url).searchParams.get("key");
    if (key != null) {
      if (!isAdmin(key)) return Response.json({ error: "wrong key" }, { status: 403 });
      return Response.json(await listGroups(true)); // everything, incl. pending + phones + codes + pins
    }
    const groups = await listGroups();
    return Response.json(groups.map(({ code, pin, phone, contact, status, ...pub }) => pub));
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

// Admin: approve, rename (school / class name), or otherwise change status.
export async function PATCH(request) {
  try {
    const body = await request.json();
    if (!isAdmin(body?.key)) return Response.json({ error: "wrong key" }, { status: 403 });
    const fields = {};
    if (body.action === "approve") fields.status = "approved";
    if (typeof body.school === "string") fields.school = body.school.trim().slice(0, 60);
    if (typeof body.label === "string") fields.label = body.label.trim().slice(0, 60);
    if (typeof body.status === "string" && ["approved", "pending"].includes(body.status)) fields.status = body.status;
    if ((fields.school !== undefined && !fields.school) || (fields.label !== undefined && !fields.label))
      return Response.json({ error: "school and class name can't be empty" }, { status: 400 });
    if (!Object.keys(fields).length) return Response.json({ error: "nothing to update" }, { status: 400 });
    const row = await updateGroup(Number(body?.id), fields);
    if (!row) return Response.json({ error: "group not found" }, { status: 404 });
    return Response.json(row);
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

// Admin: delete a group and all its readings (the demo playground is protected).
export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!isAdmin(body?.key)) return Response.json({ error: "wrong key" }, { status: 403 });
    const ok = await deleteGroup(Number(body?.id));
    if (!ok) return Response.json({ error: "can't delete this group" }, { status: 400 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
