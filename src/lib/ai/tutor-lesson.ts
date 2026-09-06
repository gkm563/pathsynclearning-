import { and, desc, eq } from "drizzle-orm";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import { notes } from "@/lib/db/schema";
import { getActiveRoadmap } from "@/lib/roadmap/active";
import type { RoadmapNode } from "@/types/roadmap";
import type { TutorLessonContext } from "@/lib/ai/tutor-prompt";

function asNodes(raw: unknown): RoadmapNode[] {
  return Array.isArray(raw) ? (raw as RoadmapNode[]) : [];
}

function relatedTitles(nodes: RoadmapNode[], node: RoadmapNode): string[] {
  const deps = new Set(node.dependencies || []);
  const titles: string[] = [];
  for (const other of nodes) {
    if (other.id === node.id) continue;
    const isParent = deps.has(other.id);
    const isChild = (other.dependencies || []).includes(node.id);
    if (isParent || isChild) titles.push(other.title);
  }
  return titles.slice(0, 8);
}

function matchingVideo(
  node: RoadmapNode,
  requested?: { title?: string; channel?: string },
): { title: string; channel?: string } | undefined {
  const want = requested?.title?.trim().toLowerCase();
  if (!want) return undefined;
  const hit = (node.resources || []).find((r) => r.title?.trim().toLowerCase() === want);
  if (!hit) return undefined;
  return { title: hit.title, channel: hit.channel || requested?.channel };
}

export async function resolveTutorLesson(
  userId: string,
  nodeId: string,
  requestedVideo?: { title?: string; channel?: string },
): Promise<TutorLessonContext> {
  const db = getDb();
  const active = await getActiveRoadmap(db, userId);
  if (!active) throw AppError.notFound("Active roadmap not found");

  const nodes = asNodes(active.nodes);
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) {
    throw AppError.notFound("That topic is not on your active roadmap.");
  }

  let noteExcerpt: string | undefined;
  try {
    const [note] = await db
      .select({ content: notes.content })
      .from(notes)
      .where(
        and(
          eq(notes.userId, userId),
          eq(notes.sourceType, "roadmap_node"),
          eq(notes.sourceId, nodeId),
        ),
      )
      .orderBy(desc(notes.updatedAt))
      .limit(1);
    if (note?.content) {
      noteExcerpt = note.content.replace(/\s+/g, " ").trim().slice(0, 500);
    }
  } catch {
    noteExcerpt = undefined;
  }

  return {
    roadmapTitle: active.title || "Your roadmap",
    targetRole: active.targetRole,
    node,
    relatedTitles: relatedTitles(nodes, node),
    roadmapNodeTitles: nodes
      .filter((n) => n.id !== node.id && n.title)
      .map((n) => n.title)
      .slice(0, 24),
    video: matchingVideo(node, requestedVideo),
    noteExcerpt,
  };
}