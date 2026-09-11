import { eq } from "drizzle-orm";
import { errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import { mapProfile } from "@/lib/db/mappers";
import { profiles, users, userSettings } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";

type Params = { params: Promise<{ username: string }> };

/**
 * Public profile by username.
 * Honors profile_visibility:
 * - public → anyone authenticated can view
 * - connections / private → only the owner (for now)
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const viewer = await requireDbUser();
    const { username: raw } = await params;
    const username = decodeURIComponent(raw || "").trim();
    if (!username) throw AppError.badRequest("Username required");

    const db = getDb();
    const rows = await db
      .select({
        profile: profiles,
        fullName: users.fullName,
        imageUrl: users.imageUrl,
        role: users.role,
        studentRegistrationId: users.studentRegistrationId,
        visibility: userSettings.profileVisibility,
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.userId))
      .innerJoin(userSettings, eq(userSettings.userId, profiles.userId))
      .where(eq(profiles.username, username))
      .limit(1);

    if (!rows[0]) throw AppError.notFound("Profile not found");

    const row = rows[0];
    const isOwner = row.profile.userId === viewer.id;
    const visibility = row.visibility || "public";

    if (!isOwner && visibility !== "public") {
      throw AppError.forbidden("This profile is not publicly visible");
    }

    return jsonResponse({
      profile: mapProfile(row.profile as unknown as Record<string, unknown>, {
        full_name: row.fullName,
        image_url: row.imageUrl,
        role: row.role,
        student_registration_id: row.studentRegistrationId,
        username: row.profile.username,
        profile_visibility: visibility,
        is_owner: isOwner,
      }),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
