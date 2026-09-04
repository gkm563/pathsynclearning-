import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { challengeAttempts, domainEvents } from "@/lib/db/schema";
import { createMemory } from "@/lib/memory/memories";
import { createMilestone, hasMilestone } from "@/lib/memory/milestones";
import type { DomainEventType, MemoryType } from "@/lib/memory/types";

export type EmitDomainEventInput = {
  userId: string;
  type: DomainEventType | string;
  sourceType?: string | null;
  sourceId?: string | null;
  payload?: Record<string, unknown>;
  occurredAt?: Date;
  /** Process into memories immediately (default true). */
  process?: boolean;
};

export async function emitDomainEvent(input: EmitDomainEventInput) {
  const db = getDb();
  const occurredAt = input.occurredAt ?? new Date();

  const [event] = await db
    .insert(domainEvents)
    .values({
      userId: input.userId,
      type: input.type,
      sourceType: input.sourceType ?? null,
      sourceId: input.sourceId ?? null,
      payload: input.payload ?? {},
      occurredAt,
      processedAt: input.process === false ? null : new Date(),
    })
    .returning();

  if (input.process !== false) {
    await processDomainEvent(event.id);
  }

  return event;
}

export async function processDomainEvent(eventId: string) {
  const db = getDb();
  const [event] = await db
    .select()
    .from(domainEvents)
    .where(eq(domainEvents.id, eventId))
    .limit(1);
  if (!event) return null;

  const payload = (event.payload || {}) as Record<string, unknown>;
  const title =
    (typeof payload.title === "string" && payload.title) ||
    event.type.replace(/_/g, " ");
  const description =
    typeof payload.description === "string" ? payload.description : null;

  let memoryType: MemoryType | string = event.type;
  switch (event.type) {
    case "LEARNING_COMPLETED":
    case "ROADMAP_NODE_COMPLETED":
      memoryType =
        event.type === "ROADMAP_NODE_COMPLETED"
          ? "ROADMAP_NODE_COMPLETED"
          : "LEARNING_COMPLETED";
      break;
    case "PROJECT_COMPLETED":
      memoryType = "PROJECT_COMPLETED";
      break;
    case "CHALLENGE_COMPLETED":
      memoryType = payload.isPersonalBest
        ? "CHALLENGE_PERSONAL_BEST"
        : "CHALLENGE_COMPLETED";
      break;
    case "MENTORSHIP_COMPLETED":
      memoryType = "MENTORSHIP_SESSION";
      break;
    case "HACKATHON_COMPLETED":
      memoryType = "HACKATHON";
      break;
    case "EVENT_ATTENDED":
      memoryType = "EVENT_ATTENDED";
      break;
    case "CERTIFICATION_EARNED":
      memoryType = "CERTIFICATION";
      break;
    case "CAREER_GOAL_CHANGED":
      memoryType = "CAREER_EVENT";
      break;
    case "ACHIEVEMENT_EARNED":
      memoryType = "ACHIEVEMENT";
      break;
    case "SKILL_UNLOCKED":
      memoryType = "SKILL_UNLOCKED";
      break;
    case "COLLABORATION_JOINED":
      memoryType = "COLLABORATION";
      break;
    default:
      break;
  }

  const memory = await createMemory({
    userId: event.userId,
    type: memoryType,
    title,
    description,
    occurredAt: event.occurredAt,
    sourceType: event.sourceType,
    sourceId: event.sourceId,
    visibility:
      typeof payload.visibility === "string" && payload.visibility === "public"
        ? "public"
        : "private",
    metadata: payload,
  });

  await maybeAwardMilestones(event.userId, event.type, event.sourceType, event.sourceId);

  await db
    .update(domainEvents)
    .set({ processedAt: new Date() })
    .where(eq(domainEvents.id, event.id));

  return memory;
}

async function maybeAwardMilestones(
  userId: string,
  eventType: string,
  sourceType: string | null,
  sourceId: string | null,
) {
  if (!(await hasMilestone(userId, "STARTED_JOURNEY"))) {
    await createMilestone({
      userId,
      type: "STARTED_JOURNEY",
      sourceType,
      sourceId,
    });
  }

  if (
    (eventType === "CHALLENGE_COMPLETED" ||
      eventType === "LEARNING_COMPLETED" ||
      eventType === "ROADMAP_NODE_COMPLETED") &&
    !(await hasMilestone(userId, "FIRST_CHALLENGE"))
  ) {
    if (eventType === "CHALLENGE_COMPLETED") {
      await createMilestone({
        userId,
        type: "FIRST_CHALLENGE",
        sourceType,
        sourceId,
      });
    }
  }

  if (
    (eventType === "LEARNING_COMPLETED" ||
      eventType === "ROADMAP_NODE_COMPLETED" ||
      eventType === "SKILL_UNLOCKED") &&
    !(await hasMilestone(userId, "FIRST_SKILL"))
  ) {
    await createMilestone({
      userId,
      type: "FIRST_SKILL",
      sourceType,
      sourceId,
    });
  }

  if (
    eventType === "PROJECT_COMPLETED" &&
    !(await hasMilestone(userId, "FIRST_PROJECT"))
  ) {
    await createMilestone({
      userId,
      type: "FIRST_PROJECT",
      sourceType,
      sourceId,
    });
  }

  if (
    eventType === "MENTORSHIP_COMPLETED" &&
    !(await hasMilestone(userId, "FIRST_MENTOR_SESSION"))
  ) {
    await createMilestone({
      userId,
      type: "FIRST_MENTOR_SESSION",
      sourceType,
      sourceId,
    });
  }

  if (
    eventType === "COLLABORATION_JOINED" &&
    !(await hasMilestone(userId, "FIRST_TEAM_PROJECT"))
  ) {
    await createMilestone({
      userId,
      type: "FIRST_TEAM_PROJECT",
      sourceType,
      sourceId,
    });
  }

  if (
    eventType === "HACKATHON_COMPLETED" &&
    !(await hasMilestone(userId, "FIRST_HACKATHON"))
  ) {
    await createMilestone({
      userId,
      type: "FIRST_HACKATHON",
      sourceType,
      sourceId,
    });
  }
}

