import { eq } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { mapSettings } from "@/lib/db/mappers";
import { userSettings } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { settingsUpdateSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const rows = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);
    return jsonResponse({
      settings: rows[0] ? mapSettings(rows[0]) : null,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, settingsUpdateSchema);
    const db = getDb();
    const clearPlugin = Object.prototype.hasOwnProperty.call(
      body,
      "activePlugin",
    );

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (body.theme != null) patch.theme = body.theme;
    if (body.accentColor != null) patch.accentColor = body.accentColor;
    if (clearPlugin) patch.activePlugin = body.activePlugin ?? null;
    if (body.emailNotifications !== undefined) {
      patch.emailNotifications = body.emailNotifications;
    }
    if (body.pushNotifications !== undefined) {
      patch.pushNotifications = body.pushNotifications;
    }
    if (body.productUpdates !== undefined) {
      patch.productUpdates = body.productUpdates;
    }
    if (body.profileVisibility != null) {
      patch.profileVisibility = body.profileVisibility;
    }

    await db
      .update(userSettings)
      .set(patch)
      .where(eq(userSettings.userId, user.id));

    const rows = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);

    return jsonResponse({
      settings: rows[0] ? mapSettings(rows[0]) : null,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
