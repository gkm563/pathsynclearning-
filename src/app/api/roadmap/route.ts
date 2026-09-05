import { requireDbUser } from '@/lib/db/users';
import { getDb } from '@/lib/db/client';
import { roadmaps, roadmapProgress } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { errorResponse, jsonResponse } from '@/lib/api/http';
import { isProgressSatisfied } from '@/lib/roadmap/progress';
import { ensureNodeAssessments } from '@/lib/roadmap/assessment-bank';
import { deactivateActiveRoadmaps, getActiveRoadmap } from '@/lib/roadmap/active';
import type { RoadmapNode } from '@/types/roadmap';
import crypto from 'crypto';

type RoadmapProgress = typeof roadmapProgress.$inferSelect;

/** Ensure locked nodes with no incomplete deps become available (repairs bad seed data). */
async function reconcileProgress(
  db: Awaited<ReturnType<typeof getDb>>,
  userId: string,
  roadmapId: string,
  nodes: RoadmapNode[],
  edges: Array<{ source: string; target: string }>,
  progress: RoadmapProgress[],
): Promise<RoadmapProgress[]> {
  const progressMap = new Map(progress.map((p) => [p.nodeId, p]));
  const nodeIds = nodes.map((n) => n.id as string);

  for (const nodeId of nodeIds) {
    const deps = edges.filter((e) => e.target === nodeId).map((e) => e.source);
    const depsMet = deps.every((d) => isProgressSatisfied(progressMap.get(d)?.status));
    const row = progressMap.get(nodeId);

    if (!row) {
      const status = deps.length === 0 || depsMet ? 'available' : 'locked';
      const [inserted] = await db
        .insert(roadmapProgress)
        .values({
          id: crypto.randomUUID(),
          userId,
          roadmapId,
          nodeId,
          status,
          updatedAt: new Date(),
        })
        .returning();
      progressMap.set(nodeId, inserted);
      continue;
    }

    if (row.status === 'locked' && depsMet) {
      const [updated] = await db
        .update(roadmapProgress)
        .set({ status: 'available', updatedAt: new Date() })
        .where(eq(roadmapProgress.id, row.id))
        .returning();
      progressMap.set(nodeId, updated);
    }
  }

  return Array.from(progressMap.values());
}

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = await getDb();

    const activeRoadmap = await getActiveRoadmap(db, user.id);

    if (!activeRoadmap) {
      return jsonResponse({ roadmap: null });
    }

    let progress = await db
      .select()
      .from(roadmapProgress)
      .where(eq(roadmapProgress.roadmapId, activeRoadmap.id));

    const rawNodes = Array.isArray(activeRoadmap.nodes) ? activeRoadmap.nodes : [];
    const edges = (Array.isArray(activeRoadmap.edges) ? activeRoadmap.edges : []) as Array<{
      source: string;
      target: string;
    }>;

    const enrichedNodes = ensureNodeAssessments(rawNodes as RoadmapNode[]);
    const needsPersist = JSON.stringify(rawNodes) !== JSON.stringify(enrichedNodes);
    if (needsPersist) {
      await db
        .update(roadmaps)
        .set({ nodes: enrichedNodes })
        .where(eq(roadmaps.id, activeRoadmap.id));
    }

    progress = (await reconcileProgress(
      db,
      user.id,
      activeRoadmap.id,
      enrichedNodes,
      edges,
      progress,
    ));

    const progressMap = new Map(progress.map((p) => [p.nodeId, p]));

    const nodesWithProgress = enrichedNodes.map((node) => ({
      ...node,
      status: progressMap.get(node.id)?.status || 'locked',
    }));

    const mergedRoadmap = {
      ...activeRoadmap,
      nodes: nodesWithProgress,
    };

    return jsonResponse({ roadmap: mergedRoadmap, progress });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE() {
  try {
    const user = await requireDbUser();
    const db = await getDb();

    await deactivateActiveRoadmaps(db, user.id);

    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e);
  }
}
