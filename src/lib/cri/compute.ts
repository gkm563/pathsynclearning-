import {
  CRI_FORMULA_ID,
  CONSISTENCY_SUBWEIGHT,
  CONSISTENCY_WINDOW_DAYS,
  contributionMilli,
  DIFFICULTY_MILLI,
  DSA_SUBWEIGHT,
  DSA_WINDOW_DAYS,
  INTERVIEW_DECAY_FLOOR,
  INTERVIEW_DECAY_PER_DAY,
  INTERVIEW_INTEGRITY_HARD_CAP,
  INTERVIEW_INTEGRITY_HARD_COUNT,
  INTERVIEW_INTEGRITY_SOFT_CAP,
  INTERVIEW_SUBWEIGHT,
  KNOWLEDGE_SUBWEIGHT,
  LIVE_WEIGHT_MILLI,
  PHASE1_LIVE,
  PHASE1_RESERVED,
  PROFILE_POINTS,
  PROJECT_SUBWEIGHT,
  PUBLISHED_WEIGHT_PCT,
  RETENTION_MIN_GAP_DAYS,
  ROADMAP_SUBWEIGHT,
} from "@/lib/cri/formula";
import {
  clampMilli,
  CRI_FULL_MILLI,
  mixWeightedMilli,
  mulDivRound,
} from "@/lib/cri/milli";
import { interviewMatchesRole, evidenceMatchesRole } from "@/lib/cri/scope";
import type {
  ConsistencyFact,
  CriComponentResult,
  CriComputation,
  CriEvidenceDraft,
  CriFacts,
  DsaAttemptFact,
  InterviewFact,
  KnowledgeAttemptFact,
  ProfileFact,
  ProjectFact,
  RoadmapFact,
} from "@/lib/cri/types";

const DAY_MS = 86_400_000;

function difficultyMilli(raw: string): number {
  const key = raw.trim().toLowerCase();
  if (key === "hard") return DIFFICULTY_MILLI.hard;
  if (key === "medium") return DIFFICULTY_MILLI.medium;
  return DIFFICULTY_MILLI.easy;
}

function scoreToMilli(score: number): number {
  const n = Math.max(0, Math.min(100, Math.trunc(Number(score) || 0)));
  return n * 1000;
}

