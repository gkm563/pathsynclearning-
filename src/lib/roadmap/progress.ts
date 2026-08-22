import type { RoadmapEdge } from '@/types/roadmap';

/** Completed or skipped both count as done for unlocking dependents. */
export function isProgressSatisfied(status: string | undefined | null): boolean {
  return status === 'completed' || status === 'skipped';
}

export function computeInitialNodeStatus(
  nodeId: string,
  edges: Array<{ source: string; target: string }>,
): 'locked' | 'available' {
  const hasIncoming = edges.some((e) => e.target === nodeId);
  return hasIncoming ? 'locked' : 'available';
}

/** Nodes that should unlock after `completedNodeId` is satisfied. */
export function findNodesToUnlock(
  completedNodeId: string,
  edges: RoadmapEdge[],
  progressMap: Map<string, { status: string }>,
): string[] {
  const dependents = edges
    .filter((e) => e.source === completedNodeId)
    .map((e) => e.target);

  const toUnlock: string[] = [];
  for (const depId of dependents) {
    const prereqs = edges.filter((e) => e.target === depId).map((e) => e.source);
    const allDone = prereqs.every((id) => isProgressSatisfied(progressMap.get(id)?.status));
    if (!allDone) continue;

    const current = progressMap.get(depId);
    if (!current || current.status === 'locked') {
      toUnlock.push(depId);
    }
  }
  return toUnlock;
}

export function assertDependenciesMet(
  nodeId: string,
  edges: RoadmapEdge[],
  progressMap: Map<string, { status: string }>,
): void {
  const dependencies = edges.filter((e) => e.target === nodeId).map((e) => e.source);
  const incomplete = dependencies.filter(
    (depId) => !isProgressSatisfied(progressMap.get(depId)?.status),
  );
  if (incomplete.length > 0) {
    throw new Error(`Incomplete dependencies: ${incomplete.join(', ')}`);
  }
}