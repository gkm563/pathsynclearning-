"use client";

import { Compass, Sparkles, Target } from "lucide-react";
import { HIRING_ROLES } from "@/lib/roadmap/hiring-catalog";
import {
  CAREER_INTERESTS,
  suggestRolesFromInterests,
} from "@/lib/onboarding/career-help";
import type { OnboardingCareer } from "@/lib/onboarding/types";
import { Input } from "@/components/ui";
import {
  ChoiceCard,
  OnboardingCard,
  Pill,
  StepHeader,
  labelClass,
} from "@/views/RoadmapOnboarding/onboarding-ui";

export default function CareerStep({
  data,
  onChange,
}: {
  data: OnboardingCareer;
  onChange: (next: OnboardingCareer) => void;
}) {
  const set = (patch: Partial<OnboardingCareer>) => onChange({ ...data, ...patch });
  const suggestions = suggestRolesFromInterests(data.interests);
  const knownRoleNames = new Set(HIRING_ROLES.map((r) => r.name));
  const customRole =
    data.targetRole && !knownRoleNames.has(data.targetRole) ? data.targetRole : "";

  const toggleInterest = (id: string) => {
    const next = data.interests.includes(id)
      ? data.interests.filter((item) => item !== id)
      : [...data.interests, id];
    const nextSuggestions = suggestRolesFromInterests(next);
    const keepRole =
      data.targetRole && nextSuggestions.some((r) => r.name === data.targetRole)
        ? data.targetRole
        : nextSuggestions[0]?.name || "";
    set({ interests: next, targetRole: keepRole });
  };

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Compass size={22} aria-hidden />}
        kicker="Direction"
        title="Have you decided a career?"
        subtitle="If you already know the role, pick it. If not, tell us what you enjoy and we’ll suggest a few."
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <ChoiceCard
          selected={data.path === "decided"}
          onClick={() =>
            set({
              path: "decided",
              interests: [],
              targetRole: knownRoleNames.has(data.targetRole) ? data.targetRole : "",
            })
          }
        >
          <Target size={22} className="text-primary" aria-hidden />
          <p className="type-h4 mt-2.5 mb-0 text-ink">I already decided</p>
          <p className="type-small mt-1.5 mb-0 text-muted">
            Choose the career or role you are aiming for.
          </p>
        </ChoiceCard>
        <ChoiceCard
          selected={data.path === "help"}
          onClick={() =>
            set({
              path: "help",
              targetRole: suggestions[0]?.name || "",
            })
          }
        >
          <Sparkles size={22} className="text-primary" aria-hidden />
          <p className="type-h4 mt-2.5 mb-0 text-ink">Help me decide</p>
          <p className="type-small mt-1.5 mb-0 text-muted">
            Pick interests and we’ll recommend a starting career.
          </p>
        </ChoiceCard>
      </div>

      {data.path === "decided" ? (
        <div>
          <p className={labelClass}>Your target career</p>
          <div className="flex flex-wrap gap-2">
            {HIRING_ROLES.map((role) => (
              <Pill
                key={role.id}
                selected={data.targetRole === role.name}
                onClick={() => set({ targetRole: role.name })}
              >
                {role.name}
              </Pill>
            ))}
          </div>
          <label className={`${labelClass} mt-4`} htmlFor="onb-custom-role">
            Or type a different role
          </label>
          <Input
            id="onb-custom-role"
            placeholder="e.g. Game developer"
            value={customRole}
            onChange={(e) => set({ targetRole: e.target.value })}
          />
        </div>
      ) : null}

      {data.path === "help" ? (
        <div className="flex flex-col gap-5">
          <div>
            <p className={labelClass}>What sounds interesting?</p>
            <div className="flex flex-wrap gap-2">
              {CAREER_INTERESTS.map((interest) => (
                <Pill
                  key={interest.id}
                  selected={data.interests.includes(interest.id)}
                  onClick={() => toggleInterest(interest.id)}
                >
                  {interest.label}
                </Pill>
              ))}
            </div>
          </div>
          {suggestions.length ? (
            <div>
              <p className={labelClass}>Suggested careers</p>
              <div className="grid gap-2.5">
                {suggestions.map((role, index) => (
                  <ChoiceCard
                    key={role.id}
                    selected={data.targetRole === role.name}
                    onClick={() => set({ targetRole: role.name })}
                  >
                    <p className="type-h4 m-0 text-ink">
                      {index === 0 ? "Best match · " : ""}
                      {role.name}
                    </p>
                    <p className="type-small mt-1.5 mb-0 text-muted">{role.summary}</p>
                  </ChoiceCard>
                ))}
              </div>
            </div>
          ) : (
            <p className="type-small m-0 text-muted">
              Select one or more interests to see role suggestions.
            </p>
          )}
        </div>
      ) : null}
    </OnboardingCard>
  );
}
