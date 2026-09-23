import { requireDbUser } from '@/lib/db/users';
import { getDb } from '@/lib/db/client';
import { roadmapProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api/http';
import {
  assertProfileReadyForGeneration,
  persistGeneratedRoadmap,
} from '@/lib/roadmap/persist-generated';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/** Regenerate a fresh roadmap for the active slot; other saved roadmaps are kept. */
export async function POST() {
  try {
    const user = await requireDbUser();
    const db = getDb();

    const [profile] = await db
      .select()
      .from(roadmapProfiles)
      .where(eq(roadmapProfiles.userId, user.id))
      .limit(1);

    assertProfileReadyForGeneration(
      profile,
      'Profile must include targetRole and at least 1 known skill to regenerate.',
    );
    const newRoadmap = await persistGeneratedRoadmap(user.id, profile);
    return jsonResponse({ roadmap: newRoadmap });
  } catch (e) {
    return errorResponse(e);
  }
}
