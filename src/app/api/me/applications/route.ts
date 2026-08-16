import { getDb } from "@/lib/db/client";
import { requireDbUser, jsonResponse, errorResponse } from "@/lib/db/users";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const rows = await db`
      SELECT event_id, kind, created_at
      FROM event_applications
      WHERE user_id = ${user.id}::uuid
      ORDER BY created_at DESC
    `;
    return jsonResponse({
      applications: rows,
      eventIds: rows.filter((r) => r.kind === "event").map((r) => r.event_id),
      ogIds: rows.filter((r) => r.kind === "og").map((r) => r.event_id),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const eventId = body.eventId as string;
    const kind = (body.kind === "og" ? "og" : "event") as "event" | "og";
    if (!eventId) {
      return jsonResponse({ error: "eventId required" }, 400);
    }
    const db = getDb();
    await db`
      INSERT INTO event_applications (user_id, event_id, kind)
      VALUES (${user.id}::uuid, ${eventId}, ${kind})
      ON CONFLICT (user_id, event_id, kind) DO NOTHING
    `;
    const rows = await db`
      SELECT event_id, kind FROM event_applications WHERE user_id = ${user.id}::uuid
    `;
    return jsonResponse({
      ok: true,
      eventIds: rows.filter((r) => r.kind === "event").map((r) => r.event_id),
      ogIds: rows.filter((r) => r.kind === "og").map((r) => r.event_id),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
