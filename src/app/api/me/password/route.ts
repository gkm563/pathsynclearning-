import { clerkClient } from "@clerk/nextjs/server";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { requireDbUser } from "@/lib/db/users";
import { passwordChangeSchema } from "@/lib/validation/schemas";

/**
 * Change password via Clerk Backend.
 * Verifies the user owns the session; Clerk enforces password policy.
 */
export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, passwordChangeSchema);

    if (body.currentPassword === body.newPassword) {
      throw AppError.validation("New password must be different from current", {
        fieldErrors: {
          newPassword: ["New password must be different from current"],
        },
      });
    }

    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(user.clerk_id);
    if (!clerkUser.passwordEnabled) {
      throw AppError.badRequest(
        "Password change is unavailable for accounts that sign in with a social provider.",
      );
    }

    try {
      await clerk.users.verifyPassword({
        userId: user.clerk_id,
        password: body.currentPassword,
      });
    } catch {
      throw AppError.validation("Current password is incorrect", {
        fieldErrors: {
          currentPassword: ["Current password is incorrect"],
        },
      });
    }

    try {
      await clerk.users.updateUser(user.clerk_id, {
        password: body.newPassword,
        skipPasswordChecks: false,
        signOutOfOtherSessions: true,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update password";
      throw AppError.badRequest(message);
    }

    return jsonResponse({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
