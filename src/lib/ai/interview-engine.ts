import "server-only";
import { problemPath, routes } from "@/lib/routes";
import { callInterviewOllama } from "./interview-ollama";
import {
  INTERVIEW_SYSTEM_INSTRUCTION,
  buildInterviewOpeningPrompt,
  buildInterviewScorePrompt,
  buildInterviewTurnPrompt,
} from "./interview-prompt";
import {
  blendInterviewOverall,
  interviewerClosedInterview,
  interviewerInvitedCode,
  studentAskedToEnd,
} from "./interview-code";
import type {
  InterviewNodeDiagnosis,
  InterviewOutcome,
  InterviewPlan,
  InterviewTurnResult,
} from "./interview-types";
import { actionFromTopicScore, ROADMAP_INTERVIEW_PASS_SCORE } from "@/lib/roadmap/certification";

type TurnJson = {
  reply?: unknown;
  show_code?: unknown;
  end_interview?: unknown;
};

function asReply(raw: unknown): string {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (!raw || typeof raw !== "object") return "";
  const rec = raw as TurnJson & Record<string, unknown>;
  const reply = rec.reply ?? rec.text ?? rec.message;
  return typeof reply === "string" ? reply.trim() : "";
}

export async function runInterviewOpening(input: {
  userId: string;
  plan: InterviewPlan;
  studentName: string;
}): Promise<InterviewTurnResult> {
  const raw = await callInterviewOllama<TurnJson>({
    prompt: buildInterviewOpeningPrompt(input),
    systemInstruction: INTERVIEW_SYSTEM_INSTRUCTION,
    maxTokens: 320,
    timeoutMs: 30000,
    temperature: 0.95,
  });
  const reply =
    asReply(raw) ||
    input.plan.targetRole?.trim()
      ? `I'm your PathED interviewer for the ${input.plan.targetRole} practice loop. I'll keep this timed and conversational. When you are ready, say start interview.`
      : "I'm your PathED interviewer. This is a general practice loop — no specific role or company was set. When you are ready, say start interview.";
  return {
    reply,
    showCode: false,
    endInterview: false,
  };
}

export async function runInterviewTurn(input: {
  userId: string;
  plan: InterviewPlan;
  studentName: string;
  elapsedSec: number;
  history: Array<{ role: string; content: string }>;
  message: string;
  codeSnapshot?: string | null;
  firstQuestion?: boolean;
  questionAngle?: string;
}): Promise<InterviewTurnResult> {
  const raw = await callInterviewOllama<TurnJson>({
    prompt: buildInterviewTurnPrompt(input),
    systemInstruction: INTERVIEW_SYSTEM_INSTRUCTION,
    maxTokens: 700,
    timeoutMs: 45000,
    temperature: input.firstQuestion ? 0.95 : 0.85,
  });
  const reply =
    asReply(raw) ||
    (input.firstQuestion && input.questionAngle
      ? `Let's begin. I want your thinking on ${input.questionAngle}. Take it from the top.`
      : "Walk me through how you would start, and why you would choose that approach.");
  return {
    reply,
    showCode:
      input.plan.track !== "behavioral" &&
      (Boolean((raw as TurnJson).show_code) ||
        interviewerInvitedCode(reply, input.plan.coding?.title)),
    endInterview: shouldEndInterview(input, reply, Boolean((raw as TurnJson).end_interview)),
  };
}

function replyLooksLikeOpenQuestion(reply: string): boolean {
  if (interviewerClosedInterview(reply)) return false;
  return /\?/.test(reply);
}

function shouldEndInterview(
  input: {
    plan: InterviewPlan;
    elapsedSec: number;
    history: Array<{ role: string; content: string }>;
    message: string;
    firstQuestion?: boolean;
  },
  reply: string,
  flagged: boolean,
): boolean {
  if (studentAskedToEnd(input.message)) return false;
  if (input.firstQuestion) return false;
  const studentTurns = input.history.filter((turn) => turn.role === "student").length;
  if (studentTurns < 2) return false;
  const wrapped = interviewerClosedInterview(reply);
  if (wrapped) return true;
  if (flagged && replyLooksLikeOpenQuestion(reply)) return false;
  return flagged;
}

type ScoreJson = {
  overall?: unknown;
  communication?: unknown;
  problemSolving?: unknown;
  codeQuality?: unknown;
  depth?: unknown;
  summary?: unknown;
  quotes?: unknown;
  nextPractice?: unknown;
  nodeDiagnoses?: unknown;
};

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function parseNodeDiagnoses(
  raw: unknown,
  plan: InterviewPlan,
): InterviewNodeDiagnosis[] {
  const coverage = plan.nodeCoverage || [];
  const byId = new Map(coverage.map((item) => [item.nodeId, item]));
  const byTitle = new Map(coverage.map((item) => [item.title.toLowerCase(), item]));
  const out: InterviewNodeDiagnosis[] = [];
  const seen = new Set<string>();
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const id = typeof rec.nodeId === "string" ? rec.nodeId.trim() : "";
      const title = typeof rec.title === "string" ? rec.title.trim() : "";
      const match = (id && byId.get(id)) || (title && byTitle.get(title.toLowerCase())) || null;
      if (!match || seen.has(match.nodeId)) continue;
      seen.add(match.nodeId);
      const score = num(rec.score, 40);
      out.push({
        nodeId: match.nodeId,
        title: match.title,
        score,
        weakness: typeof rec.weakness === "string" ? rec.weakness.trim().slice(0, 280) : "",
        action: actionFromTopicScore(score),
      });
    }
  }
  for (const item of coverage) {
    if (seen.has(item.nodeId)) continue;
    out.push({
      nodeId: item.nodeId,
      title: item.title,
      score: 40,
      weakness: "Not enough evidence in the interview to confirm this topic.",
      action: actionFromTopicScore(40),
    });
  }
  return out;
}

