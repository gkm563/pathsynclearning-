import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import {
  interviewReports,
  interviewSessions,
  interviewTurns,
  roadmapProgress,
} from "@/lib/db/schema";
import { getOwnedRoadmap } from "@/lib/roadmap/active";
import { resolveInterviewCodingProblem } from "./interview-coding-match";
import {
  allTrackableNodesSatisfied,
  finalInterviewCoverage,
  interviewPresetFromRoadmap,
  studiedTopicsFromRoadmap,
} from "./interview-roadmap";
import { applyRoadmapInterviewOutcome } from "./roadmap-adapt";
import { parseCertificationStatus } from "@/lib/roadmap/certification";
import {
  countProctorViolations,
  isProctoringEnabled,
  MAX_PROCTOR_VIOLATIONS,
  PROCTOR_DEDUP_MS,
} from "@/lib/proctoring";
import { buildInterviewPlan } from "./interview-plan";
import { createInterviewRoom, isLiveKitConfigured, livekitWsUrl } from "./interview-livekit";
import { runInterviewOpening, runInterviewTurn, scoreInterview } from "./interview-engine";
import {
  interviewCodedInIde,
  interviewerInvitedCode,
  studentAskedToCheckCode,
  studentAskedToCode,
  studentAskedToEnd,
  studentConfirmedEnd,
  studentDeclinedEnd,
} from "./interview-code";
import {
  alreadyLiveNudge,
  briefingReminder,
  closingThanks,
  isStartInterviewPhrase,
  looksLikeStartNoise,
  nextVarietySeed,
  pickQuestionAngle,
} from "./interview-variety";
import type {
  InterviewDifficulty,
  InterviewDurationMinutes,
  InterviewIntegrityEvent,
  InterviewMode,
  InterviewNodeCoverage,
  InterviewOutcome,
  InterviewPlan,
  InterviewPurpose,
  InterviewStyle,
  InterviewReportPublic,
  InterviewSessionPublic,
  InterviewSessionSummary,
  InterviewStatus,
  InterviewTrack,
  InterviewTurnPublic,
} from "./interview-types";

function parseNodeCoverage(raw: unknown): InterviewNodeCoverage[] {
  if (!Array.isArray(raw)) return [];
  const out: InterviewNodeCoverage[] = [];
  for (const item of raw.slice(0, 40)) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const nodeId = typeof rec.nodeId === "string" ? rec.nodeId : "";
    const title = typeof rec.title === "string" ? rec.title : "";
    if (!nodeId || !title) continue;
    out.push({
      nodeId,
      title: title.slice(0, 140),
      topics: Array.isArray(rec.topics)
        ? rec.topics.filter((t): t is string => typeof t === "string").slice(0, 8)
        : [],
    });
  }
  return out;
}

