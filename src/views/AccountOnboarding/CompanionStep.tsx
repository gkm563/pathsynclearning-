"use client";

import { Input } from "@/components/ui";
import {
  COPILOT_NAME_MAX,
  COPILOT_NAME_SUGGESTIONS,
  DEFAULT_COPILOT_NAME,
} from "@/lib/ai/copilot-identity";
import type { OnboardingCompanion } from "@/lib/onboarding/types";
import { cn } from "@/lib/cn";
import { CompanionAvatar } from "@/components/copilot/CompanionAvatar";
import { CopilotMemoryImport } from "@/components/copilot/CopilotMemoryImport";
import {
  OnboardingCard,
  Pill,
  StepHeader,
  labelClass,
} from "@/views/RoadmapOnboarding/onboarding-ui";

export default function CompanionStep({
  data,
  studentName,
  onChange,
}: {
  data: OnboardingCompanion;
  studentName: string;
  onChange: (next: OnboardingCompanion) => void;
}) {
  const first = studentName.trim().split(/\s+/)[0] || "there";
  const preview = data.skipName || !data.name.trim() ? DEFAULT_COPILOT_NAME : data.name.trim();

  return (
    <OnboardingCard>
      <StepHeader
        icon={<CompanionAvatar name={preview} size="lg" />}
        kicker="Your person here"
        title="Meet your companion"
        subtitle={`${first}, this isn’t a chatbot tab. Name your PathED friend, or skip and we’ll call them ${DEFAULT_COPILOT_NAME}.`}
      />

      <div>
        <p className={labelClass}>Pick a name</p>
        <div className="flex flex-wrap gap-2">
          {COPILOT_NAME_SUGGESTIONS.map((name) => (
            <Pill
              key={name}
              selected={!data.skipName && data.name === name}
              onClick={() => onChange({ ...data, name, skipName: false })}
            >
              {name}
            </Pill>
          ))}
        </div>
        <Input
          className="mt-3"
          value={data.skipName ? "" : data.name}
          maxLength={COPILOT_NAME_MAX}
          placeholder={`Or type a name (default ${DEFAULT_COPILOT_NAME})`}
          onChange={(e) =>
            onChange({ ...data, name: e.target.value, skipName: false })
          }
        />
      </div>

      <CopilotMemoryImport
        source={data.memorySource}
        memory={data.memoryText}
        companionName={preview}
        studentFirstName={first}
        onSource={(memorySource) => onChange({ ...data, memorySource })}
        onMemory={(memoryText) => onChange({ ...data, memoryText })}
      />

      <div
        className={cn(
          "flex items-center gap-3 rounded-[var(--radius-md)] border border-line bg-sunken px-3 py-3",
        )}
      >
        <CompanionAvatar name={preview} />
        <p className="type-small m-0 text-muted">
          You’ll see <span className="font-semibold text-ink">{preview}</span> in the
          bar. Rename anytime in profile preferences.
        </p>
      </div>
    </OnboardingCard>
  );
}
