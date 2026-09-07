import "server-only";

import crypto from "crypto";
import { getDb } from "@/lib/db/client";
import {
  roadmaps,
  roadmapProgress,
  type RoadmapProfileRow,
} from "@/lib/db/schema";
import { generateRoadmap } from "@/lib/ai/roadmap-generator";
import { AppError } from "@/lib/api/errors";
import { computeInitialNodeStatus } from "@/lib/roadmap/progress";
import {
  deactivateActiveRoadmaps,
  nextRoadmapVersion,
} from "@/lib/roadmap/active";
import {
  companyOffersRole,
  roadmapTitleForTarget,
} from "@/lib/roadmap/hiring-catalog";
import {
  progressFor,
  type RoadmapGenerationProgress,
} from "@/lib/roadmap/generation-progress";
import type {
  ProjectEntry,
  RoadmapProfile,
  SkillConfidence,
} from "@/types/roadmap";

export function assertProfileReadyForGeneration(
  profile: RoadmapProfileRow | undefined,
  message = "Profile must include targetRole and at least 1 known skill.",
): asserts profile is RoadmapProfileRow {
  if (
    !profile ||
    !profile.targetRole ||
    !Array.isArray(profile.knownSkills) ||
    profile.knownSkills.length === 0
  ) {
    throw AppError.badRequest(message);
  }
}

export function toRoadmapProfile(row: RoadmapProfileRow): RoadmapProfile {
  return {
    currentStudy: row.currentStudy,
    yearSemester: row.yearSemester,
    academicBackground: row.academicBackground,
    enjoyedSubjects: row.enjoyedSubjects ?? [],
    struggledSubjects: row.struggledSubjects ?? [],
    careerGoal: row.careerGoal,
    targetRole: row.targetRole,
    targetCompany: row.targetCompany,
    knownSkills: (row.knownSkills ?? []) as SkillConfidence[],
    hasProjects: row.hasProjects,
    projects: (row.projects ?? []) as unknown as ProjectEntry[],
    experienceLevel: row.experienceLevel,
    wantToLearn: row.wantToLearn ?? [],
    learningMotivation: row.learningMotivation,
    weeklyHours: row.weeklyHours,
    projectVsLearning: row.projectVsLearning,
    learningStyles: row.learningStyles ?? [],
    targetTimeline: row.targetTimeline,
    topPriority: row.topPriority,
    aiFollowUpAnswers: row.aiFollowUpAnswers ?? {},
    completed: row.completed,
  };
}

/** Generate + persist a new active roadmap; previous active row is deactivated. */
export async function persistGeneratedRoadmap(
  userId: string,
  profile: RoadmapProfileRow,
  onProgress?: (p: RoadmapGenerationProgress) => void,
) {
  const db = getDb();
  onProgress?.(progressFor("profile"));
  if (profile.targetCompany) {
    onProgress?.(progressFor("hiring"));
    const pairing = companyOffersRole(profile.targetCompany, profile.targetRole);
    if (!pairing.ok) {
      throw AppError.badRequest(pairing.message);
    }
  } else {
    onProgress?.(progressFor("hiring", "Mapping the role curriculum…"));
  }

  const generatedData = await generateRoadmap(toRoadmapProfile(profile), userId, onProgress);
  onProgress?.(progressFor("save"));
  const newVersion = await nextRoadmapVersion(db, userId);

  await deactivateActiveRoadmaps(db, userId);

  const roadmapId = crypto.randomUUID();
  const [newRoadmap] = await db
    .insert(roadmaps)
    .values({
      id: roadmapId,
      userId,
      version: newVersion,
      title: roadmapTitleForTarget(
        generatedData.title,
        profile.targetRole,
        profile.targetCompany,
      ),
      targetRole: profile.targetRole ?? generatedData.targetRole,
      targetCompany: profile.targetCompany,
      estimatedWeeks: generatedData.estimatedWeeks,
      nodes: generatedData.nodes,
      edges: generatedData.edges,
      generatedFromProfile: profile as unknown as Record<string, unknown>,
      isActive: true,
      createdAt: new Date(),
    })
    .returning();

  const progressRows = generatedData.nodes.map((node) => ({
    id: crypto.randomUUID(),
    userId,
    roadmapId,
    nodeId: node.id,
    status: computeInitialNodeStatus(node.id, generatedData.edges),
    updatedAt: new Date(),
  }));

  if (progressRows.length > 0) {
    await db.insert(roadmapProgress).values(progressRows);
  }

  return newRoadmap;
}
