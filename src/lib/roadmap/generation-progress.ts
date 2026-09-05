export const GENERATION_STEPS = [
  { id: "profile", label: "Reading your profile…", percent: 8 },
  { id: "hiring", label: "Matching hiring skills and interview rounds…", percent: 18 },
  { id: "graph", label: "Writing detailed nodes with the AI…", percent: 35 },
  { id: "assessments", label: "Building assessments for each node…", percent: 62 },
  { id: "resources", label: "Checking videos are public and playable…", percent: 78 },
  { id: "save", label: "Saving your roadmap…", percent: 92 },
  { id: "done", label: "Roadmap ready", percent: 100 },
] as const;

export type GenerationStepId = (typeof GENERATION_STEPS)[number]["id"];

export type RoadmapGenerationProgress = {
  step: GenerationStepId;
  percent: number;
  message: string;
};

export function progressFor(step: GenerationStepId, message?: string): RoadmapGenerationProgress {
  const row = GENERATION_STEPS.find((s) => s.id === step) ?? GENERATION_STEPS[0];
  return { step: row.id, percent: row.percent, message: message ?? row.label };
}
