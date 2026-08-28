import type {
  AttemptStatus,
  ChallengeAttempt,
  ChallengeAttemptPayload,
  ChallengeQuestion,
  ChallengeSummary,
} from "@/lib/challenges/types";

export function scoreRelevance(
  q: ChallengeQuestion,
  opts: {
    careerGoal: string | null;
    roadmapTopics: string[];
    status: AttemptStatus;
    unfinishedBoostTopics?: string[];
  },
): number {
  let score = 10;
  const goal = (opts.careerGoal || "").toLowerCase();
  if (goal) {
    for (const tag of q.careerTags) {
      const t = tag.toLowerCase();
      if (t.includes(goal) || goal.includes(t)) score += 40;
      else if (goal.split(/\s+/).some((w) => w.length > 3 && t.includes(w)))
        score += 15;
    }
  }
  const topics = opts.roadmapTopics.map((t) => t.toLowerCase());
  for (const t of q.topics) {
    if (topics.some((s) => t.includes(s) || s.includes(t))) score += 25;
  }
  const boost = (opts.unfinishedBoostTopics || []).map((t) => t.toLowerCase());
  for (const t of q.topics) {
    if (boost.some((s) => t.includes(s) || s.includes(t))) score += 20;
  }
  if (opts.status === "solved") score -= 35;
  if (opts.status === "attempted") score -= 5;
  if (q.difficulty === "medium") score += 3;
  return score;
}

export function toSummary(
  q: ChallengeQuestion,
  attempt: ChallengeAttempt | undefined,
  opts: {
    careerGoal: string | null;
    roadmapTopics: string[];
    unfinishedBoostTopics?: string[];
    linkedNodeId?: string;
    linkedNodeTitle?: string;
    hintsUnlocked?: number;
    solutionUnlocked?: boolean;
  },
): ChallengeSummary {
  const status: AttemptStatus = attempt?.status || "todo";
  return {
    ...q,
    status,
    score: attempt?.score,
    relevance: scoreRelevance(q, {
      careerGoal: opts.careerGoal,
      roadmapTopics: opts.roadmapTopics,
      status,
      unfinishedBoostTopics: opts.unfinishedBoostTopics,
    }),
    linkedNodeId: opts.linkedNodeId,
    linkedNodeTitle: opts.linkedNodeTitle,
    hintsUnlocked: opts.hintsUnlocked || 0,
    solutionUnlocked: Boolean(opts.solutionUnlocked),
    lastAttempt: attempt?.payload as ChallengeAttemptPayload | undefined,
  };
}

export function findLinkedNode(
  q: ChallengeQuestion,
  nodes: { id: string; title: string; skills?: string[]; topics?: string[] }[],
): { id: string; title: string } | undefined {
  let best: { id: string; title: string; score: number } | undefined;
  for (const n of nodes) {
    const bag = [
      n.title,
      ...(n.skills || []),
      ...(n.topics || []),
    ].map((x) => x.toLowerCase());
    let s = 0;
    for (const t of q.topics) {
      if (bag.some((b) => b.includes(t) || t.includes(b))) s += 1;
    }
    if (s > 0 && (!best || s > best.score)) {
      best = { id: n.id, title: n.title, score: s };
    }
  }
  return best ? { id: best.id, title: best.title } : undefined;
}
