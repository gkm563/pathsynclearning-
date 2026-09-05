import { requireDbUser } from '@/lib/db/users';
import { getDb } from '@/lib/db/client';
import { roadmapProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api/http';
import { generateFollowUpQuestions } from '@/lib/ai/roadmap-questions';
import { toRoadmapProfile } from '@/lib/roadmap/persist-generated';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    const user = await requireDbUser();
    const db = getDb();

    const [profile] = await db
      .select()
      .from(roadmapProfiles)
      .where(eq(roadmapProfiles.userId, user.id))
      .limit(1);

    if (!profile || !profile.targetRole || !profile.knownSkills || (Array.isArray(profile.knownSkills) && profile.knownSkills.length === 0)) {
      return jsonResponse({ needsMoreInformation: false, questions: [] });
    }

    try {
      const response = await generateFollowUpQuestions(toRoadmapProfile(profile), user.id);
      return jsonResponse(response);
    } catch (aiError) {
      logger.error('Failed to generate follow up questions', {
        message: aiError instanceof Error ? aiError.message : String(aiError),
      });
      return jsonResponse({ needsMoreInformation: false, questions: [] });
    }
  } catch (e) {
    return errorResponse(e);
  }
}
