import { requireDbUser } from '@/lib/db/users';
import { getDb } from '@/lib/db/client';
import { roadmapProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api/http';
import {
  assertProfileReadyForGeneration,
  persistGeneratedRoadmap,
} from '@/lib/roadmap/persist-generated';

/**
 * Create a new roadmap from the user's profile.
 * Only deactivates the currently active roadmap — other saved roadmaps stay available.
 * Body: { mode?: "new" | "replace" } — both keep inactive history; "replace" is an alias for regenerate UX.
 */
export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    await request.json().catch(() => ({}));

    const db = getDb();
    const [profile] = await db
      .select()
      .from(roadmapProfiles)
      .where(eq(roadmapProfiles.userId, user.id))
      .limit(1);

    assertProfileReadyForGeneration(profile);
    const newRoadmap = await persistGeneratedRoadmap(user.id, profile);
    return jsonResponse({ roadmap: newRoadmap });
  } catch (e) {
    return errorResponse(e);
  }
}