function dayKey(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function pushEvidence(
  evidence: CriEvidenceDraft[],
  row: CriEvidenceDraft,
) {
  evidence.push(row);
}

function scoreDsa(
  attempts: DsaAttemptFact[],
  targetRole: string | null,
  nowMs: number,
  evidence: CriEvidenceDraft[],
): { scoreMilli: number; status: "ok" | "missing" } {
  const scoped = attempts
    .filter((a) => evidenceMatchesRole(a.careerTags, targetRole))
    .sort((a, b) => a.createdAtMs - b.createdAtMs);
  if (!scoped.length) return { scoreMilli: 0, status: "missing" };

  const byProblem = new Map<string, DsaAttemptFact[]>();
  for (const row of scoped) {
    const list = byProblem.get(row.problemKey) ?? [];
    list.push(row);
    byProblem.set(row.problemKey, list);
  }

  let solved = 0;
  let difficultyAcc = 0;
  let unseenTotal = 0;
  let unseenPass = 0;
  let timeParts: number[] = [];
  const retained = new Set<string>();

  for (const [key, rows] of byProblem) {
    const first = rows[0];
    unseenTotal += 1;
    if (first.passed) unseenPass += 1;
    const best = rows.reduce((a, b) => (b.score > a.score ? b : a));
    const passed = rows.some((r) => r.passed);
    if (passed) {
      solved += 1;
      difficultyAcc += difficultyMilli(best.difficulty);
      pushEvidence(evidence, {
        component: "dsa",
        sourceType: "challenge_attempt",
        sourceId: best.id,
        metric: "best_pass",
        valueMilli: scoreToMilli(best.score),
        weightMilli: 0,
      });
    }
    const withTime = rows.filter((r) => r.durationMs != null && r.estMinutes);
    if (withTime.length) {
      const t = withTime[withTime.length - 1];
      const estMs = (t.estMinutes || 0) * 60_000;
      if (estMs > 0 && t.durationMs && t.durationMs > 0) {
        const ratioMilli = Math.min(
          CRI_FULL_MILLI,
          mulDivRound(estMs * CRI_FULL_MILLI, t.durationMs),
        );
        timeParts.push(ratioMilli);
      }
    }
    const passedTimes = rows.filter((r) => r.passed).map((r) => r.createdAtMs);
    if (passedTimes.length >= 2) {
      const gap = (passedTimes[passedTimes.length - 1] - passedTimes[0]) / DAY_MS;
      if (gap >= RETENTION_MIN_GAP_DAYS) retained.add(key);
    }
  }

  const accuracy =
    byProblem.size > 0 ? mulDivRound(solved * CRI_FULL_MILLI, byProblem.size) : 0;
  const difficulty =
    solved > 0 ? mulDivRound(difficultyAcc, solved) : 0;
  const unseen =
    unseenTotal > 0 ? mulDivRound(unseenPass * CRI_FULL_MILLI, unseenTotal) : 0;
  const time =
    timeParts.length > 0
      ? mixWeightedMilli(timeParts.map((scoreMilli) => ({ weightPct: 1, scoreMilli })))
      : 0;
  const windowStart = nowMs - DSA_WINDOW_DAYS * DAY_MS;
  const solveDays = new Set(
    scoped
      .filter((r) => r.passed && r.createdAtMs >= windowStart)
      .map((r) => dayKey(r.createdAtMs)),
  );
  const consistency = mulDivRound(solveDays.size * CRI_FULL_MILLI, DSA_WINDOW_DAYS);
  const retention =
    byProblem.size > 0 ? mulDivRound(retained.size * CRI_FULL_MILLI, byProblem.size) : 0;

  const scoreMilli = mixWeightedMilli([
    { weightPct: DSA_SUBWEIGHT.accuracy, scoreMilli: accuracy },
    { weightPct: DSA_SUBWEIGHT.difficulty, scoreMilli: difficulty },
    { weightPct: DSA_SUBWEIGHT.unseen, scoreMilli: unseen },
    { weightPct: DSA_SUBWEIGHT.time, scoreMilli: time },
    { weightPct: DSA_SUBWEIGHT.consistency, scoreMilli: consistency },
    { weightPct: DSA_SUBWEIGHT.retention, scoreMilli: retention },
  ]);

  return { scoreMilli, status: "ok" };
}

function scoreKnowledge(
  attempts: KnowledgeAttemptFact[],
  targetRole: string | null,
  nowMs: number,
  evidence: CriEvidenceDraft[],
): { scoreMilli: number; status: "ok" | "missing" } {
  const scoped = attempts.filter((a) =>
    evidenceMatchesRole(a.careerTags, targetRole),
  );
  if (!scoped.length) return { scoreMilli: 0, status: "missing" };

  const best = new Map<string, KnowledgeAttemptFact>();
  for (const row of scoped) {
    const prev = best.get(row.itemKey);
    if (!prev || row.score > prev.score) best.set(row.itemKey, row);
  }

  let acc = 0;
  let diffAcc = 0;
  for (const row of best.values()) {
    acc += scoreToMilli(row.score);
    diffAcc += difficultyMilli(row.difficulty);
    pushEvidence(evidence, {
      component: "knowledge",
      sourceType: "assessment_attempt",
      sourceId: row.id,
      metric: "best_score",
      valueMilli: scoreToMilli(row.score),
      weightMilli: 0,
    });
  }
  const accuracy = mulDivRound(acc, best.size);
  const difficulty = mulDivRound(diffAcc, best.size);
  const windowStart = nowMs - CONSISTENCY_WINDOW_DAYS * DAY_MS;
  const days = new Set(
    scoped
      .filter((r) => r.createdAtMs >= windowStart)
      .map((r) => dayKey(r.createdAtMs)),
  );
  const consistency = mulDivRound(days.size * CRI_FULL_MILLI, CONSISTENCY_WINDOW_DAYS);
  return {
    scoreMilli: mixWeightedMilli([
      { weightPct: KNOWLEDGE_SUBWEIGHT.accuracy, scoreMilli: accuracy },
      { weightPct: KNOWLEDGE_SUBWEIGHT.difficulty, scoreMilli: difficulty },
      { weightPct: KNOWLEDGE_SUBWEIGHT.consistency, scoreMilli: consistency },
    ]),
    status: "ok",
  };
}

function complexityMilli(hours: number): number {
  const h = Math.max(0, hours);
  if (h >= 20) return CRI_FULL_MILLI;
  if (h <= 0) return 40_000;
  return clampMilli(40_000 + mulDivRound(h * 60_000, 20));
}

function scoreProjects(
  projects: ProjectFact[],
  evidence: CriEvidenceDraft[],
): { scoreMilli: number; status: "ok" | "missing" } {
  if (!projects.length) return { scoreMilli: 0, status: "missing" };
  const parts = projects.map((p) => {
    const testsDocs = p.hasRepo ? CRI_FULL_MILLI : 0;
    const reflection = p.hasReflection ? CRI_FULL_MILLI : 0;
    const scoreMilli = mixWeightedMilli([
      { weightPct: PROJECT_SUBWEIGHT.rubric, scoreMilli: scoreToMilli(p.score) },
      {
        weightPct: PROJECT_SUBWEIGHT.checklist,
        scoreMilli: scoreToMilli(p.checklistPct),
      },
      { weightPct: PROJECT_SUBWEIGHT.testsDocs, scoreMilli: testsDocs },
      { weightPct: PROJECT_SUBWEIGHT.reflection, scoreMilli: reflection },
      {
        weightPct: PROJECT_SUBWEIGHT.complexity,
        scoreMilli: complexityMilli(p.estimatedHours),
      },
    ]);
    pushEvidence(evidence, {
      component: "projects",
      sourceType: "project_run",
      sourceId: p.id,
      metric: "run_score",
      valueMilli: scoreMilli,
      weightMilli: 0,
    });
    return { weightPct: p.passed ? 3 : 1, scoreMilli };
  });
  return { scoreMilli: mixWeightedMilli(parts), status: "ok" };
}

function recencyMilli(endedAtMs: number, nowMs: number): number {
  const days = Math.max(0, Math.trunc((nowMs - endedAtMs) / DAY_MS));
  const decayed = CRI_FULL_MILLI - days * INTERVIEW_DECAY_PER_DAY;
  return Math.max(INTERVIEW_DECAY_FLOOR, decayed);
}

function scoreInterview(
  interviews: InterviewFact[],
  targetRole: string | null,
  nowMs: number,
  evidence: CriEvidenceDraft[],
): { scoreMilli: number; status: "ok" | "missing" } {
  const scoped = interviews.filter((row) =>
    interviewMatchesRole(row.targetRole, targetRole),
  );
  if (!scoped.length) return { scoreMilli: 0, status: "missing" };

  let bestMilli = 0;
  let best: InterviewFact | null = null;
  for (const row of scoped) {
    let inner = mixWeightedMilli([
      { weightPct: INTERVIEW_SUBWEIGHT.overall, scoreMilli: scoreToMilli(row.overall) },
      {
        weightPct: INTERVIEW_SUBWEIGHT.communication,
        scoreMilli: scoreToMilli(row.communication),
      },
      {
        weightPct: INTERVIEW_SUBWEIGHT.problemSolving,
        scoreMilli: scoreToMilli(row.problemSolving),
      },
      {
        weightPct: INTERVIEW_SUBWEIGHT.codeQuality,
        scoreMilli: scoreToMilli(row.codeQuality),
      },
      { weightPct: INTERVIEW_SUBWEIGHT.depth, scoreMilli: scoreToMilli(row.depth) },
    ]);
    inner = mulDivRound(inner * recencyMilli(row.endedAtMs, nowMs), CRI_FULL_MILLI);
    if (row.integrityCount >= INTERVIEW_INTEGRITY_HARD_COUNT) {
      inner = Math.min(inner, INTERVIEW_INTEGRITY_HARD_CAP);
    } else if (row.integrityCount > 0) {
      inner = Math.min(inner, INTERVIEW_INTEGRITY_SOFT_CAP);
    }
    if (inner >= bestMilli) {
      bestMilli = inner;
      best = row;
    }
  }
  if (best) {
    pushEvidence(evidence, {
      component: "interview",
      sourceType: "interview_report",
      sourceId: best.id,
      metric: "best_role_report",
      valueMilli: bestMilli,
      weightMilli: 0,
    });
  }
  return { scoreMilli: bestMilli, status: "ok" };
}

function scoreRoadmap(
  roadmap: RoadmapFact | null,
  targetRole: string | null,
  evidence: CriEvidenceDraft[],
): { scoreMilli: number; status: "ok" | "missing" } {
  if (!roadmap || !targetRole) return { scoreMilli: 0, status: "missing" };
  if (roadmap.targetRole && !interviewMatchesRole(roadmap.targetRole, targetRole)) {
    return { scoreMilli: 0, status: "missing" };
  }
  if (roadmap.trackable <= 0) return { scoreMilli: 0, status: "missing" };
  const completion = mulDivRound(
    roadmap.completed * CRI_FULL_MILLI,
    roadmap.trackable,
  );
  const prerequisites = roadmap.prerequisitesMet
    ? CRI_FULL_MILLI
    : mulDivRound(completion, 2);
  const assessments =
    roadmap.passedAssessmentScores.length > 0
      ? mulDivRound(
          roadmap.passedAssessmentScores.reduce((s, n) => s + scoreToMilli(n), 0),
          roadmap.passedAssessmentScores.length,
        )
      : 0;
  pushEvidence(evidence, {
    component: "roadmap",
    sourceType: "roadmap",
    sourceId: "active",
    metric: "completion",
    valueMilli: completion,
    weightMilli: 0,
  });
  return {
    scoreMilli: mixWeightedMilli([
      { weightPct: ROADMAP_SUBWEIGHT.completion, scoreMilli: completion },
      { weightPct: ROADMAP_SUBWEIGHT.prerequisites, scoreMilli: prerequisites },
      { weightPct: ROADMAP_SUBWEIGHT.assessments, scoreMilli: assessments },
    ]),
    status: "ok",
  };
}

function scoreConsistency(
  fact: ConsistencyFact,
  nowMs: number,
  evidence: CriEvidenceDraft[],
): { scoreMilli: number; status: "ok" | "missing" } {
  const windowStart = nowMs - CONSISTENCY_WINDOW_DAYS * DAY_MS;
  const days = new Set(
    fact.activityAtMs.filter((t) => t >= windowStart).map(dayKey),
  );
  if (!days.size && fact.streak <= 0 && !fact.rollingAccuracy.length) {
    return { scoreMilli: 0, status: "missing" };
  }
  const activeDays = mulDivRound(days.size * CRI_FULL_MILLI, CONSISTENCY_WINDOW_DAYS);
  const streak = mulDivRound(Math.min(fact.streak, 30) * CRI_FULL_MILLI, 30);
  const samples = fact.rollingAccuracy
    .filter((r) => r.atMs >= windowStart)
    .sort((a, b) => a.atMs - b.atMs);
  let improvement = 50_000;
  if (samples.length >= 4) {
    const mid = Math.trunc(samples.length / 2);
    const first = samples.slice(0, mid);
    const second = samples.slice(mid);
    const avg = (rows: typeof samples) =>
      mulDivRound(
        rows.reduce((s, r) => s + scoreToMilli(r.score), 0),
        rows.length,
      );
    const delta = avg(second) - avg(first);
    improvement = clampMilli(50_000 + mulDivRound(delta, 2));
  }
  pushEvidence(evidence, {
    component: "consistency",
    sourceType: "profile",
    sourceId: "streak",
    metric: "streak",
    valueMilli: streak,
    weightMilli: 0,
  });
  return {
    scoreMilli: mixWeightedMilli([
      { weightPct: CONSISTENCY_SUBWEIGHT.activeDays, scoreMilli: activeDays },
      { weightPct: CONSISTENCY_SUBWEIGHT.streak, scoreMilli: streak },
      { weightPct: CONSISTENCY_SUBWEIGHT.improvement, scoreMilli: improvement },
    ]),
    status: "ok",
  };
}

function scoreProfile(profile: ProfileFact, evidence: CriEvidenceDraft[]) {
  const checks: Array<{ key: keyof typeof PROFILE_POINTS; on: boolean }> = [
    { key: "fullName", on: profile.fullName },
    { key: "username", on: profile.username },
    { key: "bio", on: profile.bio },
    { key: "institute", on: profile.institute },
    { key: "degree", on: profile.degree },
    { key: "github", on: profile.github },
    { key: "linkedin", on: profile.linkedin },
    { key: "skills", on: profile.skills },
    { key: "projects", on: profile.projects },
    { key: "additionalCompleted", on: profile.additionalCompleted },
  ];
  let pts = 0;
  for (const row of checks) {
    if (row.on) pts += PROFILE_POINTS[row.key];
  }
  const scoreMilli = pts * 1000;
  pushEvidence(evidence, {
    component: "profile",
    sourceType: "profile",
    sourceId: "checklist",
    metric: "completeness",
    valueMilli: scoreMilli,
    weightMilli: 0,
  });
  return { scoreMilli, status: "ok" as const };
}

export function computeCri(facts: CriFacts, nowMs: number): CriComputation {
  const evidence: CriEvidenceDraft[] = [];
  const role = facts.targetRole?.trim() || null;

  const dsa = scoreDsa(facts.dsa, role, nowMs, evidence);
  const knowledge = scoreKnowledge(facts.knowledge, role, nowMs, evidence);
  const projects = scoreProjects(facts.projects, evidence);
  const interview = scoreInterview(facts.interviews, role, nowMs, evidence);
  const roadmap = scoreRoadmap(facts.roadmap, role, evidence);
  const consistency = scoreConsistency(facts.consistency, nowMs, evidence);
  const profile = scoreProfile(facts.profile, evidence);

  const liveScores: Record<(typeof PHASE1_LIVE)[number], { scoreMilli: number; status: "ok" | "missing" }> = {
    knowledge,
    dsa,
    projects,
    interview,
    roadmap,
    consistency,
    profile,
  };

  const components: CriComponentResult[] = [];
  let criMilli = 0;
  for (const id of PHASE1_LIVE) {
    const liveWeight = LIVE_WEIGHT_MILLI[id];
    const scored = liveScores[id];
    const contribution = contributionMilli(liveWeight, scored.scoreMilli);
    criMilli += contribution;
    components.push({
      id,
      publishedWeightPct: PUBLISHED_WEIGHT_PCT[id],
      liveWeightMilli: liveWeight,
      scoreMilli: scored.scoreMilli,
      contributionMilli: contribution,
      status: scored.status,
    });
  }
  criMilli = clampMilli(criMilli);

  for (const id of PHASE1_RESERVED) {
    components.push({
      id,
      publishedWeightPct: PUBLISHED_WEIGHT_PCT[id],
      liveWeightMilli: 0,
      scoreMilli: 0,
      contributionMilli: 0,
      status: "not_scored",
    });
  }

  return {
    formulaId: CRI_FORMULA_ID,
    criMilli,
    targetRole: role,
    components,
    evidence,
  };
}

export function emptyCriFacts(): CriFacts {
  return {
    targetRole: null,
    dsa: [],
    knowledge: [],
    projects: [],
    interviews: [],
    roadmap: null,
    consistency: { streak: 0, activityAtMs: [], rollingAccuracy: [] },
    profile: {
      fullName: false,
      username: false,
      bio: false,
      institute: false,
      degree: false,
      github: false,
      linkedin: false,
      skills: false,
      projects: false,
      additionalCompleted: false,
    },
  };
}
