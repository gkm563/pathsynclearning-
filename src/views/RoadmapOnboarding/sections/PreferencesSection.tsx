"use client";

import { Check, Settings } from "lucide-react";
import { OnboardingCard, Pill, StepHeader, labelClass } from "../onboarding-ui";

const PREFERENCES = [
  "Video tutorials",
  "Documentation",
  "Building projects",
  "Reading",
  "Interactive exercises",
  "Coding challenges",
  "Courses",
  "Mentorship",
  "Community/Open Source",
];

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((s): s is string => typeof s === "string")
    : [];
}

export default function PreferencesSection({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
  hideRole?: boolean;
}) {
  const learningPreferences = asStringArray(data.learningPreferences);

  const togglePref = (pref: string) => {
    if (learningPreferences.includes(pref)) {
      onChange({
        ...data,
        learningPreferences: learningPreferences.filter((p) => p !== pref),
      });
    } else {
      onChange({ ...data, learningPreferences: [...learningPreferences, pref] });
    }
  };

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Settings size={22} aria-hidden />}
        kicker="Format"
        title="How you learn"
        subtitle="We bias resources toward videos, docs, or practice based on this."
      />

      <div>
        <p className={labelClass}>How do you learn best?</p>
        <div className="flex flex-wrap gap-2.5">
          {PREFERENCES.map((pref) => {
            const selected = learningPreferences.includes(pref);
            return (
              <Pill key={pref} selected={selected} onClick={() => togglePref(pref)}>
                {selected ? <Check size={16} aria-hidden /> : null} {pref}
              </Pill>
            );
          })}
        </div>
      </div>
    </OnboardingCard>
  );
}
