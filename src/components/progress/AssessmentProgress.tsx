"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { assessmentStatusLabel } from "@/lib/progress/calculate";
import type { ProgressAssessment } from "@/lib/progress/types";
import { Button, EmptyState } from "@/components/ui/primitives";
import { ProgressSection, PROGRESS_COLS } from "@/components/progress/shared";
import { routes } from "@/lib/routes";

function statusTone(status: ProgressAssessment["status"]) {
  switch (status) {
    case "passed":
    case "completed":
      return PROGRESS_COLS.success;
    case "failed":
      return PROGRESS_COLS.danger;
    case "in_progress":
      return PROGRESS_COLS.primary;
    default:
      return PROGRESS_COLS.muted;
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
    <div
      style={{
        height: 10,
        borderRadius: 5,
        background: "var(--border-light)",
        overflow: "hidden",
      }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          height: "100%",
          width: `${w}%`,
          borderRadius: 5,
          background: `linear-gradient(90deg, ${PROGRESS_COLS.primary}, ${PROGRESS_COLS.success})`,
          transition: "width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      />
    </div>
  );
}

export function AssessmentProgressCard({
  assessment,
}: {
  assessment: ProgressAssessment;
}) {
  const router = useRouter();
  const tone = statusTone(assessment.status);
  const cta =
    assessment.status === "not_started"
      ? "Start"
      : assessment.status === "completed" || assessment.status === "passed"
        ? "View"
        : "Continue";

  return (
    <article
      style={{
        border: "1.5px solid var(--border-light)",
        borderRadius: 16,
        padding: 16,
        background: "var(--bg-alt)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              fontFamily: "Outfit, sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: "var(--text-main)",
            }}
          >
            {assessment.name}
          </h3>
          <p
            style={{
              margin: "6px 0 0",
              color: "var(--text-muted)",
              fontSize: 13,
              lineHeight: 1.45,
            }}
          >
            {assessment.description}
          </p>
        </div>
        <span
          style={{
            flexShrink: 0,
            fontSize: 12,
            fontWeight: 700,
            color: tone,
            background: `${tone === PROGRESS_COLS.muted ? "var(--border-light)" : tone + "18"}`,
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          {assessmentStatusLabel(assessment.status)}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <ProgressBar pct={assessment.completion} />
        </div>
        <strong style={{ fontSize: 13, color: "var(--text-main)" }}>
          {assessment.completion}%
        </strong>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
        }}
      >
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          {assessment.score !== null ? `Score: ${assessment.score}% · ` : null}
          {assessment.completedTasks} / {assessment.totalTasks} completed
        </div>
        <Button
          variant="secondary"
          onClick={() => router.push(assessment.href)}
          style={{ padding: "8px 12px", fontSize: 13 }}
        >
          {cta} <ArrowRight size={14} />
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
    <ProgressSection title="Assessment Progress">
      {assessments.length === 0 ? (
        <EmptyState
          title="No assessments yet"
          description="Start a challenge or generate a roadmap to track assessment progress."
          action={
            <Button onClick={() => router.push(routes.app.challenges)}>
              Start Assessment →
            </Button>
          }
        />
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {assessments.slice(0, 12).map((a) => (
            <AssessmentProgressCard key={a.id} assessment={a} />
          ))}
        </div>
      )}
    </ProgressSection>
  );
}
