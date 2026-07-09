import { listReadings, addReading, deleteReading, groupById } from "@/lib/db";
import { norm, DEMO } from "@/lib/group";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const grpOf = (raw) => norm(raw) || DEMO;

export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;
    const gid = Number(params.get("gid"));
    if (gid) {
      // Read-only browse path: numeric directory id instead of the join code.
      const g = await groupById(gid);
      if (!g) return Response.json({ error: "group not found" }, { status: 404 });
      return Response.json(await listReadings(g.code));
    }
    return Response.json(await listReadings(grpOf(params.get("group"))));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body?.material || !body?.shade || body?.temp == null)
      return Response.json({ error: "material, shade and temp are required" }, { status: 400 });
    return Response.json(await addReading(body, grpOf(body.group)), { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const params = new URL(request.url).searchParams;
    const id = Number(params.get("id"));
    if (!id) return Response.json({ error: "id required" }, { status: 400 });
    await deleteReading(id, grpOf(params.get("group")));
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
