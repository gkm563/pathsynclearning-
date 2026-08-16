import { eq, sql } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { mapOnboarding } from "@/lib/db/mappers";
import { onboarding, profiles, users } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { onboardingUpdateSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const rows = await db
      .select()
      .from(onboarding)
      .where(eq(onboarding.userId, user.id))
      .limit(1);
    return jsonResponse({
      onboarding: rows[0] ? mapOnboarding(rows[0]) : null,
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, onboardingUpdateSchema);
    const db = getDb();

    const patch: Record<string, unknown> = { updatedAt: sql`NOW()` };
    if (body.stage1) patch.stage1 = body.stage1;
    if (body.stage2) patch.stage2 = body.stage2;
    if (body.stage3) patch.stage3 = body.stage3;
    if (body.stage4) patch.stage4 = body.stage4;
    if (body.selectedCareer != null) patch.selectedCareer = body.selectedCareer;
    if (body.currentStage != null) patch.currentStage = body.currentStage;
    if (body.completed != null) patch.completed = body.completed;

    await db.update(onboarding).set(patch).where(eq(onboarding.userId, user.id));

    if (body.stage1?.name || body.stage1?.college) {
      const profilePatch: Record<string, unknown> = { updatedAt: sql`NOW()` };
      if (body.stage1?.college != null) profilePatch.institute = body.stage1.college;
      if (body.stage1?.branch != null) profilePatch.branch = body.stage1.branch;
      if (body.stage1?.semester != null) profilePatch.semester = body.stage1.semester;
      if (body.stage1?.cgpa != null) profilePatch.cgpa = body.stage1.cgpa;
      if (body.stage1?.roll != null) profilePatch.rollNumber = body.stage1.roll;

      await db
        .update(profiles)
        .set(profilePatch)
        .where(eq(profiles.userId, user.id));

      if (typeof body.stage1?.name === "string" && body.stage1.name) {
        await db
          .update(users)
          .set({ fullName: body.stage1.name, updatedAt: sql`NOW()` })
          .where(eq(users.id, user.id));
      }
    }

    const rows = await db
      .select()
      .from(onboarding)
      .where(eq(onboarding.userId, user.id))
      .limit(1);

    return jsonResponse({
      onboarding: rows[0] ? mapOnboarding(rows[0]) : null,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
