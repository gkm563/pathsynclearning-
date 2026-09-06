import type { NodeAssessment, RoadmapNode, RoadmapNodeType } from "@/types/roadmap";
import { hydrateCodingAssessment } from "@/lib/roadmap/coding-problems";

export const ASSESSABLE_NODE_TYPES: RoadmapNodeType[] = [
  "skill",
  "topic",
  "project",
  "checkpoint",
];

export const ASSESSMENT_ID_KEY = "_assessmentId";

export function getNodeAssessments(
  node: Pick<RoadmapNode, "assessment" | "assessments">,
): NodeAssessment[] {
  const fromList = Array.isArray(node.assessments) ? node.assessments.filter(Boolean) : [];
  if (fromList.length > 0) {
    return fromList.map((a, i) => normalizeAssessment(a, i, node));
  }
  if (node.assessment) return [normalizeAssessment(node.assessment, 0, node)];
  return [];
}

function normalizeAssessment(
  assessment: NodeAssessment,
  index: number,
  node: Pick<RoadmapNode, "assessment" | "assessments"> & { id?: string },
): NodeAssessment {
  const id =
    assessment.id ||
    `${"id" in node && node.id ? node.id : "node"}-${assessment.type}-${index}`;
  const coding = assessment.coding
    ? hydrateCodingAssessment(assessment.coding)
    : undefined;
  const title =
    assessment.title ||
    coding?.title ||
    (assessment.type === "mcq"
      ? "Concept quiz"
      : assessment.type === "project"
        ? "Project submission"
        : coding?.functionName || "Assessment");
  return { ...assessment, id, title, coding: coding ?? assessment.coding };
}

export function isAssessableNode(
  node: Pick<RoadmapNode, "type" | "assessment" | "assessments">,
): boolean {
  return ASSESSABLE_NODE_TYPES.includes(node.type) && getNodeAssessments(node).length > 0;
}

export function resolveNodeAssessment(
  node: RoadmapNode,
  assessmentId?: string | null,
): NodeAssessment | null {
  const list = getNodeAssessments(node);
  if (list.length === 0) return null;
  if (assessmentId) {
    return list.find((a) => a.id === assessmentId) || null;
  }
  if (list.length === 1) return list[0];
  return null;
}

export function attemptAssessmentId(answers: unknown): string | null {
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) return null;
  const id = (answers as Record<string, unknown>)[ASSESSMENT_ID_KEY];
  return typeof id === "string" && id.length > 0 ? id : null;
}

export type AssessmentAttemptRef = {
  passed?: boolean;
  type?: string | null;
  answers?: unknown;
  assessmentId?: string | null;
};

/** Map an attempt to one assessment on the node. Never falls back to a different problem. */
export function resolveAttemptAssessmentId(
  attempt: AssessmentAttemptRef,
  assessments: NodeAssessment[],
): string | null {
  const known = new Set(assessments.map((a) => a.id).filter(Boolean) as string[]);
  const explicit =
    (typeof attempt.assessmentId === "string" && attempt.assessmentId) ||
    attemptAssessmentId(attempt.answers);
  if (explicit && known.has(explicit)) return explicit;
  if (assessments.length === 1) return assessments[0]?.id || null;
  if (attempt.type) {
    const sameType = assessments.filter((a) => a.type === attempt.type);
    if (sameType.length === 1) return sameType[0]?.id || null;
  }
  return null;
}

export function attemptsForAssessment<T extends AssessmentAttemptRef>(
  attempts: T[],
  assessment: Pick<NodeAssessment, "id" | "type">,
  assessments: NodeAssessment[],
): T[] {
  const id = assessment.id;
  if (!id) {
    return assessments.length <= 1 ? attempts : attempts.filter((a) => a.type === assessment.type);
  }
  return attempts.filter((a) => resolveAttemptAssessmentId(a, assessments) === id);
}

export function passedAssessmentIds(
  attempts: AssessmentAttemptRef[],
  assessments: NodeAssessment[],
): Set<string> {
  const passed = new Set<string>();
  for (const attempt of attempts) {
    if (!attempt.passed) continue;
    const id = resolveAttemptAssessmentId(attempt, assessments);
    if (id) passed.add(id);
  }
  return passed;
}

export function allAssessmentsPassed(
  attempts: Array<{ passed: boolean; answers?: unknown }>,
  assessments: NodeAssessment[],
): boolean {
  if (assessments.length === 0) return false;
  const passed = passedAssessmentIds(attempts, assessments);
  return assessments.every((a) => a.id && passed.has(a.id));
}

export function assessmentLabel(assessment: NodeAssessment): string {
  return (
    assessment.title ||
    assessment.coding?.title ||
    (assessment.type === "mcq"
      ? "Concept quiz"
      : assessment.type === "coding"
        ? assessment.coding?.functionName || "Coding"
        : "Project")
  );
}

export function nodeRequiresAssessment(node: Pick<RoadmapNode, "type">): boolean {
  return ASSESSABLE_NODE_TYPES.includes(node.type);
}

/** Public assessment payload — never includes correct answers or hidden tests. */
export function stripAssessmentSecrets(assessment: NodeAssessment): NodeAssessment {
  const base = {
    id: assessment.id,
    title: assessment.title,
    type: assessment.type,
    passScore: assessment.passScore,
    timeLimitMinutes: assessment.timeLimitMinutes,
  } as NodeAssessment;

  if (assessment.type === "mcq" && assessment.mcq) {
    return {
      ...base,
      mcq: {
        questions: assessment.mcq.questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options,
          correctIndex: -1,
        })),
      },
    };
  }

  if (assessment.type === "coding" && assessment.coding) {
    const { hiddenTests: _hidden, ...coding } = assessment.coding;
    return {
      ...base,
      coding: {
        ...coding,
        publicTests: coding.publicTests,
      },
    };
  }

  if (assessment.type === "project" && assessment.project) {
    return {
      ...base,
      project: assessment.project,
    };
  }

  return { ...assessment, ...base };
}

export function gradeMcq(
  assessment: NodeAssessment,
  answers: Record<string, number>,
): { score: number; passed: boolean; correct: number; total: number } {
  const questions = assessment.mcq?.questions || [];
  const total = questions.length || 1;
  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctIndex) correct += 1;
  }
  const score = Math.round((correct / total) * 100);
  return {
    score,
    passed: score >= (assessment.passScore ?? 70),
    correct,
    total,
  };
}

export type McqAnswerReviewItem = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  yourIndex: number | null;
  isCorrect: boolean;
};

/** Reveal MCQ answers only after a passing attempt. */
export function buildMcqAnswerReview(
  assessment: NodeAssessment,
  answers: Record<string, number> = {},
): McqAnswerReviewItem[] {
  return (assessment.mcq?.questions || []).map((q) => {
    const yourIndex = typeof answers[q.id] === "number" ? answers[q.id] : null;
    return {
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      yourIndex,
      isCorrect: yourIndex === q.correctIndex,
    };
  });
}
