import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import { mapProfile } from "@/lib/db/mappers";
import { profiles, users, wallets } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { profileUpdateSchema } from "@/lib/validation/schemas";

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

async function loadProfilePayload(userId: string) {
  const db = getDb();
  const rows = await db
    .select({
      profile: profiles,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
      imageUrl: users.imageUrl,
      coins: wallets.coins,
      createdAt: users.createdAt,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .innerJoin(wallets, eq(wallets.userId, profiles.userId))
    .where(eq(profiles.userId, userId))
    .limit(1);

  if (!rows[0]) return null;

  const { profile, fullName, email, role, imageUrl, coins, createdAt } =
    rows[0];

  // Prefer live Clerk email/image when available
  const clerk = await currentUser().catch(() => null);
  const liveEmail =
    clerk?.primaryEmailAddress?.emailAddress ||
    clerk?.emailAddresses?.[0]?.emailAddress ||
    email;
  const liveImage = clerk?.imageUrl || imageUrl;

  return mapProfile(profile as unknown as Record<string, unknown>, {
    full_name: fullName,
    email: liveEmail,
    role,
    image_url: liveImage,
    coins,
    account_status: "active",
    created_at: createdAt,
  });
}

export async function GET() {
  try {
    const user = await requireDbUser();
    const profile = await loadProfilePayload(user.id);
    return jsonResponse({ profile });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, profileUpdateSchema);
    const db = getDb();
    const now = new Date();

    if (body.username) {
      try {
        const clash = await db
          .select({ userId: profiles.userId })
          .from(profiles)
          .where(eq(profiles.username, body.username))
          .limit(1);
        if (clash[0] && clash[0].userId !== user.id) {
          throw AppError.validation("Username is already taken", {
            fieldErrors: { username: ["Username is already taken"] },
          });
        }
      } catch (e) {
        if (e instanceof AppError) throw e;
        throw e;
      }
    }

    const userPatch: Record<string, unknown> = { updatedAt: now };
    if (body.fullName !== undefined) userPatch.fullName = body.fullName;
    if (body.imageUrl !== undefined) userPatch.imageUrl = body.imageUrl;

    if (Object.keys(userPatch).length > 1) {
      await db.update(users).set(userPatch).where(eq(users.id, user.id));
    }

    // Keep Clerk display name in sync when full name changes
    if (body.fullName !== undefined) {
      try {
        const clerk = await clerkClient();
        const { firstName, lastName } = splitFullName(body.fullName);
        await clerk.users.updateUser(user.clerk_id, {
          firstName: firstName || undefined,
          lastName: lastName || undefined,
        });
      } catch {
        // Non-fatal — PathEd DB remains source of truth for portal chrome
      }
    }

    const patch: Record<string, unknown> = { updatedAt: now };
    const assign = <K extends keyof typeof body>(key: K, column: string) => {
      const value = body[key];
      if (value !== undefined) patch[column] = value;
    };

    assign("username", "username");
    assign("phone", "phone");
    assign("dateOfBirth", "dateOfBirth");
    assign("bio", "bio");
    assign("location", "location");
    assign("website", "website");
    assign("tagline", "tagline");
    assign("institute", "institute");
    assign("degree", "degree");
    assign("branch", "branch");
    assign("cgpa", "cgpa");
    assign("gradYear", "gradYear");
    assign("rollNumber", "rollNumber");
    assign("semester", "semester");
    assign("rankGlobal", "rankGlobal");
    assign("rankUniv", "rankUniv");
    assign("skills", "skills");
    assign("passion", "passion");
    assign("objective", "objective");
    assign("pitch", "pitch");
    assign("github", "github");
    assign("linkedin", "linkedin");
    assign("portfolio", "portfolio");
    assign("projects", "projects");
    assign("badges", "badges");
    assign("additionalData", "additionalData");
    if (body.additionalCompleted !== undefined) {
      patch.additionalCompleted = body.additionalCompleted;
    }

    try {
      await db.update(profiles).set(patch).where(eq(profiles.userId, user.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/unique|duplicate/i.test(message) && body.username) {
        throw AppError.validation("Username is already taken", {
          fieldErrors: { username: ["Username is already taken"] },
        });
      }
      throw err;
    }

    const profile = await loadProfilePayload(user.id);
    return jsonResponse({ profile });
  } catch (e) {
    return errorResponse(e);
  }
}
