import { listCatalog } from "@/lib/challenges/catalog";
import { newVarietySeed, pickFromList } from "./interview-variety";
import { buildVoiceInstructions } from "./interview-prompt";
import type { InterviewCodingProblem, InterviewPlan, InterviewTrack } from "./interview-types";

function pickCodingProblem(company: string | null, seed: number): InterviewCodingProblem | null {
  const catalog = listCatalog().filter((q) => q.type === "coding" && q.prompt);
  if (!catalog.length) return null;
  const needle = (company || "").toLowerCase();
  const tagged = needle
    ? catalog.filter((q) => q.companyTags.some((t) => t.toLowerCase().includes(needle)))
    : [];
  const easy = (tagged.length ? tagged : catalog).filter((q) => q.difficulty === "easy");
  const pool = easy.length ? easy : tagged.length ? tagged : catalog;
  const chosen = pickFromList(pool, seed);
  return {
    slug: chosen.slug,
    title: chosen.title,
    difficulty: chosen.difficulty,
    prompt: chosen.prompt.slice(0, 2500),
    starterCode: chosen.starterCode?.slice(0, 4000),
  };
}

export function buildInterviewPlan(input: {
  track: InterviewTrack;
  targetRole: string;
  targetCompany: string | null;
  durationMinutes: number;
  studentName: string;
}): InterviewPlan {
  const wantsCode = input.track !== "behavioral";
  const varietySeed = newVarietySeed();
  const coding = wantsCode ? pickCodingProblem(input.targetCompany, varietySeed) : null;
  const codingStartAfterMinutes = Math.max(
    6,
    Math.round(input.durationMinutes * (input.track === "dsa" ? 0.25 : 0.4)),
  );
  const plan: InterviewPlan = {
    track: input.track,
    targetRole: input.targetRole,
    targetCompany: input.targetCompany,
    durationMinutes: input.durationMinutes,
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
