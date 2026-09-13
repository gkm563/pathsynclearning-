"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/cn";
import { generationStageQuestionsFromForm } from "@/lib/roadmap/generation-questions";
import type { RoadmapGenerationMode } from "@/lib/roadmap/generation-questions";
import { OnboardingCard, StepHeader, labelClass } from "../onboarding-ui";

export default function TimelineSection({
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
  const timeline = typeof data.timeline === "string" ? data.timeline : "";
  const priority = typeof data.priority === "string" ? data.priority : "";
  const timelines = timeline && !stage.timeline.timelines.includes(timeline)
    ? [...stage.timeline.timelines, timeline]
    : stage.timeline.timelines;
  const priorities = priority && !stage.timeline.priorities.includes(priority)
    ? [...stage.timeline.priorities, priority]
    : stage.timeline.priorities;

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Calendar size={22} aria-hidden />}
        kicker="Deadline"
        title="Timeline and priority"
        subtitle={stage.timeline.subtitle}
      />

      <div>
        <p className={labelClass}>When do you want to achieve your goal?</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
          {timelines.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...data, timeline: t })}
              className={cn(
                "rounded-[var(--radius-md)] border px-3.5 py-3 text-center transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                timeline === t
                  ? "border-primary-border bg-primary-soft font-semibold text-ink"
                  : "border-line bg-sunken text-ink hover:bg-surface",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={labelClass}>{stage.timeline.priorityPrompt}</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
          {priorities.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ ...data, priority: p })}
              className={cn(
                "rounded-[var(--radius-md)] border px-3.5 py-3 text-center transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                priority === p
                  ? "border-primary-border bg-primary-soft font-semibold text-ink"
                  : "border-line bg-sunken text-ink hover:bg-surface",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </OnboardingCard>
  );
}
