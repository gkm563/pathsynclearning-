import type { NodeAssessment, RoadmapNode, RoadmapNodeType } from "@/types/roadmap";

export const ASSESSABLE_NODE_TYPES: RoadmapNodeType[] = [
  "skill",
  "topic",
  "project",
  "checkpoint",
];

export function isAssessableNode(node: Pick<RoadmapNode, "type" | "assessment">): boolean {
  return ASSESSABLE_NODE_TYPES.includes(node.type) && Boolean(node.assessment);
}

export function nodeRequiresAssessment(node: Pick<RoadmapNode, "type">): boolean {
  return ASSESSABLE_NODE_TYPES.includes(node.type);
}

/** Public assessment payload — never includes correct answers or hidden tests. */
export function stripAssessmentSecrets(assessment: NodeAssessment): NodeAssessment {
  if (assessment.type === "mcq" && assessment.mcq) {
    return {
      type: "mcq",
      passScore: assessment.passScore,
      timeLimitMinutes: assessment.timeLimitMinutes,
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
      type: "coding",
      passScore: assessment.passScore,
      timeLimitMinutes: assessment.timeLimitMinutes,
      coding: {
        ...coding,
        publicTests: coding.publicTests,
      },
    };
  }

  if (assessment.type === "project" && assessment.project) {
    return {
      type: "project",
      passScore: assessment.passScore,
      timeLimitMinutes: assessment.timeLimitMinutes,
      project: assessment.project,
    };
  }

  return assessment;
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
