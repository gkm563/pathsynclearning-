"use client";

import { Target } from "lucide-react";
import { generationStageQuestionsFromForm } from "@/lib/roadmap/generation-questions";
import type { RoadmapGenerationMode } from "@/lib/roadmap/generation-questions";
import { OnboardingCard, StepHeader } from "../onboarding-ui";
import { cn } from "@/lib/cn";

export default function CareerGoalSection({
  data,
  onChange,
  mode = null,
}: {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  hideRole?: boolean;
  mode?: RoadmapGenerationMode | null;
}) {
  const stage = generationStageQuestionsFromForm(data, mode);
  const achieveGoal = typeof data.achieveGoal === "string" ? data.achieveGoal : "";
  const goals = achieveGoal && !stage.career.goals.includes(achieveGoal)
    ? [...stage.career.goals, achieveGoal]
    : stage.career.goals;

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Target size={22} aria-hidden />}
        kicker="Outcome"
        title="Career goals"
        subtitle={stage.career.subtitle}
      />

      <p className="type-small m-0 rounded-[var(--radius-md)] border border-line bg-sunken px-3.5 py-3 text-muted">
        Path: <span className="font-semibold text-ink">{stage.pathLabel}</span>
      </p>

      <div>
        <p className="type-label mb-3 text-ink">What do you want to achieve?</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5">
          {goals.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => onChange({ ...data, achieveGoal: goal })}
              className={cn(
                "rounded-[var(--radius-md)] border px-3.5 py-3 text-center transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                achieveGoal === goal
                  ? "border-primary-border bg-primary-soft font-semibold text-ink"
                  : "border-line bg-sunken text-ink hover:bg-surface",
              )}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
    </OnboardingCard>
  );
}
