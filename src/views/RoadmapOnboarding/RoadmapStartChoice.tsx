"use client";

import { Clock, Map } from "lucide-react";
import { ChoiceCard, OnboardingCard, StepHeader } from "./onboarding-ui";

export default function RoadmapStartChoice({
  onCreate,
  onSkip,
}: {
  onCreate: () => void;
  onSkip: () => void;
}) {
  return (
    <OnboardingCard>
      <StepHeader
        kicker="Start"
        title="Create a roadmap now?"
        subtitle="Company hiring paths and role paths use different questions, different resources, and different interview maps."
      />
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <ChoiceCard selected={false} onClick={onCreate}>
          <Map size={22} className="text-primary" aria-hidden />
          <p className="type-h4 mt-2.5 mb-0 text-ink">Create a roadmap</p>
          <p className="type-small mt-1.5 mb-0 text-muted">
            Choose company hiring or a general role, then a short profile so we
            can generate a detailed graph.
          </p>
        </ChoiceCard>
        <ChoiceCard selected={false} onClick={onSkip}>
          <Clock size={22} className="text-muted" aria-hidden />
          <p className="type-h4 mt-2.5 mb-0 text-ink">Skip for later</p>
          <p className="type-small mt-1.5 mb-0 text-muted">
            Explore PathEd first. You can start a roadmap from this page anytime.
          </p>
        </ChoiceCard>
      </div>
    </OnboardingCard>
  );
}
