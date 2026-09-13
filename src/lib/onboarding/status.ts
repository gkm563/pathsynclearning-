import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { profiles, roadmaps } from "@/lib/db/schema";

export async function isStudentOnboardingPending(
  userId: string,
): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select({ completed: profiles.additionalCompleted })
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (row?.completed) return false;

  const [existingRoadmap] = await db
    .select({ id: roadmaps.id })
    .from(roadmaps)
    .where(eq(roadmaps.userId, userId))
    .limit(1);
  return !existingRoadmap;
}

