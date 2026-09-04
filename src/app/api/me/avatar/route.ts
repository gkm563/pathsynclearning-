import { eq } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { avatarSyncSchema } from "@/lib/validation/schemas";

/**
 * Sync avatar URL after Clerk client-side upload/removal.
 * Actual binary upload happens via Clerk (no custom storage secrets on the client).
 */
export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, avatarSyncSchema);
    const db = getDb();

    await db
      .update(users)
      .set({
        imageUrl: body.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return jsonResponse({ image_url: body.imageUrl });
  } catch (e) {
    return errorResponse(e);
  }
}
