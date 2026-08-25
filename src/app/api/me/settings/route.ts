import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
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
    let raw: unknown;
    try {
      raw = await request.json();
    } catch {
      throw AppError.badRequest("Invalid JSON body");
    }

    let body: ReturnType<typeof settingsUpdateSchema.parse>;
    try {
      body = settingsUpdateSchema.parse(raw);
    } catch (err) {
      if (err instanceof ZodError) {
        throw AppError.validation("Validation failed", err.flatten());
      }
      throw err;
    }

    const db = getDb();
    const clearPlugin = Object.prototype.hasOwnProperty.call(body, "activePlugin");

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (body.theme != null) patch.theme = body.theme;
    if (body.accentColor != null) patch.accentColor = body.accentColor;
    if (clearPlugin) patch.activePlugin = body.activePlugin ?? null;

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
