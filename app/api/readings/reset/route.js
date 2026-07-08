import { resetReadings } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    return Response.json(await resetReadings());
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