function studentTranscriptEmpty(transcript: string): boolean {
  const lines = transcript
    .split("\n")
    .filter((line) => /^Student:/i.test(line))
    .map((line) => line.replace(/^Student:\s*/i, "").trim())
    .filter((line) => line && !/^(start interview|begin|ready)$/i.test(line));
  return lines.join(" ").replace(/\s+/g, " ").trim().length < 20;
}

export async function scoreInterview(input: {
  userId: string;
  plan: InterviewPlan;
  transcript: string;
  integrityCount: number;
  codedInIde: boolean;
}): Promise<{
  overall: number;
  scores: {
    communication: number;
    problemSolving: number;
    codeQuality: number;
    depth: number;
  };
  codedInIde: boolean;
  summary: string;
  quotes: Array<{ quote: string; note: string }>;
  nextPractice: Array<{ label: string; href: string }>;
  nodeDiagnoses: InterviewNodeDiagnosis[];
  passed: boolean;
  outcome: InterviewOutcome | null;
  raw: Record<string, unknown>;
}> {
  const isFinal = input.plan.purpose === "roadmap_final";
  const emptyStudent = studentTranscriptEmpty(input.transcript);
  const raw = emptyStudent && isFinal
    ? ({} as ScoreJson)
    : await callInterviewOllama<ScoreJson>({
        prompt: buildInterviewScorePrompt(input),
        systemInstruction:
          "You write evidence-backed mock-interview reports for engineering students. JSON only.",
        maxTokens: isFinal ? 1800 : 1200,
        timeoutMs: 60000,
        temperature: 0.3,
      });

  const quotes: Array<{ quote: string; note: string }> = [];
  if (Array.isArray(raw.quotes)) {
    for (const item of raw.quotes.slice(0, 5)) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const quote = typeof rec.quote === "string" ? rec.quote.trim() : "";
      const note = typeof rec.note === "string" ? rec.note.trim() : "";
      if (quote) quotes.push({ quote: quote.slice(0, 280), note: note.slice(0, 200) });
    }
  }

  const nextPractice: Array<{ label: string; href: string }> = [];
  if (Array.isArray(raw.nextPractice)) {
    for (const item of raw.nextPractice.slice(0, 4)) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const label = typeof rec.label === "string" ? rec.label.trim() : "";
      const href = typeof rec.href === "string" ? rec.href.trim() : "";
      if (label && href.startsWith("/dashboard")) {
        nextPractice.push({ label: label.slice(0, 80), href: href.slice(0, 160) });
      }
    }
  }
  if (!nextPractice.length) {
    const slug = input.codedInIde ? input.plan.coding?.slug : undefined;
    if (slug) nextPractice.push({ label: `Practice ${input.plan.coding!.title}`, href: problemPath(slug) });
    nextPractice.push({ label: "Open your roadmap", href: routes.app.roadmap });
    nextPractice.push({ label: "Run another mock", href: routes.app.interview });
  }

  const scores = {
    communication: emptyStudent && isFinal ? 0 : num(raw.communication, 60),
    problemSolving: emptyStudent && isFinal ? 0 : num(raw.problemSolving, 60),
    codeQuality: input.codedInIde ? (emptyStudent && isFinal ? 0 : num(raw.codeQuality, 55)) : 0,
    depth: emptyStudent && isFinal ? 0 : num(raw.depth, 55),
  };
  let overall = emptyStudent && isFinal ? 0 : blendInterviewOverall(scores, input.codedInIde);
  const nodeDiagnoses = isFinal
    ? emptyStudent
      ? (input.plan.nodeCoverage || []).map((item) => ({
          nodeId: item.nodeId,
          title: item.title,
          score: 0,
          weakness: "No substantive answers were given.",
          action: "loop" as const,
        }))
      : parseNodeDiagnoses(raw.nodeDiagnoses, input.plan)
    : [];
  const passed = isFinal ? overall >= ROADMAP_INTERVIEW_PASS_SCORE : false;
  const outcome: InterviewOutcome | null = isFinal
    ? overall === 0 || emptyStudent
      ? "redesign"
      : passed
        ? "certified"
        : "remediate"
    : null;
  const summary =
    typeof raw.summary === "string" && raw.summary.trim()
      ? raw.summary.trim().slice(0, 1200)
      : emptyStudent && isFinal
        ? "No substantive answers were captured. The path will be rebuilt from foundations."
        : isFinal && passed
          ? "You demonstrated the curriculum. This roadmap is certified."
          : "Solid practice round. Re-run the mock after drilling the weak topics below.";

  return {
    overall,
    scores,
    codedInIde: input.codedInIde,
    summary,
    quotes,
    nextPractice,
    nodeDiagnoses,
    passed,
    outcome,
    raw: {
      ...(raw as Record<string, unknown>),
      codedInIde: input.codedInIde,
      passed,
      outcome,
      nodeDiagnoses,
    },
  };
}
