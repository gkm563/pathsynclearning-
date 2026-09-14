"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiSend } from "@/lib/api";
import { DEFAULT_COPILOT_NAME } from "@/lib/ai/copilot-identity";
import { setRoadmapDeferred } from "@/lib/roadmap/defer";
import { roadmapStartPath, routes } from "@/lib/routes";
import {
  careerHelpIncomplete,
  suggestRolesFromHelp,
} from "@/lib/onboarding/career-help";
import {
  EMPTY_ONBOARDING_BASICS,
  EMPTY_ONBOARDING_CAREER,
  EMPTY_ONBOARDING_COMPANION,
  type OnboardingBasics,
  type OnboardingCareer,
  type OnboardingCompanion,
  type OnboardingStatus,
} from "@/lib/onboarding/types";
import { Alert, Button } from "@/components/ui";
import { BrandMark } from "@/components/ui/BrandMark";
import { cn } from "@/lib/cn";
import BasicsStep from "./BasicsStep";
import CareerStep from "./CareerStep";
import CompanionStep from "./CompanionStep";
import RoadmapStep from "./RoadmapStep";

type Step = "basics" | "companion" | "career" | "roadmap";

export default function AccountOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("basics");
  const [basics, setBasics] = useState<OnboardingBasics>(EMPTY_ONBOARDING_BASICS);
  const [companion, setCompanion] = useState<OnboardingCompanion>(
    EMPTY_ONBOARDING_COMPANION,
  );
  const [career, setCareer] = useState<OnboardingCareer>(EMPTY_ONBOARDING_CAREER);
  const [generateNow, setGenerateNow] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiGet<OnboardingStatus>("/api/me/onboarding")
      .then((status) => {
        if (cancelled) return;
        if (status.completed) {
          router.replace(routes.app.dashboard);
          return;
        }
        setBasics({ ...EMPTY_ONBOARDING_BASICS, ...status.basics });
        setCareer({ ...EMPTY_ONBOARDING_CAREER, ...status.career });
        setCompanion({ ...EMPTY_ONBOARDING_COMPANION, ...status.companion });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const resolvedRole = useMemo(() => {
    const typed = career.targetRole.trim();
    if (typed) return typed;
    if (career.path === "help") {
      return suggestRolesFromHelp(career)[0]?.name ?? "";
    }
    return "";
  }, [career]);

  const companionPayload = (skipName = false) => ({
    name: skipName ? DEFAULT_COPILOT_NAME : companion.name,
    skipName: skipName || companion.skipName || !companion.name.trim(),
    memorySource: companion.memorySource,
    memoryText: companion.memoryText,
  });

  const persist = async (
    action: "save" | "complete",
    extra?: { generate?: boolean; skipCareer?: boolean; skipName?: boolean },
  ) => {
    const role = extra?.skipCareer ? null : resolvedRole || null;
    return apiSend<OnboardingStatus & { generateRoadmap?: boolean }>(
      "/api/me/onboarding",
      "POST",
      {
        action,
        basics,
        companion: companionPayload(extra?.skipName),
        skipCareer: extra?.skipCareer,
        career: extra?.skipCareer
          ? {
              path: null,
              targetRole: null,
              interests: [],
              workStyle: null,
              strengths: [],
              outcome: null,
              followUps: {},
            }
          : {
              path: career.path,
              targetRole: role,
              interests: career.interests,
              workStyle: career.workStyle || null,
              strengths: career.strengths,
              outcome: career.outcome || null,
              followUps: career.followUps,
            },
        generateRoadmap: extra?.generate,
      },
    );
  };

  const continueFromBasics = async () => {
    if (!basics.fullName.trim()) {
      setError("Add your name to continue.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await persist("save");
      setStep("companion");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your details.");
    } finally {
      setSaving(false);
    }
  };

  const continueFromCompanion = async (skipName = false) => {
    setSaving(true);
    setError(null);
    try {
      if (skipName) setCompanion((prev) => ({ ...prev, skipName: true, name: "" }));
      await persist("save", { skipName });
      setStep("career");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your companion.");
    } finally {
      setSaving(false);
    }
  };

  const continueFromCareer = async (skipCareer = false) => {
    if (!skipCareer) {
      if (!career.path) {
        setError("Choose whether you already decided, or let us help. You can skip career instead.");
        return;
      }
      if (career.path === "decided" && !resolvedRole) {
        setError("Pick a career, or type one.");
        return;
      }
      if (career.path === "help") {
        const missing = careerHelpIncomplete(career);
        if (missing) {
          setError(missing);
          return;
        }
      }
    }
    setSaving(true);
    setError(null);
    try {
      await persist("save", { skipCareer });
      setStep("roadmap");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your career choice.");
    } finally {
      setSaving(false);
    }
  };

  const finishRoadmap = async () => {
    if (generateNow === null) {
      setError("Choose generate now or skip for later.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      setRoadmapDeferred(!generateNow);
      await persist("complete", { generate: generateNow });
      router.replace(generateNow ? roadmapStartPath(resolvedRole) : routes.app.dashboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not finish setup.");
      setSaving(false);
    }
  };

  const steps: Step[] = ["basics", "companion", "career", "roadmap"];
  const active = steps.indexOf(step);
  const backStep: Record<Step, Step | null> = {
    basics: null,
    companion: "basics",
    career: "companion",
    roadmap: "career",
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-3xl items-center justify-center px-4">
        <p className="type-small m-0 text-muted">Loading setup…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <BrandMark href={routes.app.dashboard} size="md" />
        {step === "companion" ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => void continueFromCompanion(true)}
            disabled={saving}
          >
            Skip naming
          </Button>
        ) : step === "career" ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => void continueFromCareer(true)}
            disabled={saving}
          >
            Skip career
          </Button>
        ) : (
          <span />
        )}
      </header>

      <div>
        <p className="type-overline m-0 mb-2 text-faint">Optional setup</p>
        <h1 className="type-h2 m-0 text-ink">Welcome to PathEd</h1>
        <p className="type-body mt-2 mb-0 max-w-xl text-muted">
          Four short steps. Career stays in the flow — skip that step only if you want to.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" aria-label="Setup progress">
        {["Basics", "Companion", "Career", "Roadmap"].map((label, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <div key={label} className="min-w-14 flex-1">
              <div
                className={cn(
                  "h-1.5 rounded-full",
                  current ? "bg-primary" : done ? "bg-success" : "bg-sunken",
                )}
              />
              <p
                className={cn(
                  "type-caption mt-1.5 mb-0",
                  current ? "font-semibold text-ink" : "text-muted",
                )}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>

      {step === "basics" ? (
        <BasicsStep data={basics} onChange={setBasics} />
      ) : step === "companion" ? (
        <CompanionStep
          data={companion}
          studentName={basics.fullName}
          onChange={setCompanion}
        />
      ) : step === "career" ? (
        <CareerStep data={career} onChange={setCareer} />
      ) : (
        <RoadmapStep
          role={resolvedRole}
          generateNow={generateNow}
          onChange={setGenerateNow}
        />
      )}

      {error ? (
        <Alert tone="error" title="Couldn't continue">
          {error}
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={!backStep[step] || saving}
          onClick={() => {
            setError(null);
            const prev = backStep[step];
            if (prev) setStep(prev);
          }}
          className={!backStep[step] ? "invisible" : undefined}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={() => {
            if (step === "basics") void continueFromBasics();
            else if (step === "companion") void continueFromCompanion(false);
            else if (step === "career") void continueFromCareer(false);
            else void finishRoadmap();
          }}
          loading={saving}
        >
          {step === "roadmap"
            ? generateNow
              ? "Generate roadmap"
              : generateNow === false
                ? "Go to dashboard"
                : "Continue"
            : "Continue"}
        </Button>
      </div>
    </div>
  );
}