/** Helper used by challenge attempt routes. */
export async function recordChallengeMemory(input: {
  userId: string;
  questionId: string;
  title: string;
  description?: string;
  difficulty?: string;
  score: number;
  category?: string;
  topics?: string[];
  xpAwarded?: number;
  challengeType?: string;
}) {
  const db = getDb();
  const priorScores = await db
    .select({ score: challengeAttempts.score })
    .from(challengeAttempts)
    .where(
      and(
        eq(challengeAttempts.userId, input.userId),
        eq(challengeAttempts.questionId, input.questionId),
        sql`${challengeAttempts.passed} = true`,
      ),
    );

  const previousBest =
    priorScores.length > 1
      ? Math.max(
          ...priorScores
            .slice(0, -1)
            .map((r) => Number(r.score) || 0),
        )
      : null;

  const isPersonalBest =
    previousBest != null && input.score > previousBest;

  return emitDomainEvent({
    userId: input.userId,
    type: "CHALLENGE_COMPLETED",
    sourceType: "challenge",
    sourceId: input.questionId,
    payload: {
      title: input.title,
      description: input.description ?? null,
      difficulty: input.difficulty,
      score: input.score,
      category: input.category,
      topics: input.topics ?? [],
      xpAwarded: input.xpAwarded,
      challengeType: input.challengeType,
      previousBest,
      isPersonalBest,
      ...(isPersonalBest && previousBest != null
        ? { personalBestLabel: "New Personal Best!" }
        : {}),
    },
  });
}

export async function recordProjectMemory(input: {
  userId: string;
  projectId: string;
  title: string;
  description?: string;
  score?: number | null;
  repoUrl?: string | null;
  technologies?: string[];
  skills?: string[];
  checklistPct?: number;
}) {
  return emitDomainEvent({
    userId: input.userId,
    type: "PROJECT_COMPLETED",
    sourceType: "project",
    sourceId: input.projectId,
    payload: {
      title: input.title,
      description: input.description ?? null,
      ...(input.score != null ? { score: input.score } : {}),
      ...(input.repoUrl ? { repository: input.repoUrl } : {}),
      ...(input.technologies?.length
        ? { technology: input.technologies }
        : {}),
      ...(input.skills?.length ? { skills: input.skills } : {}),
      ...(input.checklistPct != null
        ? { checklistPct: input.checklistPct }
        : {}),
      visibility: "public",
    },
  });
}

export async function recordLearningMemory(input: {
  userId: string;
  nodeId: string;
  roadmapId: string;
  title: string;
  description?: string;
  score?: number | null;
  assessmentType?: string;
}) {
  return emitDomainEvent({
    userId: input.userId,
    type: "ROADMAP_NODE_COMPLETED",
    sourceType: "roadmap_node",
    sourceId: input.nodeId,
    payload: {
      title: input.title,
      description: input.description ?? `Completed ${input.title}`,
      roadmapId: input.roadmapId,
      ...(input.score != null ? { score: input.score } : {}),
      ...(input.assessmentType ? { assessmentType: input.assessmentType } : {}),
    },
  });
}

export async function recordCareerGoalChange(input: {
  userId: string;
  previousGoal?: string | null;
  newGoal: string;
  reason?: string | null;
}) {
  return emitDomainEvent({
    userId: input.userId,
    type: "CAREER_GOAL_CHANGED",
    sourceType: "career",
    sourceId: "career_goal",
    payload: {
      title: "Career Goal Changed",
      description: input.reason ?? null,
      previousGoal: input.previousGoal ?? null,
      newGoal: input.newGoal,
    },
  });
}

export async function recordEventAttended(input: {
  userId: string;
  eventId: string;
  title?: string;
  kind?: string;
}) {
  const isHackathon =
    (input.kind || "").toLowerCase().includes("hack") ||
    (input.title || "").toLowerCase().includes("hackathon");

  return emitDomainEvent({
    userId: input.userId,
    type: isHackathon ? "HACKATHON_COMPLETED" : "EVENT_ATTENDED",
    sourceType: isHackathon ? "hackathon" : "event",
    sourceId: input.eventId,
    payload: {
      title: input.title || (isHackathon ? "Hackathon Participated" : "Event Attended"),
      description: null,
      eventId: input.eventId,
      kind: input.kind,
      visibility: "public",
    },
  });
}
