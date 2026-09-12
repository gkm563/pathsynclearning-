import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import {
  interviewReports,
  interviewSessions,
  interviewTurns,
} from "@/lib/db/schema";
import { getActiveRoadmap } from "@/lib/roadmap/active";
import { buildInterviewPlan } from "./interview-plan";
import { createInterviewRoom, isLiveKitConfigured, livekitWsUrl } from "./interview-livekit";
import { runInterviewOpening, runInterviewTurn, scoreInterview } from "./interview-engine";
import {
  briefingReminder,
  isStartInterviewPhrase,
  nextVarietySeed,
  pickQuestionAngle,
} from "./interview-variety";
import type {
  InterviewIntegrityEvent,
  InterviewMode,
  InterviewPlan,
  InterviewReportPublic,
  InterviewSessionPublic,
  InterviewSessionSummary,
  InterviewStatus,
  InterviewTrack,
  InterviewTurnPublic,
} from "./interview-types";

function asPlan(raw: unknown): InterviewPlan {
  const plan = (raw && typeof raw === "object" ? raw : {}) as InterviewPlan;
  return {
    ...plan,
    phase: plan.phase === "live" || plan.phase === "briefing" ? plan.phase : undefined,
    varietySeed: typeof plan.varietySeed === "number" ? plan.varietySeed : 1,
    askedAngles: Array.isArray(plan.askedAngles)
      ? plan.askedAngles.filter((item): item is string => typeof item === "string")
      : [],
  };
}

function resolvePhase(plan: InterviewPlan, studentMessages: string[]): "briefing" | "live" {
  if (plan.phase === "live") return "live";
  if (plan.phase === "briefing") return "briefing";
  if (studentMessages.some(isStartInterviewPhrase) || studentMessages.length > 0) return "live";
  return "briefing";
}

async function savePlan(sessionId: string, plan: InterviewPlan) {
  const db = getDb();
  await db
    .update(interviewSessions)
    .set({ plan, updatedAt: new Date() })
    .where(eq(interviewSessions.id, sessionId));
}

function asIntegrity(raw: unknown): InterviewIntegrityEvent[] {
  return Array.isArray(raw) ? (raw as InterviewIntegrityEvent[]) : [];
}

function toTurn(row: typeof interviewTurns.$inferSelect): InterviewTurnPublic {
  return {
    id: row.id,
    role: row.role as InterviewTurnPublic["role"],
    content: row.content,
    source: row.source === "voice" ? "voice" : "text",
    createdAt: row.createdAt.toISOString(),
  };
}

function toSession(
  row: typeof interviewSessions.$inferSelect,
  turns: InterviewTurnPublic[],
): InterviewSessionPublic {
  return {
    id: row.id,
    status: row.status as InterviewStatus,
    track: row.track as InterviewTrack,
    mode: row.mode as InterviewMode,
    targetRole: row.targetRole,
    targetCompany: row.targetCompany,
    durationMinutes: row.durationMinutes,
    livekitRoom: row.livekitRoom,
    livekitUrl: livekitWsUrl(),
    livekitConfigured: isLiveKitConfigured(),
    plan: asPlan(row.plan),
    integrity: asIntegrity(row.integrity),
    codeSnapshot: row.codeSnapshot,
    startedAt: row.startedAt.toISOString(),
    endedAt: row.endedAt ? row.endedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    turns,
  };
}

