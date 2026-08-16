import { eq, sql } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { challengeProgress } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { challengesUpdateSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const rows = await db
      .select({ state: challengeProgress.state })
      .from(challengeProgress)
      .where(eq(challengeProgress.userId, user.id))
      .limit(1);
    return jsonResponse({ state: rows[0]?.state || [] });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, challengesUpdateSchema);
    const db = getDb();
    await db
      .update(challengeProgress)
      .set({
        state: body.state,
        updatedAt: sql`NOW()`,
      })
      .where(eq(challengeProgress.userId, user.id));
    return jsonResponse({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
