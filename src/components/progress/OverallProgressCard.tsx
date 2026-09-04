"use client";

import { useEffect, useState } from "react";
import { Clock, Focus } from "lucide-react";
import {
  formatRelativeTime,
  statusLabel,
} from "@/lib/progress/calculate";
import type { ProgressSummary } from "@/lib/progress/types";
import { PROGRESS_COLS, cardStyle } from "@/components/progress/shared";

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
    const target = circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference;
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
        stroke="var(--border-light)"
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
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "90px 90px",
          transition: reduced ? undefined : "stroke-dashoffset 1.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      />
    </svg>
  );
}

function statusColor(status: ProgressSummary["status"]) {
  switch (status) {
    case "on-track":
    case "completed":
      return PROGRESS_COLS.success;
    case "needs-attention":
      return PROGRESS_COLS.danger;
    case "in-progress":
      return PROGRESS_COLS.primary;
    default:
      return PROGRESS_COLS.warning;
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
    <article
      style={{
        ...cardStyle,
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 24,
        alignItems: "center",
        background:
          "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,201,167,0.06))",
      }}
      className="progress-overall-card"
    >
      <div style={{ position: "relative", width: 180, height: 180 }}>
        <AnimatedCircle pct={summary.completion} reduced={reduced} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 40,
                fontWeight: 800,
                color: "var(--text-main)",
                lineHeight: 1,
              }}
            >
              {displayPct}%
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
              complete
            </div>
          </div>
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 999,
            background: `${statusColor(summary.status)}18`,
            color: statusColor(summary.status),
            fontWeight: 700,
            fontSize: 13,
            fontFamily: "Outfit, sans-serif",
            marginBottom: 12,
          }}
        >
          {statusLabel(summary.status)}
        </div>

        <p
          style={{
            margin: "0 0 8px",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-main)",
            fontFamily: "Outfit, sans-serif",
          }}
        >
          {summary.completedTasks} / {summary.totalTasks} tasks completed
        </p>

        <p style={{ margin: "0 0 14px", color: "var(--text-muted)", fontSize: 14 }}>
          {summary.averageScore !== null
            ? `${summary.averageScore}% Average Score`
            : "No scores yet"}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          {summary.currentFocus ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Focus size={14} />
              {summary.currentFocus}
            </span>
          ) : null}
          {summary.lastActivityAt ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Clock size={14} />
              Last activity {formatRelativeTime(summary.lastActivityAt)}
            </span>
          ) : null}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .progress-overall-card {
            grid-template-columns: 1fr !important;
            justify-items: center;
            text-align: center;
          }
          .progress-overall-card > div:last-child > div:last-child {
            justify-content: center;
          }
        }
      `}</style>
    </article>
  );
}
