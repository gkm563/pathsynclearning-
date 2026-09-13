import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { roadmaps } from "@/lib/db/schema";
import { allTrackableNodesSatisfied as statsAllSatisfied } from "@/lib/roadmap/stats";
import type {
  RoadmapAdaptation,
  RoadmapCertificationStatus,
  RoadmapNode,
} from "@/types/roadmap";

export const ROADMAP_INTERVIEW_PASS_SCORE = 70;
export const MAX_ADAPTATION_ROUNDS = 2;
export const MAX_NEW_NODES_PER_FAIL = 3;

export function emptyAdaptation(): RoadmapAdaptation {
  return {
    round: 0,
    pendingOutcome: null,
    appliedSessionIds: [],
    insertedNodeIds: [],
    loopedNodeIds: [],
    refreshedNodeIds: [],
    relockedNodeIds: [],
  };
}

export function parseAdaptation(raw: unknown): RoadmapAdaptation {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const list = (value: unknown) =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  const pending =
    rec.pendingOutcome === "certified" ||
    rec.pendingOutcome === "remediate" ||
    rec.pendingOutcome === "redesign"
      ? rec.pendingOutcome
      : null;
  return {
    round: typeof rec.round === "number" && Number.isFinite(rec.round) ? rec.round : 0,
    pendingOutcome: pending,
    appliedSessionIds: list(rec.appliedSessionIds),
    insertedNodeIds: list(rec.insertedNodeIds),
    loopedNodeIds: list(rec.loopedNodeIds),
    refreshedNodeIds: list(rec.refreshedNodeIds),
    relockedNodeIds: list(rec.relockedNodeIds),
  };
}

export function parseCertificationStatus(raw: unknown): RoadmapCertificationStatus {
  if (
    raw === "pending_interview" ||
    raw === "certified" ||
    raw === "remediating" ||
    raw === "redesigning"
  ) {
    return raw;
  }
  return "in_progress";
}

export function allTrackableNodesSatisfied(
  nodes: unknown,
  progressByNodeId: Map<string, string>,
): boolean {
  if (!Array.isArray(nodes) || nodes.length === 0) return false;
  return statsAllSatisfied(nodes as RoadmapNode[], progressByNodeId);
}

export function actionFromTopicScore(score: number): "ok" | "loop" | "expand" {
  if (score < 40) return "loop";
  if (score < ROADMAP_INTERVIEW_PASS_SCORE) return "expand";
  return "ok";
}

export async function promotePendingInterviewIfReady(input: {
  roadmapId: string;
  nodes: unknown;
  progressByNodeId: Map<string, string>;
  certifiedAt?: Date | null;
  certificationStatus?: string | null;
}): Promise<RoadmapCertificationStatus> {
  const current = parseCertificationStatus(input.certificationStatus);
  if (input.certifiedAt || current === "certified") return "certified";
  if (current === "redesigning") return "redesigning";
  if (!allTrackableNodesSatisfied(input.nodes, input.progressByNodeId)) {
    return current === "pending_interview" ? "in_progress" : current;
  }
  if (current !== "pending_interview") {
    const db = getDb();
    await db
      .update(roadmaps)
      .set({ certificationStatus: "pending_interview" })
      .where(eq(roadmaps.id, input.roadmapId));
  }
  return "pending_interview";
}