export async function listInterviewSessions(userId: string): Promise<InterviewSessionSummary[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: interviewSessions.id,
      status: interviewSessions.status,
      track: interviewSessions.track,
      mode: interviewSessions.mode,
      targetRole: interviewSessions.targetRole,
      targetCompany: interviewSessions.targetCompany,
      durationMinutes: interviewSessions.durationMinutes,
      createdAt: interviewSessions.createdAt,
      overall: interviewReports.overall,
    })
    .from(interviewSessions)
    .leftJoin(interviewReports, eq(interviewReports.sessionId, interviewSessions.id))
    .where(eq(interviewSessions.userId, userId))
    .orderBy(desc(interviewSessions.createdAt))
    .limit(40);

  return rows.map((r) => ({
    id: r.id,
    status: r.status as InterviewStatus,
    track: r.track as InterviewTrack,
    mode: r.mode as InterviewMode,
    targetRole: r.targetRole,
    targetCompany: r.targetCompany,
    durationMinutes: r.durationMinutes,
    overall: r.overall ?? null,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createInterviewSession(input: {
  userId: string;
  studentName: string;
  track: InterviewTrack;
  mode: InterviewMode;
  targetRole?: string;
  targetCompany?: string | null;
  durationMinutes?: 15 | 20 | 30;
}): Promise<InterviewSessionPublic> {
  const db = getDb();
  const roadmap = await getActiveRoadmap(db, input.userId);
  const targetRole =
    input.targetRole?.trim() || roadmap?.targetRole || "Software Engineer intern";
  const targetCompany =
    input.targetCompany === undefined
      ? roadmap?.targetCompany ?? null
      : input.targetCompany;
  const durationMinutes = input.durationMinutes ?? 20;
  const plan = buildInterviewPlan({
    track: input.track,
    targetRole,
    targetCompany,
    durationMinutes,
    studentName: input.studentName,
  });

  const [row] = await db
    .insert(interviewSessions)
    .values({
      userId: input.userId,
      status: "live",
      track: input.track,
      mode: input.mode,
      targetRole,
      targetCompany,
      durationMinutes,
      plan,
    })
    .returning();

  const roomName = `interview-${row.id}`;
  try {
    await createInterviewRoom({
      roomName,
      metadata: JSON.stringify({
        sessionId: row.id,
        instructions: plan.instructions,
        studentName: input.studentName,
        targetRole,
        targetCompany,
        durationMinutes,
        coding: plan.coding,
      }),
      emptyTimeoutSec: (durationMinutes + 15) * 60,
    });
    await db
      .update(interviewSessions)
      .set({ livekitRoom: roomName, updatedAt: new Date() })
      .where(eq(interviewSessions.id, row.id));
    row.livekitRoom = roomName;
  } catch (err) {
    console.warn(
      "[interview] LiveKit room create failed; text/voice fallback still works:",
      err instanceof Error ? err.message : err,
    );
  }

  return toSession(row, []);
}

async function loadOwned(userId: string, sessionId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(interviewSessions)
    .where(and(eq(interviewSessions.id, sessionId), eq(interviewSessions.userId, userId)))
    .limit(1);
  if (!row) throw AppError.notFound("Interview not found");
  return row;
}

export async function getInterviewSession(
  userId: string,
  sessionId: string,
): Promise<InterviewSessionPublic> {
  const row = await loadOwned(userId, sessionId);
  const db = getDb();
  const turns = await db
    .select()
    .from(interviewTurns)
    .where(eq(interviewTurns.sessionId, sessionId))
    .orderBy(interviewTurns.createdAt)
    .limit(120);
  return toSession(row, turns.map(toTurn));
}

export async function appendInterviewTurn(input: {
  sessionId: string;
  role: "interviewer" | "student";
  content: string;
  source?: "text" | "voice";
}) {
  const db = getDb();
  const [row] = await db
    .insert(interviewTurns)
    .values({
      sessionId: input.sessionId,
      role: input.role,
      content: input.content.slice(0, 8000),
      source: input.source || "text",
    })
    .returning();
  return toTurn(row);
}

export async function studentInterviewTurn(input: {
  userId: string;
  sessionId: string;
  message: string;
  source: "text" | "voice";
}) {
  const row = await loadOwned(input.userId, input.sessionId);
  if (row.status !== "live") throw AppError.conflict("This interview is already finished.");
  const elapsedSec = Math.max(
    0,
    Math.floor((Date.now() - row.startedAt.getTime()) / 1000),
  );
  const db = getDb();
  const prior = await db
    .select()
    .from(interviewTurns)
    .where(eq(interviewTurns.sessionId, input.sessionId))
    .orderBy(interviewTurns.createdAt)
    .limit(40);

  await appendInterviewTurn({
    sessionId: input.sessionId,
    role: "student",
    content: input.message,
    source: input.source,
  });

  let plan = asPlan(row.plan);
  const studentMessages = prior
    .filter((turn) => turn.role === "student")
    .map((turn) => turn.content);
  const phase = resolvePhase(plan, studentMessages);
  const history = prior.map((t) => ({ role: t.role, content: t.content }));

  let result;
  if (phase !== "live") {
    if (!isStartInterviewPhrase(input.message)) {
      result = {
        reply: briefingReminder(nextVarietySeed(plan.varietySeed + prior.length)),
        showCode: false,
        endInterview: false,
      };
    } else {
      const angle = pickQuestionAngle(plan.track, plan.varietySeed, plan.askedAngles);
      plan = {
        ...plan,
        phase: "live",
        askedAngles: [...plan.askedAngles, angle],
        varietySeed: nextVarietySeed(plan.varietySeed),
      };
      await savePlan(input.sessionId, plan);
      result = await runInterviewTurn({
        userId: input.userId,
        plan,
        studentName: "Candidate",
        elapsedSec,
        history,
        message: input.message,
        codeSnapshot: row.codeSnapshot,
        firstQuestion: true,
        questionAngle: angle,
      });
    }
  } else {
    const angle = pickQuestionAngle(
      plan.track,
      nextVarietySeed(plan.varietySeed + prior.length),
      plan.askedAngles,
    );
    result = await runInterviewTurn({
      userId: input.userId,
      plan,
      studentName: "Candidate",
      elapsedSec,
      history,
      message: input.message,
      codeSnapshot: row.codeSnapshot,
      questionAngle: angle,
    });
    if (!plan.askedAngles.includes(angle)) {
      plan = {
        ...plan,
        askedAngles: [...plan.askedAngles, angle].slice(-12),
        varietySeed: nextVarietySeed(plan.varietySeed),
      };
      await savePlan(input.sessionId, plan);
    }
  }

  const assistant = await appendInterviewTurn({
    sessionId: input.sessionId,
    role: "interviewer",
    content: result.reply,
    source: input.source,
  });

  if (result.endInterview) {
    await finishInterviewSession(input.userId, input.sessionId);
  }

  return {
    ...result,
    turn: assistant,
  };
}

/** First interviewer line — no student turn is stored. */
export async function beginInterviewOpening(userId: string, sessionId: string) {
  const row = await loadOwned(userId, sessionId);
  if (row.status !== "live") throw AppError.conflict("This interview is already finished.");
  const db = getDb();
  const prior = await db
    .select()
    .from(interviewTurns)
    .where(eq(interviewTurns.sessionId, sessionId))
    .limit(1);
  if (prior.length > 0) {
    return getInterviewSession(userId, sessionId);
  }

  const plan = asPlan(row.plan);
  const result = await runInterviewOpening({
    userId,
    plan,
    studentName: "Candidate",
  });

  await appendInterviewTurn({
    sessionId,
    role: "interviewer",
    content: result.reply,
    source: "voice",
  });

  return getInterviewSession(userId, sessionId);
}

export async function recordIntegrity(
  userId: string,
  sessionId: string,
  type: InterviewIntegrityEvent["type"],
) {
  const row = await loadOwned(userId, sessionId);
  const events = asIntegrity(row.integrity);
  events.push({ type, at: new Date().toISOString() });
  const db = getDb();
  await db
    .update(interviewSessions)
    .set({ integrity: events.slice(-80), updatedAt: new Date() })
    .where(eq(interviewSessions.id, sessionId));
}

export async function saveInterviewCode(userId: string, sessionId: string, code: string) {
  await loadOwned(userId, sessionId);
  const db = getDb();
  await db
    .update(interviewSessions)
    .set({ codeSnapshot: code.slice(0, 80_000), updatedAt: new Date() })
    .where(eq(interviewSessions.id, sessionId));
}

export async function abortInterviewSession(userId: string, sessionId: string) {
  const row = await loadOwned(userId, sessionId);
  if (row.status === "completed") return getInterviewSession(userId, sessionId);
  const db = getDb();
  await db
    .update(interviewSessions)
    .set({ status: "aborted", endedAt: new Date(), updatedAt: new Date() })
    .where(eq(interviewSessions.id, sessionId));
  return getInterviewSession(userId, sessionId);
}

export async function finishInterviewSession(userId: string, sessionId: string) {
  const row = await loadOwned(userId, sessionId);
  if (row.status === "completed") {
    return getInterviewReport(userId, sessionId);
  }
  const db = getDb();
  await db
    .update(interviewSessions)
    .set({ status: "scoring", updatedAt: new Date() })
    .where(eq(interviewSessions.id, sessionId));

  const turns = await db
    .select()
    .from(interviewTurns)
    .where(eq(interviewTurns.sessionId, sessionId))
    .orderBy(interviewTurns.createdAt);

  const transcript = turns
    .map((t) => `${t.role === "student" ? "Student" : "Interviewer"}: ${t.content}`)
    .join("\n");

  const scored = await scoreInterview({
    userId,
    plan: asPlan(row.plan),
    transcript,
    integrityCount: asIntegrity(row.integrity).filter((e) => e.type !== "tab_visible").length,
  });

  const [report] = await db
    .insert(interviewReports)
    .values({
      sessionId,
      overall: scored.overall,
      scores: scored.scores,
      summary: scored.summary,
      quotes: scored.quotes,
      nextPractice: scored.nextPractice,
      raw: scored.raw,
    })
    .onConflictDoUpdate({
      target: interviewReports.sessionId,
      set: {
        overall: scored.overall,
        scores: scored.scores,
        summary: scored.summary,
        quotes: scored.quotes,
        nextPractice: scored.nextPractice,
        raw: scored.raw,
      },
    })
    .returning();

  await db
    .update(interviewSessions)
    .set({ status: "completed", endedAt: new Date(), updatedAt: new Date() })
    .where(eq(interviewSessions.id, sessionId));

  return toReport(report);
}

function toReport(row: typeof interviewReports.$inferSelect): InterviewReportPublic {
  const scores = (row.scores || {}) as Record<string, number>;
  return {
    id: row.id,
    sessionId: row.sessionId,
    overall: row.overall,
    scores: {
      communication: Number(scores.communication) || 0,
      problemSolving: Number(scores.problemSolving) || 0,
      codeQuality: Number(scores.codeQuality) || 0,
      depth: Number(scores.depth) || 0,
    },
    summary: row.summary,
    quotes: Array.isArray(row.quotes)
      ? (row.quotes as Array<{ quote: string; note: string }>)
      : [],
    nextPractice: Array.isArray(row.nextPractice)
      ? (row.nextPractice as Array<{ label: string; href: string }>)
      : [],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getInterviewReport(
  userId: string,
  sessionId: string,
): Promise<InterviewReportPublic> {
  await loadOwned(userId, sessionId);
  const db = getDb();
  const [row] = await db
    .select()
    .from(interviewReports)
    .where(eq(interviewReports.sessionId, sessionId))
    .limit(1);
  if (!row) throw AppError.notFound("Report not ready yet");
  return toReport(row);
}

export async function appendInternalTurn(input: {
  sessionId: string;
  role: "interviewer" | "student";
  content: string;
  source: "text" | "voice";
}) {
  const db = getDb();
  const [session] = await db
    .select({ id: interviewSessions.id, status: interviewSessions.status })
    .from(interviewSessions)
    .where(eq(interviewSessions.id, input.sessionId))
    .limit(1);
  if (!session) throw AppError.notFound("Interview not found");
  if (session.status !== "live") return null;
  return appendInterviewTurn(input);
}
