import type { RoadmapNode, RoadmapNodeStatus } from "@/types/roadmap";
import { isProgressSatisfied } from "@/lib/roadmap/progress";

const NON_TRACKABLE = new Set(["phase", "goal", "career"]);

export function isTrackableRoadmapNode(
  node: Pick<RoadmapNode, "type"> | { type?: string },
): boolean {
  return !NON_TRACKABLE.has(String(node?.type || ""));
}

export type RoadmapStats = {
  totalNodes: number;
  completedNodes: number;
  completionPercent: number;
  estimatedTotalHours: number;
  completedHours: number;
  remainingHours: number;
};

/**
 * Progress + time for a roadmap — only skill/topic/project/etc. nodes.
 * Phase / goal / career nodes are excluded so % and hours stay accurate.
 */
export function computeRoadmapStats(
  nodes: Array<
    Pick<RoadmapNode, "id" | "type" | "estimatedHours"> & {
      status?: RoadmapNodeStatus | string;
    }
  >,
  progressByNodeId?: Map<string, string> | Record<string, string>,
): RoadmapStats {
  const getStatus = (id: string, fallback?: string) => {
    if (!progressByNodeId) return fallback;
    if (progressByNodeId instanceof Map) {
      return progressByNodeId.get(id) ?? fallback;
    }
    return progressByNodeId[id] ?? fallback;
  };

  const trackable = nodes.filter(isTrackableRoadmapNode);
  let completedNodes = 0;
  let estimatedTotalHours = 0;
  let completedHours = 0;

  for (const node of trackable) {
    const hours = Number(node.estimatedHours) || 0;
    estimatedTotalHours += hours;
    const status = getStatus(node.id, node.status);
    if (isProgressSatisfied(status)) {
      completedNodes += 1;
    }
    if (status === "completed") {
      completedHours += hours;
    }
  }

  const totalNodes = trackable.length;
  const completionPercent =
    totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  return {
    totalNodes,
    completedNodes,
    completionPercent,
    estimatedTotalHours,
    completedHours,
    remainingHours: Math.max(0, estimatedTotalHours - completedHours),
  };
}

export function allTrackableNodesSatisfied(
  nodes: Array<Pick<RoadmapNode, "id" | "type"> & { status?: RoadmapNodeStatus | string }>,
  progressByNodeId?: Map<string, string> | Record<string, string>,
): boolean {
  const trackable = nodes.filter(isTrackableRoadmapNode);
  if (!trackable.length) return false;
  const getStatus = (id: string, fallback?: string) => {
    if (!progressByNodeId) return fallback;
    if (progressByNodeId instanceof Map) return progressByNodeId.get(id) ?? fallback;
    return progressByNodeId[id] ?? fallback;
  };
  return trackable.every((node) => isProgressSatisfied(getStatus(node.id, node.status)));
}

export function certificationLabel(input: {
  certificationStatus?: string | null;
  certifiedAt?: string | Date | null;
  completionPercent?: number;
}): string {
  if (input.certifiedAt || input.certificationStatus === "certified") return "Certified";
  if (input.certificationStatus === "pending_interview") return "Interview pending";
  if (input.certificationStatus === "remediating") return "Review path";
  if (input.certificationStatus === "redesigning") return "Rebuilding";
  if ((input.completionPercent ?? 0) >= 100) return "Interview pending";
  return `${input.completionPercent ?? 0}%`;
}
