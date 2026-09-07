"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { assessmentStatusLabel } from "@/lib/progress/calculate";
import type { ProgressAssessment } from "@/lib/progress/types";
import { Badge, Button, EmptyState, Progress } from "@/components/ui";
import { ProgressSection } from "@/components/progress/shared";
import { routes } from "@/lib/routes";

function statusTone(
  status: ProgressAssessment["status"],
): "success" | "error" | "accent" | "neutral" {
  switch (status) {
    case "passed":
    case "completed":
      return "success";
    case "failed":
      return "error";
    case "in_progress":
      return "accent";
    default:
      return "neutral";
  }
}

function ProgressBar({ pct }: { pct: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setW(pct);
      return;
    }
    const t = window.setTimeout(() => setW(pct), 60);
    return () => window.clearTimeout(t);
  }, [pct]);

  return (
    <Progress
      value={w}
      max={100}
      size="sm"
      label={`${pct}% complete`}
    />
  );
}

export function AssessmentProgressCard({
  assessment,
}: {
  assessment: ProgressAssessment;
}) {
  const router = useRouter();
  const cta =
    assessment.status === "not_started"
      ? "Start"
      : assessment.status === "completed" || assessment.status === "passed"
        ? "View"
        : "Continue";

  return (
    <article className="rounded-[var(--radius-md)] border border-line bg-sunken p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="type-h4 m-0 text-ink">{assessment.name}</h3>
          <p className="type-small mt-1 mb-0 text-muted">
            {assessment.description}
          </p>
        </div>
        <Badge tone={statusTone(assessment.status)}>
          {assessmentStatusLabel(assessment.status)}
        </Badge>
      </div>

      <div className="mb-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <ProgressBar pct={assessment.completion} />
        </div>
        <strong className="type-small tabular-nums text-ink">
          {assessment.completion}%
        </strong>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="type-small m-0 text-muted">
          {assessment.score !== null ? `Score: ${assessment.score}% · ` : null}
          {assessment.completedTasks} / {assessment.totalTasks} completed
        </p>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => router.push(assessment.href)}
        >
          {cta}
          <ArrowRight size={14} aria-hidden />
        </Button>
      </div>
    </article>
  );
}

export function AssessmentProgress({
  assessments,
}: {
  assessments: ProgressAssessment[];
}) {
  const router = useRouter();

  return (
    <ProgressSection title="Assessment progress">
      {assessments.length === 0 ? (
        <EmptyState
          compact
          title="No assessments yet"
          description="Start a challenge or generate a roadmap to track assessment progress."
          action={
            <Button onClick={() => router.push(routes.app.challenges)}>
              Start an assessment
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {assessments.slice(0, 12).map((a) => (
            <AssessmentProgressCard key={a.id} assessment={a} />
          ))}
        </div>
      )}
    </ProgressSection>
  );
}
