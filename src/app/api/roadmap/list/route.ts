import { requireDbUser } from "@/lib/db/users";
import { getDb } from "@/lib/db/client";
import { roadmaps, roadmapProgress } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { errorResponse, jsonResponse } from "@/lib/api/http";
import { isProgressSatisfied } from "@/lib/roadmap/progress";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = await getDb();

    const rows = await db
      .select({
        id: roadmaps.id,
        title: roadmaps.title,
        targetRole: roadmaps.targetRole,
        version: roadmaps.version,
        estimatedWeeks: roadmaps.estimatedWeeks,
        isActive: roadmaps.isActive,
        createdAt: roadmaps.createdAt,
        nodes: roadmaps.nodes,
      })
      .from(roadmaps)
      .where(eq(roadmaps.userId, user.id))
      .orderBy(desc(roadmaps.createdAt));

    if (rows.length === 0) {
      return jsonResponse({ roadmaps: [] });
    }

    const ids = rows.map((r) => r.id);
    const progressRows = await db
      .select({
        roadmapId: roadmapProgress.roadmapId,
        nodeId: roadmapProgress.nodeId,
        status: roadmapProgress.status,
      })
      .from(roadmapProgress)
      .where(inArray(roadmapProgress.roadmapId, ids));

    const byRoadmap = new Map<string, { total: number; done: number }>();
    for (const row of rows) {
      const nodes = Array.isArray(row.nodes) ? row.nodes : [];
      const trackable = nodes.filter(
        (n: { type?: string }) =>
          n?.type !== "phase" && n?.type !== "goal" && n?.type !== "career",
      );
      byRoadmap.set(row.id, { total: trackable.length, done: 0 });
    }

    for (const p of progressRows) {
      const bucket = byRoadmap.get(p.roadmapId);
      if (!bucket) continue;
      if (isProgressSatisfied(p.status)) bucket.done += 1;
    }

    const summaries = rows.map((r) => {
      const stats = byRoadmap.get(r.id) || { total: 0, done: 0 };
      const completionPercent =
        stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
      return {
        id: r.id,
        title: r.title,
        targetRole: r.targetRole,
        version: r.version,
        estimatedWeeks: r.estimatedWeeks,
        isActive: r.isActive,
        createdAt: r.createdAt,
        completionPercent,
        nodeCount: stats.total,
      };
    });

    return jsonResponse({ roadmaps: summaries });
  } catch (e) {
    return errorResponse(e);
  }
}