function asPlan(raw: unknown): InterviewPlan {
  const plan = (raw && typeof raw === "object" ? raw : {}) as InterviewPlan;
  const purpose: InterviewPurpose = plan.purpose === "roadmap_final" ? "roadmap_final" : "practice";
  const topicCap = purpose === "roadmap_final" ? 40 : 20;
  return {
    ...plan,
    purpose,
    phase: plan.phase === "live" || plan.phase === "briefing" ? plan.phase : undefined,
    varietySeed: typeof plan.varietySeed === "number" ? plan.varietySeed : 1,
    askedAngles: Array.isArray(plan.askedAngles)
      ? plan.askedAngles.filter((item): item is string => typeof item === "string")
      : [],
    awaitingEndConfirm: Boolean(plan.awaitingEndConfirm),
    difficulty:
      plan.difficulty === "easy" || plan.difficulty === "hard" ? plan.difficulty : "medium",
    style:
      plan.style === "supportive" || plan.style === "strict" ? plan.style : "balanced",
    focus: typeof plan.focus === "string" ? plan.focus.slice(0, 120) : "",
    roadmapId: typeof plan.roadmapId === "string" ? plan.roadmapId : null,
    roadmapTitle: typeof plan.roadmapTitle === "string" ? plan.roadmapTitle : "",
    studiedTopics: Array.isArray(plan.studiedTopics)
      ? plan.studiedTopics.filter((item): item is string => typeof item === "string").slice(0, topicCap)
      : [],
    nodeCoverage: parseNodeCoverage(plan.nodeCoverage),
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
      startedAt: interviewSessions.startedAt,
      endedAt: interviewSessions.endedAt,
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
    startedAt: r.startedAt.toISOString(),
    endedAt: r.endedAt ? r.endedAt.toISOString() : null,
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
  durationMinutes?: InterviewDurationMinutes;
  difficulty?: InterviewDifficulty;
  style?: InterviewStyle;
  focus?: string;
  roadmapId?: string | null;
  purpose?: InterviewPurpose;
}): Promise<InterviewSessionPublic> {
  const db = getDb();
  const purpose: InterviewPurpose = input.purpose === "roadmap_final" ? "roadmap_final" : "practice";
  const selected = input.roadmapId
    ? await getOwnedRoadmap(db, input.userId, input.roadmapId)
    : null;
  if (input.roadmapId && !selected) {
    throw AppError.notFound("That roadmap was not found.");
  }
  if (purpose === "roadmap_final" && !selected) {
    throw AppError.badRequest("A roadmap is required for the certification interview.");
  }
  if (selected && (selected.certifiedAt || parseCertificationStatus(selected.certificationStatus) === "certified") && purpose === "roadmap_final") {
    throw AppError.conflict("This roadmap is already certified.");
  }
  const targetRole = selected
    ? input.targetRole?.trim() || selected.targetRole || ""
    : input.targetRole?.trim() || "";
  const targetCompany = selected
    ? input.targetCompany === undefined
      ? selected.targetCompany ?? null
      : input.targetCompany?.trim() || null
    : input.targetCompany?.trim() || null;
  let durationMinutes = input.durationMinutes ?? 20;
  if (purpose === "roadmap_final") {
    durationMinutes = durationMinutes === 30 ? 30 : 20;
  }
  let studiedTopics: string[] = [];
  let nodeCoverage: InterviewNodeCoverage[] = [];
  if (selected) {
    const progressRows = await db
      .select({
        nodeId: roadmapProgress.nodeId,
        status: roadmapProgress.status,
      })
      .from(roadmapProgress)
      .where(
        and(
          eq(roadmapProgress.userId, input.userId),
          eq(roadmapProgress.roadmapId, selected.id),
        ),
      );
    const progressByNode = new Map(
      progressRows.map((row) => [row.nodeId, row.status]),
    );
    if (purpose === "roadmap_final") {
      if (!allTrackableNodesSatisfied(selected.nodes, progressByNode)) {
        throw AppError.conflict(
          "Finish every node on this roadmap before the final interview.",
        );
      }
      nodeCoverage = finalInterviewCoverage(selected.nodes, progressByNode);
      studiedTopics = nodeCoverage.map((item) => item.title);
    } else {
      studiedTopics = studiedTopicsFromRoadmap(selected.nodes, progressByNode);
      if (!studiedTopics.length) {
        throw AppError.conflict(
          "This roadmap has no studied nodes yet. Complete or start a node, or pick None to customize.",
        );
      }
    }
    const preset = interviewPresetFromRoadmap(
      selected.nodes,
      progressByNode,
      selected.generatedFromProfile && typeof selected.generatedFromProfile === "object"
        ? selected.generatedFromProfile
        : null,
    );
    input = { ...input, track: preset.track, difficulty: preset.difficulty, focus: preset.focus };
  }
  const track = input.track;
  const difficulty = input.difficulty;
  const focus = input.focus;
  const plan = buildInterviewPlan({
    track,
    targetRole,
    targetCompany,
    durationMinutes,
    studentName: input.studentName,
    difficulty,
    style: input.style,
    focus,
    purpose,
    roadmapId: selected?.id ?? null,
    roadmapTitle: selected?.title,
    studiedTopics,
    nodeCoverage,
  });

  const [row] = await db
    .insert(interviewSessions)
    .values({
      userId: input.userId,
      status: "live",
      track,
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
  code?: string;
}) {
  const row = await loadOwned(input.userId, input.sessionId);
  if (row.status !== "live") throw AppError.conflict("This interview is already finished.");
  if (input.code != null) {
    await saveInterviewCode(input.userId, input.sessionId, input.code);
  }
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

  let plan = asPlan(row.plan);
  const studentMessages = prior
    .filter((turn) => turn.role === "student")
    .map((turn) => turn.content);
  const phase = resolvePhase(plan, studentMessages);
  const history = prior.map((t) => ({ role: t.role, content: t.content }));
  const codeSnapshot = input.code ?? row.codeSnapshot;
  const modelMessage = studentAskedToCheckCode(input.message)
    ? `[The candidate submitted the editor for review. Review the attached editor code. Never ask them to paste.] ${input.message}`
    : studentAskedToCode(input.message)
      ? `[The candidate wants to write code now. Invite them to implement the problem you were just discussing. Set show_code true. Do not switch to a different problem.] ${input.message}`
      : input.message;

  let result;
  if (phase === "live" && plan.awaitingEndConfirm) {
    await appendInterviewTurn({
      sessionId: input.sessionId,
      role: "student",
      content: input.message,
      source: input.source,
    });
    if (studentDeclinedEnd(input.message)) {
      plan = { ...plan, awaitingEndConfirm: false };
      await savePlan(input.sessionId, plan);
      result = {
        reply: "No problem. We'll keep going — take the last question when you're ready.",
        showCode: false,
        endInterview: false,
      };
    } else if (studentConfirmedEnd(input.message) || studentAskedToEnd(input.message)) {
      plan = { ...plan, awaitingEndConfirm: false };
      await savePlan(input.sessionId, plan);
      result = {
        reply: closingThanks(plan.varietySeed),
        showCode: false,
        endInterview: true,
      };
    } else {
      result = {
        reply: "Just to confirm: do you want to end the interview? Say yes to finish, or no to continue.",
        showCode: false,
        endInterview: false,
      };
    }
  } else if (phase === "live" && studentAskedToEnd(input.message)) {
    await appendInterviewTurn({
      sessionId: input.sessionId,
      role: "student",
      content: input.message,
      source: input.source,
    });
    plan = { ...plan, awaitingEndConfirm: true };
    await savePlan(input.sessionId, plan);
    result = {
      reply: "Do you want to end the interview? Say yes to finish, or no to continue.",
      showCode: false,
      endInterview: false,
    };
  } else if (phase === "live" && looksLikeStartNoise(input.message)) {
    result = {
      reply: alreadyLiveNudge(),
      showCode: false,
      endInterview: false,
    };
  } else {
  await appendInterviewTurn({
    sessionId: input.sessionId,
    role: "student",
    content: input.message,
    source: input.source,
  });

  if (phase !== "live") {
    if (!isStartInterviewPhrase(input.message)) {
      result = {
        reply: briefingReminder(nextVarietySeed(plan.varietySeed + prior.length)),
        showCode: false,
        endInterview: false,
      };
    } else {
      const angle = pickQuestionAngle(
        plan.track,
        plan.varietySeed,
        plan.askedAngles,
        plan.studiedTopics,
      );
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
        message: modelMessage,
        codeSnapshot,
        firstQuestion: true,
        questionAngle: angle,
      });
    }
  } else {
    const angle = pickQuestionAngle(
      plan.track,
      nextVarietySeed(plan.varietySeed + prior.length),
      plan.askedAngles,
      plan.studiedTopics,
    );
    result = await runInterviewTurn({
      userId: input.userId,
      plan,
      studentName: "Candidate",
      elapsedSec,
      history,
      message: modelMessage,
      codeSnapshot,
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
  }

  const overtimeSec = elapsedSec - plan.durationMinutes * 60;
  if (!result.endInterview && phase === "live" && overtimeSec >= 8 * 60) {
    result = {
      reply: closingThanks(plan.varietySeed + prior.length),
      showCode: false,
      endInterview: true,
    };
  }

  const reviewingCode = studentAskedToCheckCode(input.message);
  const invitedCode =
    !result.endInterview &&
    !reviewingCode &&
    plan.track !== "behavioral" &&
    (result.showCode || interviewerInvitedCode(result.reply, plan.coding?.title));
  if (reviewingCode) {
    result = { ...result, showCode: false };
  }
  if (invitedCode) {
    const nextCoding = resolveInterviewCodingProblem({
      reply: result.reply,
      history,
      fallback: plan.coding,
    });
    if (nextCoding && nextCoding.slug !== plan.coding?.slug) {
      plan = { ...plan, coding: nextCoding };
      await savePlan(input.sessionId, plan);
      await saveInterviewCode(input.userId, input.sessionId, nextCoding.starterCode || "");
    }
    result = { ...result, showCode: true, coding: nextCoding ?? plan.coding };
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
  if (row.status !== "live" && row.status !== "scoring") {
    const events = asIntegrity(row.integrity);
    const violations = countProctorViolations(events);
    return {
      violations,
      failed: isProctoringEnabled() && violations >= MAX_PROCTOR_VIOLATIONS,
    };
  }
  const events = asIntegrity(row.integrity);
  const last = events[events.length - 1];
  const now = Date.now();
  if (
    last &&
    last.type === type &&
    now - new Date(last.at).getTime() < PROCTOR_DEDUP_MS
  ) {
    const violations = countProctorViolations(events);
    return {
      violations,
      failed: isProctoringEnabled() && violations >= MAX_PROCTOR_VIOLATIONS,
    };
  }
  events.push({ type, at: new Date().toISOString() });
  const db = getDb();
  await db
    .update(interviewSessions)
    .set({ integrity: events.slice(-80), updatedAt: new Date() })
    .where(eq(interviewSessions.id, sessionId));
  const violations = countProctorViolations(events);
  return {
    violations,
    failed: isProctoringEnabled() && violations >= MAX_PROCTOR_VIOLATIONS,
  };
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

function proctorFailReport() {
  return {
    overall: 0,
    scores: {
      communication: 0,
      problemSolving: 0,
      codeQuality: 0,
      depth: 0,
    },
    summary:
      "This interview ended because of too many proctoring violations (leaving fullscreen, switching tabs, or using the clipboard). Start a new attempt when you can stay in a single fullscreen window.",
    quotes: [] as Array<{ quote: string; note: string }>,
    nextPractice: [
      { label: "Try another interview", href: "/dashboard/interview" },
      { label: "Back to roadmap", href: "/dashboard/roadmap" },
    ],
    raw: {
      passed: false,
      outcome: null,
      proctorFailed: true,
      codedInIde: false,
      nodeDiagnoses: [],
    },
    outcome: null as InterviewOutcome | null,
  };
}

export async function finishInterviewSession(
  userId: string,
  sessionId: string,
  opts?: { proctorFailed?: boolean },
) {
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

  const plan = asPlan(row.plan);
  const integrity = asIntegrity(row.integrity);
  const proctorFailed =
    Boolean(opts?.proctorFailed) ||
    (isProctoringEnabled() &&
      countProctorViolations(integrity) >= MAX_PROCTOR_VIOLATIONS);

  const scored = proctorFailed
    ? proctorFailReport()
    : await scoreInterview({
        userId,
        plan,
        transcript,
        integrityCount: countProctorViolations(integrity),
        codedInIde: interviewCodedInIde({
          turns: turns.map((turn) => ({ role: turn.role, content: turn.content })),
          codeSnapshot: row.codeSnapshot,
          starterCode: plan.coding?.starterCode,
        }),
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

  if (
    !proctorFailed &&
    plan.purpose === "roadmap_final" &&
    plan.roadmapId &&
    scored.outcome
  ) {
    try {
      await applyRoadmapInterviewOutcome({
        userId,
        roadmapId: plan.roadmapId,
        sessionId,
        overall: scored.overall,
        outcome: scored.outcome,
        summary: scored.summary,
      });
    } catch (err) {
      console.warn(
        "[interview] roadmap certification update failed",
        err instanceof Error ? err.message : err,
      );
    }
  }

  return toReport(report);
}

function toReport(row: typeof interviewReports.$inferSelect): InterviewReportPublic {
  const scores = (row.scores || {}) as Record<string, unknown>;
  const raw = (row.raw || {}) as Record<string, unknown>;
  const outcome: InterviewOutcome | null =
    raw.outcome === "certified" || raw.outcome === "remediate" || raw.outcome === "redesign"
      ? raw.outcome
      : null;
  const nodeDiagnoses = Array.isArray(raw.nodeDiagnoses)
    ? (raw.nodeDiagnoses as InterviewReportPublic["nodeDiagnoses"])
    : [];
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
    codedInIde: Boolean(raw.codedInIde ?? scores.codedInIde),
    summary: row.summary,
    quotes: Array.isArray(row.quotes)
      ? (row.quotes as Array<{ quote: string; note: string }>)
      : [],
    nextPractice: Array.isArray(row.nextPractice)
      ? (row.nextPractice as Array<{ label: string; href: string }>)
      : [],
    createdAt: row.createdAt.toISOString(),
    passed: Boolean(raw.passed),
    outcome,
    nodeDiagnoses,
    adaptationStatus: outcome && outcome !== "certified" ? "pending" : "idle",
    proctorFailed: Boolean(raw.proctorFailed),
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
