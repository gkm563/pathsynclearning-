import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { milestones } from "@/lib/db/schema";
import { MILESTONE_DEFS } from "@/lib/memory/constants";
import { createMemory } from "@/lib/memory/memories";
import type { MilestoneType } from "@/lib/memory/types";

export async function createMilestone(input: {
  userId: string;
  type: MilestoneType | string;
  title?: string;
  description?: string | null;
  occurredAt?: Date;
  sourceType?: string | null;
  sourceId?: string | null;
}) {
  const db = getDb();
  const def = MILESTONE_DEFS[input.type];
  const title = input.title ?? def?.title ?? input.type;
  const description = input.description ?? def?.description ?? null;

  const [existing] = await db
    .select()
    .from(milestones)
    .where(and(eq(milestones.userId, input.userId), eq(milestones.type, input.type)))
    .limit(1);

  if (existing) return existing;

  const [row] = await db
    .insert(milestones)
    .values({
      userId: input.userId,
      type: input.type,
      title,
      description,
      occurredAt: input.occurredAt ?? new Date(),
      sourceType: input.sourceType ?? null,
      sourceId: input.sourceId ?? null,
    })
    .onConflictDoNothing()
    .returning();

  const milestone = row;
  if (!milestone) {
    const [again] = await db
      .select()
      .from(milestones)
      .where(and(eq(milestones.userId, input.userId), eq(milestones.type, input.type)))
      .limit(1);
    return again;
  }

  await createMemory({
    userId: input.userId,
    type: "MILESTONE",
    title: milestone.title,
    description: milestone.description,
    occurredAt: milestone.occurredAt,
    sourceType: "achievement",
    sourceId: milestone.id,
    visibility: "public",
    metadata: {
      milestoneType: milestone.type,
      emoji: def?.emoji,
    },
  });

  return milestone;
}

export async function getMilestones(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.userId, userId))
    .orderBy(desc(milestones.occurredAt));
}

export async function hasMilestone(userId: string, type: string) {
  const db = getDb();
  const [row] = await db
    .select({ id: milestones.id })
    .from(milestones)
    .where(and(eq(milestones.userId, userId), eq(milestones.type, type)))
    .limit(1);
  return Boolean(row);
}
