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

/** Every descendant of `nodeId` (not including itself). */
export function descendantNodeIds(nodeId: string, edges: RoadmapEdge[]): string[] {
  const children = new Map<string, string[]>();
  for (const edge of edges) {
    const list = children.get(edge.source) || [];
    list.push(edge.target);
    children.set(edge.source, list);
  }
  const out: string[] = [];
  const seen = new Set<string>();
  const stack = [...(children.get(nodeId) || [])];
  while (stack.length) {
    const id = stack.pop();
    if (!id || seen.has(id) || id === nodeId) continue;
    seen.add(id);
    out.push(id);
    for (const next of children.get(id) || []) stack.push(next);
  }
  return out;
}

/** Relock all descendants of a looped node. Mutates `progressMap` statuses. */
export function relockDependents(
  nodeId: string,
  edges: RoadmapEdge[],
  progressMap: Map<string, { status: string }>,
): string[] {
  const ids = descendantNodeIds(nodeId, edges);
  const locked: string[] = [];
  for (const id of ids) {
    const current = progressMap.get(id);
    if (current) {
      current.status = "locked";
    } else {
      progressMap.set(id, { status: "locked" });
    }
    locked.push(id);
  }
  return locked;
}