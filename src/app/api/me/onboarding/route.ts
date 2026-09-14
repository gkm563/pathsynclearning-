import { eq } from "drizzle-orm";
import { persistCopilotCompanion } from "@/lib/ai/copilot-companion-store";
import { AppError } from "@/lib/api/errors";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { profiles, roadmapProfiles, userSettings, users } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { recordCareerGoalChange } from "@/lib/memory/processor";
import { isStudentOnboardingPending } from "@/lib/onboarding/status";
import {
  deriveRoadmapFieldsFromAccount,
} from "@/lib/roadmap/hydrate-from-account";
import {
  EMPTY_ONBOARDING_CAREER,
  companionFromSettings,
  parseOnboardingMeta,
  type OnboardingMeta,
  type OnboardingStatus,
} from "@/lib/onboarding/types";
import { onboardingSaveSchema } from "@/lib/validation/schemas";

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

async function loadStatus(userId: string): Promise<OnboardingStatus> {
  const db = getDb();
  const [row] = await db
    .select({
      additionalCompleted: profiles.additionalCompleted,
      additionalData: profiles.additionalData,
      institute: profiles.institute,
      degree: profiles.degree,
      branch: profiles.branch,
      gradYear: profiles.gradYear,
      location: profiles.location,
      fullName: users.fullName,
    })
    .from(profiles)
    .innerJoin(users, eq(users.id, profiles.userId))
    .where(eq(profiles.userId, userId))
    .limit(1);

  const [settings] = await db
    .select({
      copilotName: userSettings.copilotName,
      copilotMemory: userSettings.copilotMemory,
      copilotMemorySource: userSettings.copilotMemorySource,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  const meta = parseOnboardingMeta(row?.additionalData);
  const pending = await isStudentOnboardingPending(userId);
  return {
    completed: !pending,
    basics: {
      fullName: asText(row?.fullName),
      institute: asText(row?.institute),
      degree: asText(row?.degree),
      branch: asText(row?.branch),
      gradYear: asText(row?.gradYear),
      location: asText(row?.location),
    },
    career: {
      path: meta?.careerPath ?? EMPTY_ONBOARDING_CAREER.path,
      targetRole: meta?.targetRole ?? "",
      interests: meta?.interests ?? [],
      workStyle: meta?.workStyle ?? "",
      strengths: meta?.strengths ?? [],
      outcome: meta?.outcome ?? "",
      followUps: meta?.followUps ?? {},
    },
    companion: companionFromSettings(settings ?? null),
  };
}

export async function GET() {
  try {
    const user = await requireDbUser();
    if (user.role !== "student") throw AppError.forbidden();
    const status = await loadStatus(user.id);
    return jsonResponse(status);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    if (user.role !== "student") throw AppError.forbidden();
    const body = await parseJson(request, onboardingSaveSchema);
    const db = getDb();
    const now = new Date();

    const [existing] = await db
      .select({
        additionalData: profiles.additionalData,
        institute: profiles.institute,
        degree: profiles.degree,
        branch: profiles.branch,
        gradYear: profiles.gradYear,
        location: profiles.location,
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    const prevMeta = parseOnboardingMeta(existing?.additionalData);
    const nextMeta: OnboardingMeta = {
      version: 1,
      careerPath:
        body.career?.path !== undefined
          ? body.career.path
          : (prevMeta?.careerPath ?? null),
      targetRole:
        body.career?.targetRole !== undefined
          ? body.career.targetRole
          : (prevMeta?.targetRole ?? null),
      interests: body.career?.interests ?? prevMeta?.interests ?? [],
      workStyle:
        body.career?.workStyle !== undefined
          ? body.career.workStyle
          : (prevMeta?.workStyle ?? null),
      strengths: body.career?.strengths ?? prevMeta?.strengths ?? [],
      outcome:
        body.career?.outcome !== undefined
          ? body.career.outcome
          : (prevMeta?.outcome ?? null),
      followUps: body.career?.followUps ?? prevMeta?.followUps ?? {},
      generateNow: false,
      skipped: false,
      careerSkipped: prevMeta?.careerSkipped === true,
    };

    if (body.skipCareer) {
      nextMeta.careerPath = null;
      nextMeta.targetRole = null;
      nextMeta.careerSkipped = true;
    } else if (body.career?.path) {
      nextMeta.careerSkipped = false;
    }

    if (body.action === "complete") {
      nextMeta.generateNow = body.generateRoadmap === true;
    } else if (body.action === "save") {
      nextMeta.generateNow = prevMeta?.generateNow === true;
    }

    if (body.companion) {
      await persistCopilotCompanion(user.id, {
        name: body.companion.name,
        skipName: body.companion.skipName === true,
        memoryText: body.companion.memoryText,
        memorySource: body.companion.memorySource ?? null,
      });
    }

    const profilePatch: Record<string, unknown> = {
      updatedAt: now,
      additionalData: {
        ...(existing?.additionalData ?? {}),
        onboarding: nextMeta,
      },
    };

    if (body.action === "complete") {
      profilePatch.additionalCompleted = true;
    }

    if (body.basics) {
      if (body.basics.institute !== undefined) {
        profilePatch.institute = body.basics.institute;
      }
      if (body.basics.degree !== undefined) {
        profilePatch.degree = body.basics.degree;
      }
      if (body.basics.branch !== undefined) {
        profilePatch.branch = body.basics.branch;
      }
      if (body.basics.gradYear !== undefined) {
        profilePatch.gradYear = body.basics.gradYear;
      }
      if (body.basics.location !== undefined) {
        profilePatch.location = body.basics.location;
      }
    }

    await db
      .update(profiles)
      .set(profilePatch)
      .where(eq(profiles.userId, user.id));

    if (body.basics?.fullName) {
      await db
        .update(users)
        .set({ fullName: body.basics.fullName, updatedAt: now })
        .where(eq(users.id, user.id));
    }

    const institute =
      body.basics?.institute !== undefined
        ? body.basics.institute
        : existing?.institute;
    const degree =
      body.basics?.degree !== undefined ? body.basics.degree : existing?.degree;
    const branch =
      body.basics?.branch !== undefined ? body.basics.branch : existing?.branch;
    const gradYear =
      body.basics?.gradYear !== undefined
        ? body.basics.gradYear
        : existing?.gradYear;
    const location =
      body.basics?.location !== undefined
        ? body.basics.location
        : existing?.location;

    const derived = deriveRoadmapFieldsFromAccount(
      {
        institute,
        degree,
        branch,
        gradYear,
        location,
        additionalData: { onboarding: nextMeta },
      },
      nextMeta,
    );

    const targetRole = derived.targetRole;
    const roadmapPatch: Record<string, unknown> = { updatedAt: now };
    if (targetRole) roadmapPatch.targetRole = targetRole;
    if (derived.careerGoal) roadmapPatch.careerGoal = derived.careerGoal;
    if (derived.currentStudy) roadmapPatch.currentStudy = derived.currentStudy;
    if (derived.yearSemester) roadmapPatch.yearSemester = derived.yearSemester;
    if (derived.academicBackground) {
      roadmapPatch.academicBackground = derived.academicBackground;
    }
    if (derived.enjoyedSubjects.length) {
      roadmapPatch.enjoyedSubjects = derived.enjoyedSubjects;
    }

    if (targetRole || derived.currentStudy) {
      const [prevRoadmap] = await db
        .select({
          careerGoal: roadmapProfiles.careerGoal,
          targetRole: roadmapProfiles.targetRole,
        })
        .from(roadmapProfiles)
        .where(eq(roadmapProfiles.userId, user.id))
        .limit(1);

      await db
        .insert(roadmapProfiles)
        .values({
          userId: user.id,
          ...roadmapPatch,
        })
        .onConflictDoUpdate({
          target: roadmapProfiles.userId,
          set: roadmapPatch,
        });

      const prevGoal = prevRoadmap?.targetRole || prevRoadmap?.careerGoal || null;
      if (targetRole && targetRole !== prevGoal) {
        await recordCareerGoalChange({
          userId: user.id,
          previousGoal: prevGoal,
          newGoal: targetRole,
        }).catch(() => null);
      }
    }

    const status = await loadStatus(user.id);
    return jsonResponse({
      ...status,
      generateRoadmap: nextMeta.generateNow,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
