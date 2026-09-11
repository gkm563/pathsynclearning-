import type { ChallengeQuestion } from "@/lib/challenges/types";
import { extraCoding } from "@/lib/problems/coding";
import { extraTreesGraphs } from "@/lib/problems/coding-trees";
import { extraDesign, extraMcq, extraProjects } from "@/lib/problems/theory";

/** Extra catalog rows after the legacy RAW bank. Numbers are assigned densely. */
export function EXTRA_PROBLEMS(legacyCount: number): ChallengeQuestion[] {
  const coding = extraCoding(legacyCount);
  const trees = extraTreesGraphs(legacyCount + coding.length);
  const mcq = extraMcq(legacyCount + coding.length + trees.length);
  const design = extraDesign(legacyCount + coding.length + trees.length + mcq.length);
  const projects = extraProjects(
    legacyCount + coding.length + trees.length + mcq.length + design.length,
  );
  return [...coding, ...trees, ...mcq, ...design, ...projects];
}
