"use client";

import { Clock, Map } from "lucide-react";
import {
  ChoiceCard,
  OnboardingCard,
  StepHeader,
} from "@/views/RoadmapOnboarding/onboarding-ui";

export default function RoadmapStep({
  role,
  generateNow,
  onChange,
}: {
  role: string;
  generateNow: boolean | null;
  onChange: (generateNow: boolean) => void;
}) {
  return (
    <OnboardingCard>
      <StepHeader
        kicker="Roadmap"
        title="Generate a roadmap now?"
        subtitle={
          role
            ? `We can start a learning path for ${role}, or you can explore PathEd first and come back later.`
            : "We can start a learning path now, or you can skip and generate one later from Roadmap."
        }
      />
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <ChoiceCard selected={generateNow === true} onClick={() => onChange(true)}>
          <Map size={22} className="text-primary" aria-hidden />
          <p className="type-h4 mt-2.5 mb-0 text-ink">Generate now</p>
          <p className="type-small mt-1.5 mb-0 text-muted">
            Continue into a short questionnaire so we can build the graph for this
            career.
          </p>
        </ChoiceCard>
        <ChoiceCard selected={generateNow === false} onClick={() => onChange(false)}>
          <Clock size={22} className="text-muted" aria-hidden />
          <p className="type-h4 mt-2.5 mb-0 text-ink">Skip for later</p>
          <p className="type-small mt-1.5 mb-0 text-muted">
            Go to your dashboard. You can create a roadmap anytime from the Roadmap
            tab.
          </p>
        </ChoiceCard>
      </div>
    </OnboardingCard>
  );
}
