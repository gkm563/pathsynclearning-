"use client";

import { Clock } from "lucide-react";
import { generationStageQuestionsFromForm } from "@/lib/roadmap/generation-questions";
import type { RoadmapGenerationMode } from "@/lib/roadmap/generation-questions";
import { OnboardingCard, StepHeader } from "../onboarding-ui";
import { cn } from "@/lib/cn";

const HOURS = ["1–3 hours", "3–5 hours", "5–10 hours", "10–15 hours", "15–20 hours", "20+ hours"];

export default function TimeSection({
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
  const weeklyHours = typeof data.weeklyHours === "string" ? data.weeklyHours : "";
  const balance = typeof data.balance === "string" ? data.balance : "";
  const balances = balance && !stage.time.balances.includes(balance)
    ? [...stage.time.balances, balance]
    : stage.time.balances;

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Clock size={22} aria-hidden />}
        kicker="Pace"
        title="Time you can spend"
        subtitle={stage.time.subtitle}
      />

      <div>
        <p className="type-label mb-3 text-ink">Weekly hours you can commit</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5">
          {HOURS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onChange({ ...data, weeklyHours: h })}
              className={cn(
                "rounded-[var(--radius-md)] border px-3.5 py-3 text-center transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                weeklyHours === h
                  ? "border-primary-border bg-primary-soft font-semibold text-ink"
                  : "border-line bg-sunken text-ink hover:bg-surface",
              )}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="type-label mb-3 text-ink">
          {stage.targeted ? "Interview prep vs domain work" : "Project vs learning balance"}
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5">
          {balances.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onChange({ ...data, balance: b })}
              className={cn(
                "rounded-[var(--radius-md)] border px-3.5 py-3 text-center transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                balance === b
                  ? "border-primary-border bg-primary-soft font-semibold text-ink"
                  : "border-line bg-sunken text-ink hover:bg-surface",
              )}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </OnboardingCard>
  );
}
