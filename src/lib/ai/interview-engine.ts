import "server-only";
import { problemPath, routes } from "@/lib/routes";
import { callInterviewOllama } from "./interview-ollama";
import {
  INTERVIEW_SYSTEM_INSTRUCTION,
  buildInterviewOpeningPrompt,
  buildInterviewScorePrompt,
  buildInterviewTurnPrompt,
} from "./interview-prompt";
import { interviewerInvitedCode } from "./interview-code";
import type { InterviewPlan, InterviewTurnResult } from "./interview-types";

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
    `I'm your PathED interviewer for the ${input.plan.targetRole} practice loop. I'll keep this timed and conversational. When you are ready, say start interview.`;
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
      ? `Let's begin. For this ${input.plan.targetRole} round, I want your thinking on ${input.questionAngle}. Take it from the top.`
      : "Walk me through how you would start, and why you would choose that approach.");
  return {
    reply,
    showCode:
      Boolean(input.plan.coding) &&
      (Boolean((raw as TurnJson).show_code) ||
        interviewerInvitedCode(reply, input.plan.coding?.title)),
    endInterview: Boolean((raw as TurnJson).end_interview),
  };
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
};

function num(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export async function scoreInterview(input: {
  userId: string;
  plan: InterviewPlan;
  transcript: string;
  integrityCount: number;
}): Promise<{
  overall: number;
  scores: {
    communication: number;
    problemSolving: number;
    codeQuality: number;
    depth: number;
  };
  summary: string;
  quotes: Array<{ quote: string; note: string }>;
  nextPractice: Array<{ label: string; href: string }>;
  raw: Record<string, unknown>;
}> {
  const raw = await callInterviewOllama<ScoreJson>({
    prompt: buildInterviewScorePrompt(input),
    systemInstruction:
      "You write evidence-backed mock-interview reports for engineering students. JSON only.",
    maxTokens: 1200,
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
    const slug = input.plan.coding?.slug;
    if (slug) nextPractice.push({ label: `Practice ${input.plan.coding!.title}`, href: problemPath(slug) });
    nextPractice.push({ label: "Open your roadmap", href: routes.app.roadmap });
    nextPractice.push({ label: "Run another mock", href: routes.app.interview });
  }

  const scores = {
    communication: num(raw.communication, 60),
    problemSolving: num(raw.problemSolving, 60),
    codeQuality: num(raw.codeQuality, input.plan.coding ? 55 : 70),
    depth: num(raw.depth, 55),
  };
  const overall =
    num(raw.overall) ||
    Math.round(
      scores.communication * 0.25 +
        scores.problemSolving * 0.3 +
        scores.codeQuality * 0.2 +
        scores.depth * 0.25,
    );
  const summary =
    typeof raw.summary === "string" && raw.summary.trim()
      ? raw.summary.trim().slice(0, 1200)
      : "Solid practice round. Re-run the mock after drilling the weak topics below.";

  return {
    overall,
    scores,
    summary,
    quotes,
    nextPractice,
    raw: raw as Record<string, unknown>,
  };
}
