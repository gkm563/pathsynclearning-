"use client";

import { Target } from "lucide-react";
import { OnboardingCard, StepHeader } from "../onboarding-ui";
import { cn } from "@/lib/cn";

const GOALS = [
  "Get an internship",
  "Get a job",
  "Become a freelancer",
  "Build projects",
  "Prepare for placements",
  "Prepare for higher studies",
  "Learn a new skill",
  "Explore a career",
  "Build a startup",
  "Other",
];

export default function CareerGoalSection({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  hideRole?: boolean;
}) {
  const achieveGoal = typeof data.achieveGoal === "string" ? data.achieveGoal : "";
  const roleLabel =
    typeof data.customRole === "string" && data.roleOfInterest === "Other"
      ? data.customRole
      : typeof data.roleOfInterest === "string"
        ? data.roleOfInterest
        : "";

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Target size={22} aria-hidden />}
        kicker="Outcome"
        title="Career goals"
        subtitle="The role is already locked from your path type. Here we only ask what you want to achieve."
      />

      {roleLabel ? (
        <p className="type-small m-0 rounded-[var(--radius-md)] border border-line bg-sunken px-3.5 py-3 text-muted">
          Selected role: <span className="font-semibold text-ink">{roleLabel}</span>
        </p>
      ) : null}

      <div>
        <p className="type-label mb-3 text-ink">What do you want to achieve?</p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5">
          {GOALS.map((goal) => (
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
