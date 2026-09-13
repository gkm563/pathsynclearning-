import { requireDbUser } from '@/lib/db/users';
import { getDb } from '@/lib/db/client';
import { profiles, roadmapProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse, parseJson } from '@/lib/api/http';
import { roadmapProfileUpdateSchema } from '@/lib/validation/roadmap-schemas';
import { recordCareerGoalChange } from '@/lib/memory/processor';
import {
  deriveRoadmapFieldsFromAccount,
  fillMissingRoadmapFields,
} from '@/lib/roadmap/hydrate-from-account';

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();

    const [[profile], [account]] = await Promise.all([
      db
        .select()
        .from(roadmapProfiles)
        .where(eq(roadmapProfiles.userId, user.id))
        .limit(1),
      db
        .select({
          institute: profiles.institute,
          degree: profiles.degree,
          branch: profiles.branch,
          gradYear: profiles.gradYear,
          location: profiles.location,
          semester: profiles.semester,
          skills: profiles.skills,
          projects: profiles.projects,
          objective: profiles.objective,
          passion: profiles.passion,
          bio: profiles.bio,
          additionalData: profiles.additionalData,
        })
        .from(profiles)
        .where(eq(profiles.userId, user.id))
        .limit(1),
    ]);

    const derived = deriveRoadmapFieldsFromAccount(account ?? {});
    const hydrated = fillMissingRoadmapFields(
      profile as Record<string, unknown> | undefined,
      derived,
    );

    return jsonResponse({ profile: hydrated });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const db = await getDb();
    
    const body = await parseJson(request, roadmapProfileUpdateSchema);

    const [existing] = await db
      .select({ careerGoal: roadmapProfiles.careerGoal, targetRole: roadmapProfiles.targetRole })
      .from(roadmapProfiles)
      .where(eq(roadmapProfiles.userId, user.id))
      .limit(1);

    const [updatedProfile] = await db
      .insert(roadmapProfiles)
      .values({
        ...body,
        userId: user.id,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: roadmapProfiles.userId,
        set: {
          ...body,
          updatedAt: new Date(),
        },
      })
      .returning();

    const prevGoal = existing?.careerGoal || existing?.targetRole || null;
    const nextGoal = updatedProfile.careerGoal || updatedProfile.targetRole || null;
    if (nextGoal && nextGoal !== prevGoal) {
      await recordCareerGoalChange({
        userId: user.id,
        previousGoal: prevGoal,
        newGoal: nextGoal,
      }).catch(() => null);
    }

    return jsonResponse({ profile: updatedProfile });
  } catch (e) {
    return errorResponse(e);
  }
}
