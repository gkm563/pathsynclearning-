import type { ChallengeQuestion, ChallengeSummary } from "@/lib/challenges/types";

export function isProblemRunnable(q: ChallengeQuestion): boolean {
  if (q.type === "coding" || q.coding) {
    const tests = q.coding?.publicTests || [];
    const hidden = q.coding?.hiddenTests || [];
    return Boolean(q.coding?.functionName) && tests.length >= 2 && hidden.length >= 1;
  }
  if (q.type === "mcq") {
    return (q.questions || []).length >= 3;
  }
  if (q.type === "system_design") {
    return (q.design?.dimensions || []).length >= 4;
  }
  if (q.type === "project" || q.project) {
    return Boolean(q.project?.steps?.length && q.project?.rubric?.length);
  }
  return false;
}

/** Strip hidden tests and MCQ answers from payloads sent to the browser. */
export function toPublicQuestion(q: ChallengeQuestion): ChallengeQuestion {
  const coding = q.coding
    ? {
        ...q.coding,
        hiddenTests: undefined,
      }
    : undefined;
  return {
    ...q,
    coding,
    starterCode: coding?.starterCode || q.starterCode,
  };
}

export function toPublicSummary(summary: ChallengeSummary): ChallengeSummary {
  const pub = toPublicQuestion(summary);
  return { ...summary, ...pub };
}

export type ProblemListItem = {
  slug: string;
  number: number;
  title: string;
  difficulty: ChallengeQuestion["difficulty"];
  kind: ChallengeQuestion["type"];
  status: ChallengeSummary["status"];
  score?: number;
  topics: string[];
  companyTags: string[];
  xp: number;
  estMinutes: number;
  category: string;
};
