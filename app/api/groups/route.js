import { listGroups, createGroup } from "@/lib/db";
import { norm } from "@/lib/group";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public directory: registered groups with reading counts. Join codes are
// deliberately stripped — a code is also write/reset access to that group.
export async function GET() {
  try {
    const groups = await listGroups();
    return Response.json(groups.map(({ code, ...pub }) => pub));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const school = String(body?.school || "").trim().slice(0, 60);
    const label = String(body?.label || "").trim().slice(0, 60);
    if (!school || !label) return Response.json({ error: "school and label are required" }, { status: 400 });
    const code = norm(`${school} ${label}`);
    if (code.length < 3) return Response.json({ error: "name is too short" }, { status: 400 });
    const row = await createGroup({ code, school, label });
    if (!row) return Response.json({ error: "That code is already taken — tweak the class or group name." }, { status: 409 });
    return Response.json(row, { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
