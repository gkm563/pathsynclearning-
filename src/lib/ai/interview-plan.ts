import { listCatalog } from "@/lib/challenges/catalog";
import type { ChallengeQuestion } from "@/lib/challenges/types";
import { newVarietySeed, pickFromList } from "./interview-variety";
import { buildVoiceInstructions } from "./interview-prompt";
import type {
  InterviewCodingProblem,
  InterviewDifficulty,
  InterviewNodeCoverage,
  InterviewPlan,
  InterviewPurpose,
  InterviewStyle,
  InterviewTrack,
} from "./interview-types";

export function codingProblemFromCatalog(chosen: ChallengeQuestion): InterviewCodingProblem {
  const prompt = [chosen.prompt, chosen.description, chosen.examples]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join("\n\n");
  return {
    slug: chosen.slug,
    title: chosen.title,
    difficulty: chosen.difficulty,
    prompt: prompt.slice(0, 2500),
    starterCode: chosen.starterCode?.slice(0, 4000),
  };
}

function pickCodingProblem(
  company: string | null,
  seed: number,
  difficulty: InterviewDifficulty,
): InterviewCodingProblem | null {
  const catalog = listCatalog().filter((q) => q.type === "coding" && q.prompt);
  if (!catalog.length) return null;
  const needle = (company || "").toLowerCase();
  const tagged = needle
    ? catalog.filter((q) => q.companyTags.some((t) => t.toLowerCase().includes(needle)))
    : [];
  const base = tagged.length ? tagged : catalog;
  const byDiff = base.filter((q) => q.difficulty === difficulty);
  const pool = byDiff.length ? byDiff : base;
  return codingProblemFromCatalog(pickFromList(pool, seed));
}

export function buildInterviewPlan(input: {
  track: InterviewTrack;
  targetRole: string;
  targetCompany: string | null;
  durationMinutes: number;
  studentName: string;
  difficulty?: InterviewDifficulty;
  style?: InterviewStyle;
  focus?: string;
  purpose?: InterviewPurpose;
  roadmapId?: string | null;
  roadmapTitle?: string;
  studiedTopics?: string[];
  nodeCoverage?: InterviewNodeCoverage[];
}): InterviewPlan {
  const wantsCode = input.track !== "behavioral";
  const varietySeed = newVarietySeed();
  const difficulty = input.difficulty ?? "medium";
  const style = input.style ?? "balanced";
  const focus = input.focus?.trim().slice(0, 120) ?? "";
  const purpose: InterviewPurpose = input.purpose === "roadmap_final" ? "roadmap_final" : "practice";
  const topicCap = purpose === "roadmap_final" ? 40 : 20;
  const coding = wantsCode ? pickCodingProblem(input.targetCompany, varietySeed, difficulty) : null;
  const codingStartAfterMinutes = Math.max(
    6,
    Math.round(input.durationMinutes * (input.track === "dsa" ? 0.25 : 0.4)),
  );
  const nodeCoverage = (input.nodeCoverage ?? []).slice(0, 40);
  const studiedFromCoverage = nodeCoverage.map((item) =>
    (item.topics.length ? `${item.title} (${item.topics.slice(0, 2).join(", ")})` : item.title).slice(0, 140),
  );
  const plan: InterviewPlan = {
    track: input.track,
    targetRole: input.targetRole,
    targetCompany: input.targetCompany,
    durationMinutes: input.durationMinutes,
    difficulty,
    style,
    focus,
    purpose,
    roadmapId: input.roadmapId ?? null,
    roadmapTitle: input.roadmapTitle?.trim() || "",
    studiedTopics: (purpose === "roadmap_final" && studiedFromCoverage.length
      ? studiedFromCoverage
      : (input.studiedTopics ?? [])
    )
      .map((item) => item.slice(0, 140))
      .slice(0, topicCap),
    nodeCoverage,
    codingStartAfterMinutes,
    coding,
    instructions: "",
    phase: "briefing",
    varietySeed,
    askedAngles: [],
  };
  plan.instructions = buildVoiceInstructions(plan, input.studentName);
  return plan;
}
