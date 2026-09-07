"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/cn";
import { OnboardingCard, StepHeader, labelClass } from "../onboarding-ui";

const TIMELINES = ["1 month", "3 months", "6 months", "9 months", "1 year", "No fixed deadline"];
const PRIORITIES = [
  "Build skills",
  "Get internship",
  "Get job",
  "Build portfolio",
  "Improve coding",
  "Prepare for interviews",
  "Build projects",
  "Earn through freelancing",
  "Contribute to open source",
];

export default function TimelineSection({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  hideRole?: boolean;
}) {
  const timeline = typeof data.timeline === "string" ? data.timeline : "";
  const priority = typeof data.priority === "string" ? data.priority : "";

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Calendar size={22} aria-hidden />}
        kicker="Deadline"
        title="Timeline and priority"
        subtitle="This sets estimated weeks and which nodes are marked critical."
      />

      <div>
        <p className={labelClass}>When do you want to achieve your goal?</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
          {TIMELINES.map((t) => (
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
        <p className={labelClass}>What is your biggest priority right now?</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5">
          {PRIORITIES.map((p) => (
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
