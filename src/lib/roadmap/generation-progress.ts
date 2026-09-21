export const GENERATION_STEPS = [
  { id: "profile", label: "Reading your profile…", percent: 6 },
  { id: "hiring", label: "Matching hiring skills and interview rounds…", percent: 12 },
  { id: "graph", label: "Outlining the full curriculum…", percent: 22 },
  { id: "expand", label: "Writing nested topics (no node cap)…", percent: 48 },
  { id: "assessments", label: "Building assessments for key nodes…", percent: 68 },
  { id: "resources", label: "Matching lesson videos to each topic…", percent: 80 },
  { id: "calendar", label: "Scheduling day-wise tasks…", percent: 90 },
  { id: "save", label: "Saving your roadmap…", percent: 94 },
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
