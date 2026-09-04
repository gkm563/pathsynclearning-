import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { memories } from "@/lib/db/schema";
import type { MemoryType, MemoryVisibility } from "@/lib/memory/types";

export type CreateMemoryInput = {
  userId: string;
  type: MemoryType | string;
  title: string;
  description?: string | null;
  occurredAt?: Date;
  sourceType?: string | null;
  sourceId?: string | null;
  visibility?: MemoryVisibility;
  metadata?: Record<string, unknown>;
};

/** Create or update a memory for a given source (idempotent when source is set). */
export async function createMemory(input: CreateMemoryInput) {
  const db = getDb();
  const occurredAt = input.occurredAt ?? new Date();
  const visibility = input.visibility ?? "private";
  const metadata = input.metadata ?? {};

  if (input.sourceType && input.sourceId) {
    const [existing] = await db
      .select()
      .from(memories)
      .where(
        and(
          eq(memories.userId, input.userId),
          eq(memories.sourceType, input.sourceType),
          eq(memories.sourceId, input.sourceId),
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(memories)
        .set({
          type: input.type,
          title: input.title,
          description: input.description ?? existing.description,
          occurredAt,
          visibility,
          metadata: { ...existing.metadata, ...metadata },
          updatedAt: new Date(),
        })
        .where(eq(memories.id, existing.id))
        .returning();
      return updated;
    }
  }

  const [row] = await db
    .insert(memories)
    .values({
      userId: input.userId,
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      occurredAt,
      sourceType: input.sourceType ?? null,
      sourceId: input.sourceId ?? null,
      visibility,
      metadata,
    })
    .returning();

  return row;
}

export async function getMemoryById(userId: string, memoryId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(memories)
    .where(and(eq(memories.id, memoryId), eq(memories.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function deleteMemory(userId: string, memoryId: string) {
  const db = getDb();
  const deleted = await db
    .delete(memories)
    .where(and(eq(memories.id, memoryId), eq(memories.userId, userId)))
    .returning({ id: memories.id });
  return deleted[0] ?? null;
}

export async function countMemoriesByTypes(userId: string, types: string[]) {
  if (types.length === 0) return 0;
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(memories)
    .where(and(eq(memories.userId, userId), inArray(memories.type, types)));
  return Number(row?.count) || 0;
}

export async function listRecentMemories(userId: string, limit = 50) {
  const db = getDb();
  return db
    .select()
    .from(memories)
    .where(eq(memories.userId, userId))
    .orderBy(desc(memories.occurredAt))
    .limit(limit);
}
