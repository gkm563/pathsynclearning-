import { requireDbUser } from '@/lib/db/users';
import { getDb } from '@/lib/db/client';
import { roadmaps, roadmapProgress } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { errorResponse, jsonResponse, parseJson } from '@/lib/api/http';
import { roadmapProgressUpdateSchema } from '@/lib/validation/roadmap-schemas';
import { AppError } from '@/lib/api/errors';
import {
  assertDependenciesMet,
  findNodesToUnlock,
  isProgressSatisfied,
} from '@/lib/roadmap/progress';
import type { RoadmapEdge } from '@/types/roadmap';
import crypto from 'crypto';

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = await getDb();

    const [activeRoadmap] = await db
      .select()
      .from(roadmaps)
      .where(and(eq(roadmaps.userId, user.id), eq(roadmaps.isActive, true)))
      .orderBy(desc(roadmaps.createdAt))
      .limit(1);

    if (!activeRoadmap) {
      return jsonResponse({ progress: [] });
    }

    const progress = await db
      .select()
      .from(roadmapProgress)
      .where(eq(roadmapProgress.roadmapId, activeRoadmap.id));

    return jsonResponse({ progress });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const db = await getDb();

    const body = await parseJson(request, roadmapProgressUpdateSchema);
    const { nodeId, status } = body;

    const [activeRoadmap] = await db
      .select()
      .from(roadmaps)
      .where(and(eq(roadmaps.userId, user.id), eq(roadmaps.isActive, true)))
      .orderBy(desc(roadmaps.createdAt))
      .limit(1);

    if (!activeRoadmap) {
      throw new AppError('NOT_FOUND', 'Active roadmap not found');
    }

    const nodes = Array.isArray(activeRoadmap.nodes) ? activeRoadmap.nodes : [];
    const edges = (Array.isArray(activeRoadmap.edges) ? activeRoadmap.edges : []) as RoadmapEdge[];

    const nodeExists = nodes.some((n: any) => n.id === nodeId);
    if (!nodeExists) {
      throw new AppError('NOT_FOUND', 'Node not found in active roadmap');
    }

    const allProgress = await db
      .select()
      .from(roadmapProgress)
      .where(eq(roadmapProgress.roadmapId, activeRoadmap.id));

    const progressMap = new Map(allProgress.map((p) => [p.nodeId, p]));
    const current = progressMap.get(nodeId);

    if (current?.status === 'locked' && status !== 'available') {
      throw new AppError(
        'BAD_REQUEST',
        'This node is locked. Complete its prerequisites first.',
      );
    }

    if (status === 'completed' || status === 'in_progress' || status === 'skipped') {
      try {
        assertDependenciesMet(nodeId, edges, progressMap);
      } catch (err) {
        throw new AppError(
          'BAD_REQUEST',
          err instanceof Error ? err.message : 'Incomplete dependencies',
        );
      }
    }

    let updatedProgress;

    if (current) {
      [updatedProgress] = await db
        .update(roadmapProgress)
        .set({
          status,
          completedAt:
            status === 'completed'
              ? new Date()
              : status === 'skipped'
                ? current.completedAt
                : null,
          updatedAt: new Date(),
        })
        .where(eq(roadmapProgress.id, current.id))
        .returning();
    } else {
      [updatedProgress] = await db
        .insert(roadmapProgress)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
          roadmapId: activeRoadmap.id,
          nodeId,
          status,
          completedAt: status === 'completed' ? new Date() : null,
          updatedAt: new Date(),
        })
        .returning();
    }

    progressMap.set(nodeId, updatedProgress);

    // Unlock dependents when a node is completed or skipped
    if (isProgressSatisfied(status)) {
      const toUnlock = findNodesToUnlock(nodeId, edges, progressMap);

      for (const unlockId of toUnlock) {
        const currentP = progressMap.get(unlockId);
        if (currentP) {
          const [unlocked] = await db
            .update(roadmapProgress)
            .set({ status: 'available', updatedAt: new Date() })
            .where(eq(roadmapProgress.id, currentP.id))
            .returning();
          progressMap.set(unlockId, unlocked);
        } else {
          const [unlocked] = await db
            .insert(roadmapProgress)
            .values({
              id: crypto.randomUUID(),
              userId: user.id,
              roadmapId: activeRoadmap.id,
              nodeId: unlockId,
              status: 'available',
              updatedAt: new Date(),
            })
            .returning();
          progressMap.set(unlockId, unlocked);
        }
      }
    }

    // Return full progress so the client can refresh unlocks in one round-trip
    const progress = Array.from(progressMap.values());
    return jsonResponse({ progress: updatedProgress, allProgress: progress });
  } catch (e) {
    return errorResponse(e);
  }
}
