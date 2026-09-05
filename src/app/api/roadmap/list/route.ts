import { requireDbUser } from "@/lib/db/users";
import { getDb } from "@/lib/db/client";
import { roadmaps, roadmapProgress } from "@/lib/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { errorResponse, jsonResponse } from "@/lib/api/http";
import { computeRoadmapStats } from "@/lib/roadmap/stats";
import type { RoadmapNode } from "@/types/roadmap";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = await getDb();

    const rows = await db
      .select({
        id: roadmaps.id,
        title: roadmaps.title,
        targetRole: roadmaps.targetRole,
        targetCompany: roadmaps.targetCompany,
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

    const progressByRoadmap = new Map<string, Map<string, string>>();
    for (const p of progressRows) {
      let map = progressByRoadmap.get(p.roadmapId);
      if (!map) {
        map = new Map();
        progressByRoadmap.set(p.roadmapId, map);
      }
      map.set(p.nodeId, p.status);
    }

    const summaries = rows.map((r) => {
      const nodes = (Array.isArray(r.nodes) ? r.nodes : []) as RoadmapNode[];
      const stats = computeRoadmapStats(nodes, progressByRoadmap.get(r.id));
      return {
        id: r.id,
        title: r.title,
        targetRole: r.targetRole,
        targetCompany: r.targetCompany,
        version: r.version,
        estimatedWeeks: r.estimatedWeeks,
        isActive: r.isActive,
        createdAt: r.createdAt,
        completionPercent: stats.completionPercent,
        nodeCount: stats.totalNodes,
        completedNodes: stats.completedNodes,
        remainingHours: stats.remainingHours,
      };
    });

    return jsonResponse({ roadmaps: summaries });
  } catch (e) {
    return errorResponse(e);
  }
}
