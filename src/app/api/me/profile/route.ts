import { eq } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { mapProfile } from "@/lib/db/mappers";
import { profiles, users, wallets } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { profileUpdateSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const rows = await db
      .select({
        profile: profiles,
        fullName: users.fullName,
        email: users.email,
        role: users.role,
        imageUrl: users.imageUrl,
        coins: wallets.coins,
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.userId))
      .innerJoin(wallets, eq(wallets.userId, profiles.userId))
      .where(eq(profiles.userId, user.id))
      .limit(1);

    if (!rows[0]) {
      return jsonResponse({ profile: null });
    }

    const { profile, fullName, email, role, imageUrl, coins } = rows[0];
    return jsonResponse({
      profile: mapProfile(profile as unknown as Record<string, unknown>, {
        full_name: fullName,
        email,
        role,
        image_url: imageUrl,
        coins,
      }),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, profileUpdateSchema);
    const db = getDb();

    // role / cri / xp / streak are server-owned — never accepted from clients
    const now = new Date();

    if (body.fullName) {
      await db
        .update(users)
        .set({
          fullName: body.fullName,
          updatedAt: now,
        })
        .where(eq(users.id, user.id));
    }

    const patch: Record<string, unknown> = { updatedAt: now };
    const assign = <K extends keyof typeof body>(key: K, column: string) => {
      const value = body[key];
      if (value !== undefined) patch[column] = value;
    };

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

    await db.update(profiles).set(patch).where(eq(profiles.userId, user.id));

    const rows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    return jsonResponse({
      profile: rows[0]
        ? mapProfile(rows[0] as unknown as Record<string, unknown>)
        : null,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
