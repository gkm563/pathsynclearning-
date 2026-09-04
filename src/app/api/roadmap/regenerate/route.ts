import { requireDbUser } from '@/lib/db/users';
import { getDb } from '@/lib/db/client';
import { roadmapProfiles, roadmaps, roadmapProgress } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api/http';
import { generateRoadmap } from '@/lib/ai/roadmap-generator';
import { AppError } from '@/lib/api/errors';
import { computeInitialNodeStatus } from '@/lib/roadmap/progress';
import {
  deactivateActiveRoadmaps,
  nextRoadmapVersion,
} from '@/lib/roadmap/active';
import crypto from 'crypto';

/** Regenerate a fresh roadmap for the active slot; other saved roadmaps are kept. */
export async function POST() {
  try {
    const user = await requireDbUser();
    const db = await getDb();

    const [profile] = await db
      .select()
      .from(roadmapProfiles)
      .where(eq(roadmapProfiles.userId, user.id))
      .limit(1);

    if (
      !profile ||
      !profile.targetRole ||
      !profile.knownSkills ||
      (Array.isArray(profile.knownSkills) && profile.knownSkills.length === 0)
    ) {
      throw new AppError(
        'BAD_REQUEST',
        'Profile must include targetRole and at least 1 known skill to regenerate.',
      );
    }

    const generatedData = await generateRoadmap(profile as unknown as any, user.id);
    const newVersion = await nextRoadmapVersion(db, user.id);

    await deactivateActiveRoadmaps(db, user.id);

    const roadmapId = crypto.randomUUID();

    const [newRoadmap] = await db
      .insert(roadmaps)
      .values({
        id: roadmapId,
        userId: user.id,
        version: newVersion,
        title: generatedData.title,
        targetRole: profile.targetRole,
        estimatedWeeks: generatedData.estimatedWeeks,
        nodes: generatedData.nodes,
        edges: generatedData.edges,
        generatedFromProfile: profile,
        isActive: true,
        createdAt: new Date(),
      })
      .returning();

    const progressRows = generatedData.nodes.map((node: any) => ({
      id: crypto.randomUUID(),
      userId: user.id,
      roadmapId: roadmapId,
      nodeId: node.id,
      status: computeInitialNodeStatus(node.id, generatedData.edges),
      updatedAt: new Date(),
    }));

    if (progressRows.length > 0) {
      await db.insert(roadmapProgress).values(progressRows);
    }

    return jsonResponse({ roadmap: newRoadmap });
  } catch (e) {
    return errorResponse(e);
  }
}
