import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { memorySettings } from "@/lib/db/schema";
import type { MemorySettingsDto } from "@/lib/memory/types";

const DEFAULTS: MemorySettingsDto = {
  includeLearning: true,
  includeProjects: true,
  includeAchievements: true,
  includeCertifications: true,
  includeMentorship: true,
  includeChallenges: true,
  includeEvents: true,
  includeCareer: true,
  includePrivateNotes: true,
  allowAiNotes: false,
};

export async function getMemorySettings(userId: string): Promise<MemorySettingsDto> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(memorySettings)
    .where(eq(memorySettings.userId, userId))
    .limit(1);

  if (!row) return { ...DEFAULTS };

  return {
    includeLearning: row.includeLearning,
    includeProjects: row.includeProjects,
    includeAchievements: row.includeAchievements,
    includeCertifications: row.includeCertifications,
    includeMentorship: row.includeMentorship,
    includeChallenges: row.includeChallenges,
    includeEvents: row.includeEvents,
    includeCareer: row.includeCareer,
    includePrivateNotes: row.includePrivateNotes,
    allowAiNotes: row.allowAiNotes,
  };
}

export async function updateMemorySettings(
  userId: string,
  patch: Partial<MemorySettingsDto>,
): Promise<MemorySettingsDto> {
  const db = getDb();
  const current = await getMemorySettings(userId);
  const next = { ...current, ...patch };

  await db
    .insert(memorySettings)
    .values({
      userId,
      ...next,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: memorySettings.userId,
      set: {
        ...next,
        updatedAt: new Date(),
      },
    });

  return next;
}

/** Map settings → which memory types should appear. */
export function settingsAllowType(
  settings: MemorySettingsDto,
  type: string,
): boolean {
  switch (type) {
    case "LEARNING_COMPLETED":
    case "ROADMAP_NODE_COMPLETED":
    case "SKILL_UNLOCKED":
      return settings.includeLearning;
    case "PROJECT_COMPLETED":
    case "COLLABORATION":
      return settings.includeProjects;
    case "CHALLENGE_COMPLETED":
    case "CHALLENGE_PERSONAL_BEST":
      return settings.includeChallenges;
    case "MENTORSHIP_SESSION":
      return settings.includeMentorship;
    case "ACHIEVEMENT":
    case "MILESTONE":
      return settings.includeAchievements;
    case "CERTIFICATION":
      return settings.includeCertifications;
    case "EVENT_ATTENDED":
    case "HACKATHON":
      return settings.includeEvents;
    case "CAREER_EVENT":
      return settings.includeCareer;
    case "PERSONAL_NOTE":
      return settings.includePrivateNotes;
    default:
      return true;
  }
}
