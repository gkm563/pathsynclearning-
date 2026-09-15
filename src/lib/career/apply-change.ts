import "server-only";

import { and, eq } from "drizzle-orm";
import { previewCareerCri, uniqueSkillLabels } from "@/lib/career/match";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import {
  profiles,
  roadmapProfiles,
  roadmapProgress,
  roadmaps,
} from "@/lib/db/schema";
import { recordCareerGoalChange } from "@/lib/memory/processor";
import { parseOnboardingMeta } from "@/lib/onboarding/types";
import { deactivateActiveRoadmaps } from "@/lib/roadmap/active";
import { findRoleByName } from "@/lib/roadmap/hiring-catalog";
import { recomputeCri } from "@/lib/cri/persist";
import type { RoadmapNode } from "@/types/roadmap";

function asNodes(raw: unknown): RoadmapNode[] {
  return Array.isArray(raw) ? (raw as RoadmapNode[]) : [];
}

export type CareerPayload = {
  targetRole: string | null;
  careerGoal: string | null;
  cri: number;
  criMilli: number;
  studentSkills: string[];
};

export type CareerChangeResult = CareerPayload & {
  previousRole: string | null;
  previousCri: number;
  matchedSkills: string[];
  startsFromBeginning: boolean;
};

export async function loadCareerPayload(userId: string): Promise<CareerPayload> {
  const db = getDb();
  const [[profile], [roadmap], [active]] = await Promise.all([
    db
      .select({ cri: profiles.cri, criMilli: profiles.criMilli, skills: profiles.skills })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1),
    db
      .select({
        targetRole: roadmapProfiles.targetRole,
        careerGoal: roadmapProfiles.careerGoal,
        knownSkills: roadmapProfiles.knownSkills,
      })
      .from(roadmapProfiles)
      .where(eq(roadmapProfiles.userId, userId))
      .limit(1),
    db
      .select({ id: roadmaps.id, nodes: roadmaps.nodes })
      .from(roadmaps)
      .where(and(eq(roadmaps.userId, userId), eq(roadmaps.isActive, true)))
      .limit(1),
  ]);

  const completedIds = new Set<string>();
  if (active?.id) {
    const rows = await db
      .select({ nodeId: roadmapProgress.nodeId, status: roadmapProgress.status })
      .from(roadmapProgress)
      .where(
        and(
          eq(roadmapProgress.userId, userId),
          eq(roadmapProgress.roadmapId, active.id),
        ),
      );
    for (const row of rows) {
      if (row.status === "completed") completedIds.add(row.nodeId);
    }
  }

  const fromNodes: string[] = [];
  for (const node of asNodes(active?.nodes)) {
    if (!completedIds.has(node.id)) continue;
    fromNodes.push(node.title, ...(node.skills || []), ...(node.topics || []));
  }

  const studentSkills = uniqueSkillLabels([
    ...(Array.isArray(profile?.skills) ? profile.skills : []),
    ...((roadmap?.knownSkills ?? []) as unknown[]),
    ...fromNodes,
  ]);

  return {
    targetRole: roadmap?.targetRole ?? null,
    careerGoal: roadmap?.careerGoal ?? null,
    cri: profile?.cri ?? 0,
    criMilli: profile?.criMilli ?? 0,
    studentSkills,
  };
}

export async function applyCareerChange(
  userId: string,
  rawRole: string,
): Promise<CareerChangeResult> {
  const canonical = findRoleByName(rawRole)?.name || rawRole.trim();
  const current = await loadCareerPayload(userId);
  const previousRole = current.targetRole || current.careerGoal || null;

  if (previousRole && previousRole.toLowerCase() === canonical.toLowerCase()) {
    throw AppError.badRequest("That is already your current career.");
  }

  const preview = previewCareerCri(current.studentSkills, canonical);
  const now = new Date();
  const db = getDb();

  const [existingProfile] = await db
    .select({ additionalData: profiles.additionalData })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  const prevMeta = parseOnboardingMeta(existingProfile?.additionalData);
  const additionalData = {
    ...(existingProfile?.additionalData ?? {}),
    onboarding: {
      ...(prevMeta ?? { version: 1 }),
      careerPath: "decided" as const,
      targetRole: canonical,
      careerSkipped: false,
      skipped: false,
    },
  };

  await db
    .update(profiles)
    .set({
      additionalData,
      updatedAt: now,
    })
    .where(eq(profiles.userId, userId));

  await db
    .insert(roadmapProfiles)
    .values({
      userId,
      targetRole: canonical,
      careerGoal: canonical,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: roadmapProfiles.userId,
      set: {
        targetRole: canonical,
        careerGoal: canonical,
        updatedAt: now,
      },
    });

  await deactivateActiveRoadmaps(db, userId);

  const recomputed = await recomputeCri(userId, "career", now.getTime());

  await recordCareerGoalChange({
    userId,
    previousGoal: previousRole,
    newGoal: canonical,
    reason: preview.startsFromBeginning
      ? `Career changed to ${canonical}. No matching skills — CRI recalculated from evidence (now ${recomputed.criMilli / 1000}%).`
      : `Career changed to ${canonical}. CRI recalculated from evidence (${current.criMilli} → ${recomputed.criMilli} milli).`,
  }).catch(() => null);

  return {
    targetRole: canonical,
    careerGoal: canonical,
    cri: recomputed.cri,
    criMilli: recomputed.criMilli,
    studentSkills: current.studentSkills,
    previousRole,
    previousCri: current.cri,
    matchedSkills: preview.matchedSkills,
    startsFromBeginning: preview.startsFromBeginning,
  };
}
