/** Shared AI interview types — safe for client and server. */

export type InterviewTrack = "dsa_behavioral" | "dsa" | "behavioral";
export type InterviewMode = "voice" | "text";
export type InterviewDurationMinutes = 5 | 10 | 15 | 20 | 30;
export type InterviewDifficulty = "easy" | "medium" | "hard";
export type InterviewStyle = "supportive" | "balanced" | "strict";
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
export type InterviewPurpose = "practice" | "roadmap_final";
export type InterviewOutcome = "certified" | "remediate" | "redesign";
export type InterviewNodeAction = "ok" | "loop" | "expand";

export type InterviewNodeCoverage = {
  nodeId: string;
  title: string;
  topics: string[];
};

export type InterviewNodeDiagnosis = {
  nodeId: string;
  title: string;
  score: number;
  weakness: string;
  action: InterviewNodeAction;
};

export type InterviewPlan = {
  track: InterviewTrack;
  targetRole: string;
  targetCompany: string | null;
  durationMinutes: number;
  difficulty: InterviewDifficulty;
  style: InterviewStyle;
  focus: string;
  purpose?: InterviewPurpose;
  roadmapId?: string | null;
  roadmapTitle?: string;
  studiedTopics?: string[];
  nodeCoverage?: InterviewNodeCoverage[];
  codingStartAfterMinutes: number;
  coding: InterviewCodingProblem | null;
  instructions: string;
  phase?: InterviewPhase;
  varietySeed: number;
  askedAngles: string[];
  awaitingEndConfirm?: boolean;
};

export type InterviewIntegrityEvent = {
  type:
    | "tab_hidden"
    | "tab_visible"
    | "paste"
    | "fullscreen_exit"
    | "window_blur"
    | "clipboard_blocked";
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
  startedAt: string;
  endedAt: string | null;
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
  codedInIde: boolean;
  summary: string;
  quotes: Array<{ quote: string; note: string }>;
  nextPractice: Array<{ label: string; href: string }>;
  createdAt: string;
  passed?: boolean;
  outcome?: InterviewOutcome | null;
  nodeDiagnoses?: InterviewNodeDiagnosis[];
  adaptationStatus?: "idle" | "pending" | "applied";
  focusNodeId?: string | null;
  proctorFailed?: boolean;
};

export type InterviewTurnResult = {
  reply: string;
  showCode: boolean;
  endInterview: boolean;
  coding?: InterviewCodingProblem | null;
  audioBase64?: string;
  audioMime?: string;
};
