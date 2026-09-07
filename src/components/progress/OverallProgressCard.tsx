"use client";

import { useEffect, useState } from "react";
import { Clock, Focus } from "lucide-react";
import { formatRelativeTime, statusLabel } from "@/lib/progress/calculate";
import type { ProgressSummary } from "@/lib/progress/types";
import { Badge, Card } from "@/components/ui";
import { PROGRESS_COLS } from "@/components/progress/shared";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function AnimatedCircle({ pct, reduced }: { pct: number; reduced: boolean }) {
  const r = 72;
  const circumference = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const target =
      circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference;
    if (reduced) {
      setOffset(target);
      return;
    }
    const t = window.setTimeout(() => setOffset(target), 80);
    return () => window.clearTimeout(t);
  }, [pct, circumference, reduced]);

  return (
    <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden>
      <defs>
        <linearGradient id="progressRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={PROGRESS_COLS.primary} />
          <stop offset="100%" stopColor={PROGRESS_COLS.success} />
        </linearGradient>
      </defs>
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="var(--line)"
        strokeWidth="14"
      />
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke="url(#progressRingGrad)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="origin-[90px_90px] -rotate-90 motion-safe:transition-[stroke-dashoffset] motion-safe:duration-1000"
      />
    </svg>
  );
}

function statusTone(
  status: ProgressSummary["status"],
): "success" | "error" | "accent" | "warning" {
  switch (status) {
    case "on-track":
    case "completed":
      return "success";
    case "needs-attention":
      return "error";
    case "in-progress":
      return "accent";
    default:
      return "warning";
  }
}

export function OverallProgressCard({ summary }: { summary: ProgressSummary }) {
  const reduced = usePrefersReducedMotion();
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    if (reduced) {
      setDisplayPct(summary.completion);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const from = 0;
    const to = summary.completion;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const ease = t * (2 - t);
      setDisplayPct(Math.round(from + (to - from) * ease));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [summary.completion, reduced]);

  return (
    <Card className="grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)]">
      <div className="relative mx-auto h-[180px] w-[180px]">
        <AnimatedCircle pct={summary.completion} reduced={reduced} />
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="type-h1 m-0 tabular-nums text-ink">{displayPct}%</p>
            <p className="type-caption mt-1 mb-0 text-muted">complete</p>
          </div>
        </div>
      </div>

      <div className="min-w-0 text-center sm:text-left">
        <Badge tone={statusTone(summary.status)}>
          {statusLabel(summary.status)}
        </Badge>
        <p className="type-h4 mt-3 mb-1 text-ink">
          {summary.completedTasks} / {summary.totalTasks} tasks completed
        </p>
        <p className="type-small mt-0 mb-4 text-muted">
          {summary.averageScore !== null
            ? `${summary.averageScore}% average score`
            : "No scores yet"}
        </p>
        <div className="type-small flex flex-wrap justify-center gap-x-4 gap-y-2 text-muted sm:justify-start">
          {summary.currentFocus ? (
            <span className="inline-flex items-center gap-1.5">
              <Focus size={14} aria-hidden />
              {summary.currentFocus}
            </span>
          ) : null}
          {summary.lastActivityAt ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} aria-hidden />
              Last activity {formatRelativeTime(summary.lastActivityAt)}
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
