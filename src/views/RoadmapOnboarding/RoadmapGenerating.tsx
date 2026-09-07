"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Network,
  Clock,
  Sparkles,
  Clapperboard,
  Check,
  Save,
  AlertCircle,
} from "lucide-react";
import {
  GENERATION_STEPS,
  type GenerationStepId,
  type RoadmapGenerationProgress,
} from "@/lib/roadmap/generation-progress";
import { Progress } from "@/components/ui";
import { cn } from "@/lib/cn";

const ICONS: Record<GenerationStepId, typeof Brain> = {
  profile: Brain,
  hiring: Network,
  graph: Sparkles,
  assessments: Clock,
  resources: Clapperboard,
  save: Save,
  done: Check,
};

export default function RoadmapGenerating({
  isOpen,
  progress,
  error,
  targetCompany,
  targetRole,
}: {
  isOpen: boolean;
  progress: RoadmapGenerationProgress | null;
  error?: string | null;
  targetCompany?: string | null;
  targetRole?: string;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setElapsed(0);
      return;
    }
    const started = Date.now();
    const t = window.setInterval(
      () => setElapsed(Math.floor((Date.now() - started) / 1000)),
      250,
    );
    return () => window.clearInterval(t);
  }, [isOpen]);

  if (!isOpen) return null;

  const step = progress?.step ?? "profile";
  const percent = error ? progress?.percent ?? 0 : progress?.percent ?? 8;
  const CurrentIcon = ICONS[step] || Sparkles;
  const stepIndex = GENERATION_STEPS.findIndex((s) => s.id === step);

  const headline = error
    ? "Generation failed"
    : targetCompany && (step === "hiring" || step === "graph")
      ? `Building a ${targetCompany}${targetRole ? ` ${targetRole}` : ""} hiring path`
      : progress?.message || GENERATION_STEPS[Math.max(0, stepIndex)].label;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[color-mix(in_srgb,var(--bg-main)_88%,black)] px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div
          className={cn(
            "grid h-16 w-16 place-items-center rounded-full border-2",
            error
              ? "border-[var(--error)] text-danger"
              : "border-primary text-primary",
          )}
        >
          {error ? (
            <AlertCircle size={32} aria-hidden />
          ) : (
            <CurrentIcon size={32} aria-hidden />
          )}
        </div>
        <h2 className="type-h3 m-0 max-w-lg text-ink">{headline}</h2>
        <p className="type-small m-0 text-muted">
          {error ? error : `${percent}% · ${elapsed}s elapsed`}
        </p>
      </div>

      <div className="mt-8 w-[360px] max-w-[92vw]">
        <Progress value={percent} tone={error ? "danger" : "primary"} label="Generation progress" />
        <ul className="mt-4 mb-0 flex list-none flex-col gap-2 p-0">
          {GENERATION_STEPS.filter((s) => s.id !== "done").map((s, i) => {
            const done = stepIndex > i || step === "done";
            const active = s.id === step && !error;
            return (
              <li
                key={s.id}
                className={cn(
                  "type-small flex items-center gap-2.5",
                  done || active ? "text-ink" : "text-faint",
                )}
              >
                <span
                  className={cn(
                    "grid h-4.5 w-4.5 place-items-center rounded-full border",
                    done
                      ? "border-success bg-success text-[var(--text-on-primary)]"
                      : active
                        ? "border-primary bg-primary-soft"
                        : "border-line",
                  )}
                >
                  {done ? <Check size={11} aria-hidden /> : null}
                </span>
                {s.label}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
