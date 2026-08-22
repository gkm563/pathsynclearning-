import { NextResponse } from 'next/server';
import { requireDbUser } from '@/lib/db/users';
import { getDb } from '@/lib/db/client';
import { roadmapProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api/http';
import { generateFollowUpQuestions } from '@/lib/ai/roadmap-questions';

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const db = await getDb();

    const [profile] = await db
      .select()
      .from(roadmapProfiles)
      .where(eq(roadmapProfiles.userId, user.id))
      .limit(1);

    if (!profile || !profile.targetRole || !profile.knownSkills || (Array.isArray(profile.knownSkills) && profile.knownSkills.length === 0)) {
      return jsonResponse({ needsMoreInformation: false, questions: [] });
    }

    try {
      const response = await generateFollowUpQuestions(profile as unknown as any, user.id);
      return jsonResponse(response);
    } catch (aiError) {
      console.error('Failed to generate follow up questions:', aiError);
      return jsonResponse({ needsMoreInformation: false, questions: [] });
    }
  } catch (e) {
    return errorResponse(e);
  }
}
