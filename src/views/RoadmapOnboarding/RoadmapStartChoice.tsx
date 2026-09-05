"use client";

import React from "react";
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <ChoiceCard selected={false} onClick={onCreate} accent="#6c63ff">
          <Map size={26} color="#6c63ff" />
          <div style={{ fontWeight: 800, fontSize: 18, marginTop: 10 }}>Create a roadmap</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
            Choose company hiring or a general role, then a short profile so we can generate a detailed graph.
          </div>
        </ChoiceCard>
        <ChoiceCard selected={false} onClick={onSkip} accent="#00c9a7">
          <Clock size={26} color="#00c9a7" />
          <div style={{ fontWeight: 800, fontSize: 18, marginTop: 10 }}>Skip for later</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.5 }}>
            Explore PathEd first. You can start a roadmap from this page anytime.
          </div>
        </ChoiceCard>
      </div>
    </OnboardingCard>
  );
}
