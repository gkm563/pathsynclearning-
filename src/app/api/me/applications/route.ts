import { desc, eq } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { eventApplications } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { applicationCreateSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const rows = await db
      .select({
        eventId: eventApplications.eventId,
        kind: eventApplications.kind,
        createdAt: eventApplications.createdAt,
      })
      .from(eventApplications)
      .where(eq(eventApplications.userId, user.id))
      .orderBy(desc(eventApplications.createdAt));

    const applications = rows.map((r) => ({
      event_id: r.eventId,
      kind: r.kind,
      created_at: r.createdAt,
    }));

    return jsonResponse({
      applications,
      eventIds: applications.filter((r) => r.kind === "event").map((r) => r.event_id),
      ogIds: applications.filter((r) => r.kind === "og").map((r) => r.event_id),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const { eventId, kind } = await parseJson(request, applicationCreateSchema);
    const db = getDb();
    await db
      .insert(eventApplications)
      .values({ userId: user.id, eventId, kind })
      .onConflictDoNothing();

    const rows = await db
      .select({
        eventId: eventApplications.eventId,
        kind: eventApplications.kind,
      })
      .from(eventApplications)
      .where(eq(eventApplications.userId, user.id));

    return jsonResponse({
      ok: true,
      eventIds: rows.filter((r) => r.kind === "event").map((r) => r.eventId),
      ogIds: rows.filter((r) => r.kind === "og").map((r) => r.eventId),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
