/** Shared AI interview types — safe for client and server. */

export type InterviewTrack = "dsa_behavioral" | "dsa" | "behavioral";
export type InterviewMode = "voice" | "text";
export type InterviewStatus = "live" | "scoring" | "completed" | "aborted";
export type InterviewTurnRole = "interviewer" | "student";

export type InterviewCodingProblem = {
  slug: string;
  title: string;
  difficulty: string;
  prompt: string;
  starterCode?: string;
};

export type InterviewPhase = "briefing" | "live";

export type InterviewPlan = {
  track: InterviewTrack;
  targetRole: string;
  targetCompany: string | null;
  durationMinutes: number;
  codingStartAfterMinutes: number;
  coding: InterviewCodingProblem | null;
  instructions: string;
  phase?: InterviewPhase;
  varietySeed: number;
  askedAngles: string[];
};

export type InterviewIntegrityEvent = {
  type: "tab_hidden" | "tab_visible" | "paste" | "fullscreen_exit";
  at: string;
};

export type InterviewTurnPublic = {
  id: string;
  role: InterviewTurnRole;
  content: string;
  source: "text" | "voice";
  createdAt: string;
};

export type InterviewSessionPublic = {
  id: string;
  status: InterviewStatus;
  track: InterviewTrack;
  mode: InterviewMode;
  targetRole: string;
  targetCompany: string | null;
  durationMinutes: number;
  livekitRoom: string | null;
  livekitUrl: string | null;
  livekitConfigured: boolean;
  plan: InterviewPlan;
  integrity: InterviewIntegrityEvent[];
  codeSnapshot: string | null;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  turns: InterviewTurnPublic[];
};

export type InterviewSessionSummary = {
  id: string;
  status: InterviewStatus;
  track: InterviewTrack;
  mode: InterviewMode;
  targetRole: string;
  targetCompany: string | null;
  durationMinutes: number;
  overall: number | null;
  createdAt: string;
};

export type InterviewReportPublic = {
  id: string;
  sessionId: string;
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
  createdAt: string;
};

export type InterviewTurnResult = {
  reply: string;
  showCode: boolean;
  endInterview: boolean;
  audioBase64?: string;
  audioMime?: string;
};
