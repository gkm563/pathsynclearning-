/** Shared project assessment domain — Challenges + Roadmap. */

export type ProjectEvidenceKind =
  | "repo_url"
  | "screenshot_url"
  | "demo_url"
  | "notes";

export type ProjectRubricCheck =
  | "evidence_present"
  | "checklist_complete"
  | "keyword_notes"
  | "manual"
  | "github_readme"
  | "github_structure"
  | "github_commits";

export type ProjectStep = {
  id: string;
  title: string;
  instructions: string;
  acceptance: string[];
  resources?: { label: string; url: string }[];
  requiredEvidence?: ProjectEvidenceKind[];
};

export type ProjectRubricItem = {
  id: string;
  label: string;
  weight: number;
  check: ProjectRubricCheck;
  /** For keyword_notes */
  keywords?: string[];
  /** For github_structure — required path fragments */
  requiredPaths?: string[];
};

export type ProjectOverview = {
  goal: string;
  stack: string[];
  deliverables: string[];
  estimatedHours: number;
};

export type ProjectAssessmentSpec = {
  type: "project";
  passScore: number;
  timeLimitMinutes?: number;
  overview: ProjectOverview;
  steps: ProjectStep[];
  rubric: ProjectRubricItem[];
};

export type ProjectEvidenceInput = {
  kind: ProjectEvidenceKind;
  url?: string;
  text?: string;
  stepId?: string;
};

export type ProjectRubricBreakdownItem = {
  id: string;
  label: string;
  weight: number;
  earned: number;
  passed: boolean;
  detail: string;
};

export type ProjectGradeResult = {
  score: number;
  passed: boolean;
  checklistPct: number;
  breakdown: ProjectRubricBreakdownItem[];
};

export type ProjectRunStatus =
  | "in_progress"
  | "submitted"
  | "passed"
  | "failed";

export type ProjectSource = "challenge" | "roadmap";
