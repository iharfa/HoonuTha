import { listReadings, addReading, deleteReading } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await listReadings());
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body?.material || !body?.shade || body?.temp == null)
      return Response.json({ error: "material, shade and temp are required" }, { status: 400 });
    return Response.json(await addReading(body), { status: 201 });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "id required" }, { status: 400 });
    await deleteReading(id);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
