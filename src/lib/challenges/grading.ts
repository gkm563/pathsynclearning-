import type { ChallengeQuestion } from "@/lib/challenges/types";
import { runPublicTestsInBrowser } from "@/lib/roadmap/coding-client";
import { gradeCodingMulti } from "@/lib/roadmap/code-runner";
import type { CodingLanguageId } from "@/lib/roadmap/coding-languages";

export const MCQ_PASS_SCORE = 70;
export const CODING_PASS_SCORE = 100;

/** Server-side MCQ grading — never trust client score/passed. */
export function gradeMcqAnswers(
  question: ChallengeQuestion,
  answers: Record<string, number> | undefined,
): { score: number; passed: boolean; correct: number; total: number } {
  const qs = question.questions || [];
  const total = Math.max(1, qs.length);
  let correct = 0;
  for (const q of qs) {
    const id = String(q.id);
    if (answers && answers[id] === q.correct) correct += 1;
  }
  const score = Math.round((correct / total) * 100);
  return {
    score,
    passed: score >= MCQ_PASS_SCORE,
    correct,
    total: qs.length,
  };
}

/** Server-side coding re-grade on submit. */
export async function gradeCodingSubmission(
  question: ChallengeQuestion,
  code: string,
  language: CodingLanguageId,
): Promise<{
  score: number;
  passed: boolean;
  passedCount: number;
  total: number;
}> {
  const harness = question.coding;
  if (!harness) {
    return { score: 0, passed: false, passedCount: 0, total: 0 };
  }
  const tests = [...harness.publicTests, ...(harness.hiddenTests || [])];
  if (!tests.length) {
    return { score: 0, passed: false, passedCount: 0, total: 0 };
  }

  if (language === "javascript") {
    const graded = runPublicTestsInBrowser(code, harness.functionName, tests);
    return {
      score: graded.score,
      passed: graded.passed && graded.score >= CODING_PASS_SCORE,
      passedCount: graded.passedCount,
      total: graded.total,
    };
  }

  const graded = await gradeCodingMulti(
    language,
    code,
    harness.functionName,
    tests,
    100,
  );
  return {
    score: graded.score,
    passed: graded.passed && graded.score >= CODING_PASS_SCORE,
    passedCount: graded.passedCount,
    total: graded.total,
  };
}
