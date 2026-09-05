import { and, desc, eq, ilike, lt, or, inArray, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { memories, notes } from "@/lib/db/schema";
import { FILTER_TO_TYPES } from "@/lib/memory/constants";
import {
  challengesSectionCondition,
  roadmapSectionCondition,
  sectionSqlCondition,
} from "@/lib/memory/sections";
import { hrefForSource } from "@/lib/memory/source-hrefs";
import {
  getMemorySettings,
  settingsAllowType,
} from "@/lib/memory/settings";
import { countNotes } from "@/lib/memory/notes";
import { getMilestones } from "@/lib/memory/milestones";
import type {
  MemoryFilter,
  MemorySection,
  MemoryStats,
  TimelineItem,
} from "@/lib/memory/types";

function toIso(d: Date | string) {
  return d instanceof Date ? d.toISOString() : new Date(d).toISOString();
}

function memoryToItem(row: typeof memories.$inferSelect): TimelineItem {
  const meta = row.metadata || {};
  const activitySourceType =
    row.type === "PERSONAL_NOTE" && typeof meta.sourceType === "string"
      ? (meta.sourceType as string)
      : row.sourceType;
  const activitySourceId =
    row.type === "PERSONAL_NOTE" && typeof meta.sourceId === "string"
      ? (meta.sourceId as string)
      : row.sourceId;

  return {
    id: row.id,
    kind: row.type === "PERSONAL_NOTE" ? "note" : row.type === "MILESTONE" ? "milestone" : "memory",
    type: row.type,
    title: row.title,
    description: row.description,
    occurredAt: toIso(row.occurredAt),
    sourceType: activitySourceType,
    sourceId: activitySourceId,
    visibility: row.visibility,
    metadata: {
      ...meta,
      memorySourceType: row.sourceType,
      memorySourceId: row.sourceId,
    },
    href:
      row.type === "PERSONAL_NOTE"
        ? hrefForSource(activitySourceType, activitySourceId) ||
          hrefForSource("note", row.sourceId)
        : hrefForSource(row.sourceType, row.sourceId),
    updatedAt: toIso(row.updatedAt),
  };
}

export async function getMemoryStats(userId: string): Promise<MemoryStats> {
  const db = getDb();
  const rows = await db
    .select({
      type: memories.type,
      count: sql<number>`count(*)::int`,
    })
    .from(memories)
    .where(eq(memories.userId, userId))
    .groupBy(memories.type);

  const byType = new Map(rows.map((r) => [r.type, Number(r.count) || 0]));
  const milestones = byType.get("MILESTONE") || 0;
  const skills =
    (byType.get("SKILL_UNLOCKED") || 0) +
    (byType.get("LEARNING_COMPLETED") || 0) +
    (byType.get("ROADMAP_NODE_COMPLETED") || 0);
  const projects = byType.get("PROJECT_COMPLETED") || 0;
  const achievements =
    (byType.get("ACHIEVEMENT") || 0) +
    (byType.get("CHALLENGE_COMPLETED") || 0) +
    (byType.get("CHALLENGE_PERSONAL_BEST") || 0) +
    (byType.get("CERTIFICATION") || 0) +
    (byType.get("HACKATHON") || 0);

  const notesCount = await countNotes(userId);
  const total = rows.reduce((acc, r) => acc + (Number(r.count) || 0), 0);

  const [roadmapRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(memories)
    .where(and(eq(memories.userId, userId), roadmapSectionCondition()));
  const [challengeRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(memories)
    .where(and(eq(memories.userId, userId), challengesSectionCondition()));

  const roadmap = Number(roadmapRow?.count) || 0;
  const challenges = Number(challengeRow?.count) || 0;

  return {
    milestones,
    skills,
    projects,
    achievements,
    notes: notesCount,
    total,
    sections: {
      roadmap,
      challenges,
      general: Math.max(0, total - roadmap - challenges),
    },
  };
}

export type TimelineQuery = {
  userId: string;
  section?: MemorySection | "all" | string;
  filter?: MemoryFilter | string;
  search?: string;
  cursor?: string | null;
  limit?: number;
};

export async function getMemoryTimeline(query: TimelineQuery): Promise<{
  items: TimelineItem[];
  nextCursor: string | null;
  stats: MemoryStats;
}> {
  const db = getDb();
  const limit = Math.min(Math.max(query.limit ?? 30, 1), 100);
  const settings = await getMemorySettings(query.userId);
  const filter = (query.filter || "all") as MemoryFilter;
  const search = query.search?.trim();

  const conditions = [eq(memories.userId, query.userId)];
  const sectionCond = sectionSqlCondition(query.section);
  if (sectionCond) conditions.push(sectionCond);

  if (query.cursor) {
    conditions.push(lt(memories.occurredAt, new Date(query.cursor)));
  }

  if (filter === "notes") {
    conditions.push(eq(memories.type, "PERSONAL_NOTE"));
  } else if (filter !== "all" && filter in FILTER_TO_TYPES) {
    const types = FILTER_TO_TYPES[filter as keyof typeof FILTER_TO_TYPES];
    conditions.push(inArray(memories.type, types));
  }

  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        ilike(memories.title, q),
        ilike(memories.description, q),
        sql`${memories.type} ILIKE ${q}`,
        sql`${memories.sourceType} ILIKE ${q}`,
        sql`(${memories.metadata})::text ILIKE ${q}`,
      )!,
    );
  }

  const rows = await db
    .select()
    .from(memories)
    .where(and(...conditions))
    .orderBy(desc(memories.occurredAt))
    .limit(limit + 1);

  const filtered = rows.filter((r) => {
    if (r.type === "PERSONAL_NOTE" && r.visibility === "private") {
      return settings.includePrivateNotes;
    }
    return settingsAllowType(settings, r.type);
  });

  const page = filtered.slice(0, limit);
  const hasMore = filtered.length > limit || rows.length > limit;
  const nextCursor =
    hasMore && page.length
      ? toIso(page[page.length - 1].occurredAt)
      : null;

  return {
    items: page.map(memoryToItem),
    nextCursor,
    stats: await getMemoryStats(query.userId),
  };
}

export async function getMemoryDetail(userId: string, memoryId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(memories)
    .where(and(eq(memories.id, memoryId), eq(memories.userId, userId)))
    .limit(1);
  if (!row) return null;

  const item = memoryToItem(row);
  let note = null;
  if (row.type === "PERSONAL_NOTE" && row.sourceId) {
    const [n] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, row.sourceId), eq(notes.userId, userId)))
      .limit(1);
    note = n ?? null;
  }

  return { ...item, note };
}

export async function exportJourney(userId: string) {
  const timeline = await getMemoryTimeline({
    userId,
    filter: "all",
    limit: 100,
  });
  const milestones = await getMilestones(userId);
  const settings = await getMemorySettings(userId);

  return {
    exportedAt: new Date().toISOString(),
    stats: timeline.stats,
    milestones,
    items: timeline.items.filter((i) => {
      if (i.kind === "note" && i.visibility === "private") {
        return settings.includePrivateNotes;
      }
      return true;
    }),
  };
}

/** Public recruiter-facing memories only. */
export async function getPublicMemories(userId: string, limit = 50) {
  const db = getDb();
  const rows = await db
    .select()
    .from(memories)
    .where(
      and(eq(memories.userId, userId), eq(memories.visibility, "public")),
    )
    .orderBy(desc(memories.occurredAt))
    .limit(limit);

  return rows
    .filter((r) => r.type !== "PERSONAL_NOTE" || r.visibility === "public")
    .map(memoryToItem);
}
