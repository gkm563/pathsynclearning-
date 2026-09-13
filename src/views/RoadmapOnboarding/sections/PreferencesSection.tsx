"use client";

import { Check, Settings } from "lucide-react";
import { generationStageQuestionsFromForm } from "@/lib/roadmap/generation-questions";
import type { RoadmapGenerationMode } from "@/lib/roadmap/generation-questions";
import { OnboardingCard, Pill, StepHeader, labelClass } from "../onboarding-ui";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((s): s is string => typeof s === "string")
    : [];
}

export default function PreferencesSection({
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
  const learningPreferences = asStringArray(data.learningPreferences);
  const options = [
    ...stage.preferences.options,
    ...learningPreferences.filter((p) => !stage.preferences.options.includes(p)),
  ];

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
        subtitle={stage.preferences.subtitle}
      />

      <div>
        <p className={labelClass}>{stage.preferences.prompt}</p>
        <div className="flex flex-wrap gap-2.5">
          {options.map((pref) => {
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
