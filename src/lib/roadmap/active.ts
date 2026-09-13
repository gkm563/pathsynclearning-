import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { roadmaps } from "@/lib/db/schema";
import { AppError } from "@/lib/api/errors";

type Db = Awaited<ReturnType<typeof getDb>>;

/** Active roadmap for a user (newest if multiple somehow active). */
export async function getActiveRoadmap(db: Db, userId: string) {
  const [row] = await db
    .select()
    .from(roadmaps)
    .where(and(eq(roadmaps.userId, userId), eq(roadmaps.isActive, true)))
    .orderBy(desc(roadmaps.createdAt))
    .limit(1);
  return row ?? null;
}

export async function getOwnedRoadmap(db: Db, userId: string, roadmapId: string) {
  const [row] = await db
    .select()
    .from(roadmaps)
    .where(and(eq(roadmaps.id, roadmapId), eq(roadmaps.userId, userId)))
    .limit(1);
  return row ?? null;
}

/** Deactivate only currently active roadmaps for this user. Leaves inactive history alone. */
export async function deactivateActiveRoadmaps(db: Db, userId: string) {
  await db
    .update(roadmaps)
    .set({ isActive: false })
    .where(and(eq(roadmaps.userId, userId), eq(roadmaps.isActive, true)));
}

/**
 * Make `roadmapId` the sole active roadmap for the user.
 * Throws if the roadmap is missing or not owned.
 */
export async function setActiveRoadmap(db: Db, userId: string, roadmapId: string) {
  const [owned] = await db
    .select({ id: roadmaps.id })
    .from(roadmaps)
    .where(and(eq(roadmaps.id, roadmapId), eq(roadmaps.userId, userId)))
    .limit(1);

  if (!owned) {
    throw new AppError("NOT_FOUND", "Roadmap not found.");
  }

  await deactivateActiveRoadmaps(db, userId);

  const [updated] = await db
    .update(roadmaps)
    .set({ isActive: true })
    .where(and(eq(roadmaps.id, roadmapId), eq(roadmaps.userId, userId)))
    .returning();

  return updated;
}

/** Next version number for a user's roadmaps. */
export async function nextRoadmapVersion(db: Db, userId: string) {
  const [latest] = await db
    .select({ version: roadmaps.version })
    .from(roadmaps)
    .where(eq(roadmaps.userId, userId))
    .orderBy(desc(roadmaps.version))
    .limit(1);
  return (latest?.version ?? 0) + 1;
}
