import { getDb } from "@/lib/db/client";
import { requireDbUser, jsonResponse, errorResponse } from "@/lib/db/users";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const rows = await db`
      SELECT id, payload, created_at
      FROM memory_lane_entries
      WHERE user_id = ${user.id}::uuid
      ORDER BY created_at DESC
      LIMIT 200
    `;
    return jsonResponse({
      entries: rows.map((r) => ({
        id: r.id,
        ...(typeof r.payload === "object" ? r.payload : { data: r.payload }),
        createdAt: r.created_at,
      })),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const db = getDb();
    const inserted = await db`
      INSERT INTO memory_lane_entries (user_id, payload)
      VALUES (${user.id}::uuid, ${JSON.stringify(body.payload || body)}::jsonb)
      RETURNING id, payload, created_at
    `;
    return jsonResponse({ entry: inserted[0] });
  } catch (e) {
    return errorResponse(e);
  }
}
