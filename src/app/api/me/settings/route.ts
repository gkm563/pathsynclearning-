import { getDb } from "@/lib/db/client";
import { requireDbUser, jsonResponse, errorResponse } from "@/lib/db/users";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const settings = await db`SELECT * FROM user_settings WHERE user_id = ${user.id}::uuid LIMIT 1`;
    return jsonResponse({ settings: settings[0] });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const db = getDb();
    const clearPlugin = Object.prototype.hasOwnProperty.call(body, "activePlugin");
    await db`
      UPDATE user_settings SET
        theme = COALESCE(${body.theme ?? null}, theme),
        accent_color = COALESCE(${body.accentColor ?? null}, accent_color),
        plan = COALESCE(${body.plan ?? null}, plan),
        active_plugin = CASE
          WHEN ${clearPlugin} THEN ${body.activePlugin ?? null}
          ELSE active_plugin
        END,
        updated_at = NOW()
      WHERE user_id = ${user.id}::uuid
    `;
    const settings = await db`SELECT * FROM user_settings WHERE user_id = ${user.id}::uuid LIMIT 1`;
    return jsonResponse({ settings: settings[0] });
  } catch (e) {
    return errorResponse(e);
  }
}
