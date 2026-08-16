import { getDb } from "@/lib/db/client";
import { requireDbUser, jsonResponse, errorResponse } from "@/lib/db/users";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const rows = await db`SELECT state FROM challenge_progress WHERE user_id = ${user.id}::uuid LIMIT 1`;
    return jsonResponse({ state: rows[0]?.state || [] });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const db = getDb();
    await db`
      UPDATE challenge_progress SET
        state = ${JSON.stringify(body.state || [])}::jsonb,
        updated_at = NOW()
      WHERE user_id = ${user.id}::uuid
    `;
    return jsonResponse({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
