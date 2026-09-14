"use client";

import { Compass, Sparkles, Target } from "lucide-react";
import { HIRING_ROLES } from "@/lib/roadmap/hiring-catalog";
import {
  CAREER_INTERESTS,
  OUTCOMES,
  STRENGTHS,
  WORK_STYLES,
  careerHelpIncomplete,
  followUpsFor,
  suggestRolesFromHelp,
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

function applyHelpPatch(data: OnboardingCareer, patch: Partial<OnboardingCareer>): OnboardingCareer {
  const next = { ...data, ...patch };
  const suggestions = suggestRolesFromHelp(next);
  const keep =
    next.targetRole && suggestions.some((role) => role.name === next.targetRole)
      ? next.targetRole
      : suggestions[0]?.name || "";
  return { ...next, targetRole: keep };
}

export default function CareerStep({
  data,
  onChange,
}: {
  data: OnboardingCareer;
  onChange: (next: OnboardingCareer) => void;
}) {
  const set = (patch: Partial<OnboardingCareer>) => onChange(applyHelpPatch(data, patch));
  const followUps = followUpsFor(data.interests);
  const followUpsDone = followUps.every((q) => Boolean(data.followUps[q.id]));
  const suggestions = suggestRolesFromHelp(data);
  const showFollowUps = data.path === "help" && data.interests.length > 0;
  const showStyle = showFollowUps && followUpsDone;
  const showStrengths = showStyle && Boolean(data.workStyle);
  const showOutcome = showStrengths && data.strengths.length > 0;
  const showSuggestions = showOutcome && Boolean(data.outcome) && !careerHelpIncomplete(data);
  const knownRoleNames = new Set(HIRING_ROLES.map((r) => r.name));
  const customRole =
    data.targetRole && !knownRoleNames.has(data.targetRole) ? data.targetRole : "";

  const toggleInterest = (id: string) => {
    const interests = data.interests.includes(id)
      ? data.interests.filter((item) => item !== id)
      : [...data.interests, id];
    const allowed = new Set(followUpsFor(interests).map((q) => q.id));
    const followUpAnswers = Object.fromEntries(
      Object.entries(data.followUps).filter(([key]) => allowed.has(key)),
    );
    onChange(
      applyHelpPatch(data, {
        interests,
        followUps: followUpAnswers,
      }),
    );
  };

  const toggleStrength = (id: string) => {
    const strengths = data.strengths.includes(id)
      ? data.strengths.filter((item) => item !== id)
      : [...data.strengths, id];
    set({ strengths });
  };

  return (
    <OnboardingCard>
      <StepHeader
        icon={<Compass size={22} aria-hidden />}
        kicker="Direction"
        title="Have you decided a career?"
        subtitle="If you already know the role, pick it. If not, we’ll ask a few questions that change based on your answers."
      />

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <ChoiceCard
          selected={data.path === "decided"}
          onClick={() =>
            onChange({
              ...data,
              path: "decided",
              interests: [],
              workStyle: "",
              strengths: [],
              outcome: "",
              followUps: {},
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
          onClick={() => set({ path: "help" })}
        >
          <Sparkles size={22} className="text-primary" aria-hidden />
          <p className="type-h4 mt-2.5 mb-0 text-ink">Help me decide</p>
          <p className="type-small mt-1.5 mb-0 text-muted">
            Short follow-ups — interests, how you work, then a ranked match.
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
                onClick={() => onChange({ ...data, targetRole: role.name })}
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
            onChange={(e) => onChange({ ...data, targetRole: e.target.value })}
          />
        </div>
      ) : null}

      {data.path === "help" ? (
        <div className="flex flex-col gap-6">
          <div>
            <p className={labelClass}>What sounds interesting? Pick one or more.</p>
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

          {showFollowUps
            ? followUps.map((question) => (
                <div key={question.id}>
                  <p className={labelClass}>{question.prompt}</p>
                  <div className="grid gap-2.5">
                    {question.options.map((option) => (
                      <ChoiceCard
                        key={option.id}
                        selected={data.followUps[question.id] === option.id}
                        onClick={() =>
                          set({
                            followUps: { ...data.followUps, [question.id]: option.id },
                          })
                        }
                      >
                        <p className="type-body m-0 font-semibold text-ink">{option.label}</p>
                      </ChoiceCard>
                    ))}
                  </div>
                </div>
              ))
            : null}

          {showStyle ? (
            <div>
              <p className={labelClass}>How do you like to spend a workday?</p>
              <div className="grid gap-2.5">
                {WORK_STYLES.map((option) => (
                  <ChoiceCard
                    key={option.id}
                    selected={data.workStyle === option.id}
                    onClick={() => set({ workStyle: option.id })}
                  >
                    <p className="type-body m-0 font-semibold text-ink">{option.label}</p>
                  </ChoiceCard>
                ))}
              </div>
            </div>
          ) : null}

          {showStrengths ? (
            <div>
              <p className={labelClass}>What are you already decent at? Pick any that fit.</p>
              <div className="flex flex-wrap gap-2">
                {STRENGTHS.map((option) => (
                  <Pill
                    key={option.id}
                    selected={data.strengths.includes(option.id)}
                    onClick={() => toggleStrength(option.id)}
                  >
                    {option.label}
                  </Pill>
                ))}
              </div>
            </div>
          ) : null}

          {showOutcome ? (
            <div>
              <p className={labelClass}>What do you want next?</p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {OUTCOMES.map((option) => (
                  <ChoiceCard
                    key={option.id}
                    selected={data.outcome === option.id}
                    onClick={() => set({ outcome: option.id })}
                  >
                    <p className="type-body m-0 font-semibold text-ink">{option.label}</p>
                  </ChoiceCard>
                ))}
              </div>
            </div>
          ) : null}

          {showSuggestions ? (
            <div>
              <p className={labelClass}>Suggested careers</p>
              <div className="grid gap-2.5">
                {suggestions.map((role, index) => (
                  <ChoiceCard
                    key={role.id}
                    selected={data.targetRole === role.name}
                    onClick={() => onChange({ ...data, targetRole: role.name })}
                  >
                    <p className="type-h4 m-0 text-ink">
                      {index === 0 ? "Best match · " : ""}
                      {role.name}
                    </p>
                    <p className="type-small mt-1.5 mb-0 text-muted">{role.summary}</p>
                    {role.reasons.length ? (
                      <p className="type-caption mt-2 mb-0 text-faint">
                        {role.reasons.join(" · ")}
                      </p>
                    ) : null}
                  </ChoiceCard>
                ))}
              </div>
            </div>
          ) : data.interests.length === 0 ? (
            <p className="type-small m-0 text-muted">
              Select interests first. Follow-up questions will change based on what you pick.
            </p>
          ) : null}
        </div>
      ) : null}
    </OnboardingCard>
  );
}
