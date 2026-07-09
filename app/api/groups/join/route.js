import { groupByPin } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Resolve a 4-digit join code to the group a student is joining. Returns the
// slug code (needed to scope the student's readings) plus the display name.
export async function GET(request) {
  try {
    const pin = new URL(request.url).searchParams.get("pin");
    const g = await groupByPin(pin);
    if (!g) return Response.json({ error: "No group has that code. Check the 4 digits with your teacher." }, { status: 404 });
    return Response.json({ code: g.code, label: g.label, school: g.school });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
