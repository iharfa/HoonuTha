import { resetReadings } from "@/lib/db";
import { norm, DEMO } from "@/lib/group";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    return Response.json(await resetReadings(norm(body?.group) || DEMO));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
