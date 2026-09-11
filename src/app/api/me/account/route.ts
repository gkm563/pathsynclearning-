/**
 * Permanently delete the authenticated account (Clerk first, then DB cascade).
 */
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import { issuedStudentRegistrationIds, users } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { accountDeleteSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    await parseJson(request, accountDeleteSchema);

    const clerk = await clerkClient();
    const db = getDb();

    // Clerk first — if this fails, keep local data and surface the error
    try {
      await clerk.users.deleteUser(user.clerk_id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete auth account";
      throw AppError.badRequest(message);
    }

    // Remove the Student Registration ID, then cascade the rest of the account.
    await db
      .delete(issuedStudentRegistrationIds)
      .where(eq(issuedStudentRegistrationIds.userId, user.id));
    await db.delete(users).where(eq(users.id, user.id));

    return jsonResponse({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
