import "server-only";

import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { roadmapProgress, roadmapStudyTasks } from "@/lib/db/schema";
import { isTrackableRoadmapNode } from "@/lib/roadmap/stats";
import type { RoadmapNode } from "@/types/roadmap";

export type StudyTaskStatus = "planned" | "done" | "backlog";

export type StudyTaskPublic = {
  id: string;
  nodeId: string;
  title: string;
  scheduledDate: string;
  sourceDate: string;
  estimatedMinutes: number;
  status: StudyTaskStatus;
  completedAt: string | null;
};

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Calendar day in Asia/Kolkata, matching Chaicode-style midnight rollover. */
export function istDateKey(at = new Date()): string {
  const shifted = new Date(at.getTime() + IST_OFFSET_MS);
  return shifted.toISOString().slice(0, 10);
}

function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d + days);
  return new Date(utc).toISOString().slice(0, 10);
}

export function parseWeeklyHours(raw: string | null | undefined): number {
  if (!raw) return 10;
  const nums = raw.match(/\d+(\.\d+)?/g);
  if (!nums?.length) return 10;
  const values = nums.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  if (!values.length) return 10;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function schedulableNodes(nodes: RoadmapNode[]): RoadmapNode[] {
  return nodes.filter(
    (n) =>
      isTrackableRoadmapNode(n) &&
      n.type !== "interview" &&
      n.gate !== "final_interview",
  );
}

function toPublic(row: typeof roadmapStudyTasks.$inferSelect): StudyTaskPublic {
  return {
    id: row.id,
    nodeId: row.nodeId,
    title: row.title,
    scheduledDate:
      typeof row.scheduledDate === "string"
        ? row.scheduledDate
        : String(row.scheduledDate),
    sourceDate:
      typeof row.sourceDate === "string" ? row.sourceDate : String(row.sourceDate),
    estimatedMinutes: row.estimatedMinutes,
    status: (row.status as StudyTaskStatus) || "planned",
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
  };
}

export async function seedStudyPlan(input: {
  userId: string;
  roadmapId: string;
  nodes: RoadmapNode[];
  weeklyHours: string | null | undefined;
}): Promise<void> {
  const db = getDb();
  const nodes = schedulableNodes(input.nodes);
  if (!nodes.length) return;

  const weekly = parseWeeklyHours(input.weeklyHours);
  const minutesPerWeekday = Math.max(45, Math.round((weekly * 60) / 5));
  let day = istDateKey();
  let used = 0;
  const rows = nodes.map((node) => {
    const minutes = Math.max(30, Math.round((Number(node.estimatedHours) || 1) * 60));
    if (used > 0 && used + minutes > minutesPerWeekday) {
      const date = new Date(`${day}T00:00:00Z`);
      const dow = date.getUTCDay();
      day = addDays(day, dow === 5 ? 3 : dow === 6 ? 2 : 1);
      used = 0;
    }
    used += minutes;
    return {
      id: crypto.randomUUID(),
      userId: input.userId,
      roadmapId: input.roadmapId,
      nodeId: node.id,
      title: node.title,
      scheduledDate: day,
      sourceDate: day,
      estimatedMinutes: minutes,
      status: "planned" as const,
    };
  });

  if (rows.length) {
    await db.insert(roadmapStudyTasks).values(rows);
  }
}

export async function rollMissedTasks(userId: string, roadmapId: string): Promise<void> {
  const db = getDb();
  const today = istDateKey();
  const rows = await db
    .select()
    .from(roadmapStudyTasks)
    .where(
      and(eq(roadmapStudyTasks.userId, userId), eq(roadmapStudyTasks.roadmapId, roadmapId)),
    );

  const overdue = rows.filter(
    (row) => row.status === "planned" && String(row.scheduledDate) < today,
  );
  for (const row of overdue) {
    await db
      .update(roadmapStudyTasks)
      .set({ status: "backlog", updatedAt: new Date() })
      .where(eq(roadmapStudyTasks.id, row.id));
  }
}

export async function ensureStudyPlan(input: {
  userId: string;
  roadmapId: string;
  nodes: RoadmapNode[];
  weeklyHours: string | null | undefined;
}): Promise<void> {
  const db = getDb();
  const existing = await db
    .select({ id: roadmapStudyTasks.id })
    .from(roadmapStudyTasks)
    .where(
      and(
        eq(roadmapStudyTasks.userId, input.userId),
        eq(roadmapStudyTasks.roadmapId, input.roadmapId),
      ),
    )
    .limit(1);
  if (!existing.length) {
    await seedStudyPlan(input);
  }
  await rollMissedTasks(input.userId, input.roadmapId);
}

export async function listStudyPlan(userId: string, roadmapId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(roadmapStudyTasks)
    .where(and(eq(roadmapStudyTasks.userId, userId), eq(roadmapStudyTasks.roadmapId, roadmapId)));
  return rows.map(toPublic);
}

export async function completeStudyTask(input: {
  userId: string;
  roadmapId: string;
  taskId: string;
}): Promise<StudyTaskPublic | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(roadmapStudyTasks)
    .where(
      and(
        eq(roadmapStudyTasks.id, input.taskId),
        eq(roadmapStudyTasks.userId, input.userId),
        eq(roadmapStudyTasks.roadmapId, input.roadmapId),
      ),
    )
    .limit(1);
  if (!row) return null;

  const now = new Date();
  const [updated] = await db
    .update(roadmapStudyTasks)
    .set({ status: "done", completedAt: now, updatedAt: now })
    .where(eq(roadmapStudyTasks.id, row.id))
    .returning();

  const [progress] = await db
    .select()
    .from(roadmapProgress)
    .where(
      and(
        eq(roadmapProgress.userId, input.userId),
        eq(roadmapProgress.roadmapId, input.roadmapId),
        eq(roadmapProgress.nodeId, row.nodeId),
      ),
    )
    .limit(1);
  if (progress && progress.status !== "completed" && progress.status !== "skipped") {
    await db
      .update(roadmapProgress)
      .set({
        status: progress.status === "locked" ? "in_progress" : "in_progress",
        updatedAt: now,
      })
      .where(eq(roadmapProgress.id, progress.id));
  }

  return updated ? toPublic(updated) : null;
}

export function summarizePlan(tasks: StudyTaskPublic[]) {
  const today = istDateKey();
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const backlog = tasks.filter((t) => t.status === "backlog");
  const todayTasks = tasks.filter((t) => t.scheduledDate === today && t.status !== "backlog");
  const upcoming = tasks.filter((t) => t.scheduledDate > today && t.status === "planned");
  const lastDate = tasks.reduce((max, t) => (t.scheduledDate > max ? t.scheduledDate : max), today);
  const daysLeft = Math.max(
    0,
    Math.round((Date.parse(`${lastDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000),
  );
  const todayDone = todayTasks.filter((t) => t.status === "done").length;
  const todayMissed = tasks.filter(
    (t) => t.sourceDate === today && t.status === "backlog",
  ).length;
  return {
    today,
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
    daysLeft,
    backlogCount: backlog.length,
    todayRemaining: todayTasks.filter((t) => t.status !== "done").length,
    todayDone,
    todayMissed,
    todayTasks,
    backlog,
    upcoming,
  };
}
