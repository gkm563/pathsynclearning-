import type { CodingTestCase } from "@/types/roadmap";

/** Judge-ready coding harness shared with roadmap assessments. */
export type ChallengeCodingHarness = {
  functionName: string;
  /** Minimal empty JS stub — language variants generated via starterForLanguage */
  starterCode: string;
  examples: { input: string; output: string }[];
  publicTests: CodingTestCase[];
  hiddenTests?: CodingTestCase[];
};
