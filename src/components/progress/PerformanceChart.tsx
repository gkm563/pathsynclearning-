"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { PerformancePoint } from "@/lib/progress/types";
import { EmptyState } from "@/components/ui/primitives";
import { ProgressSection, PROGRESS_COLS } from "@/components/progress/shared";

export function PerformanceChart({ points }: { points: PerformancePoint[] }) {
  const gid = useId();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setReady(true);
      return;
    }
    const t = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(t);
  }, [points]);

  const { pathScore, pathCompletion, dots } = useMemo(() => {
    const w = 560;
    const h = 200;
    const padX = 36;
    const padY = 24;
    const innerW = w - padX * 2;
    const innerH = h - padY * 2;

    if (points.length === 0) {
      return { pathScore: "", pathCompletion: "", dots: [] as Array<{ x: number; y: number; label: string; score: number | null }> };
    }

    const xs = points.map((_, i) =>
      points.length === 1
        ? padX + innerW / 2
        : padX + (i / (points.length - 1)) * innerW,
    );

    const scoreYs = points.map((p) => {
      const v = p.averageScore ?? 0;
      return padY + innerH - (v / 100) * innerH;
    });
    const completionYs = points.map((p) => {
      return padY + innerH - (p.completionPct / 100) * innerH;
    });

    const toPath = (ys: number[]) =>
      ys
        .map((y, i) => `${i === 0 ? "M" : "L"} ${xs[i].toFixed(1)} ${y.toFixed(1)}`)
        .join(" ");

    return {
      pathScore: toPath(scoreYs),
      pathCompletion: toPath(completionYs),
      dots: points.map((p, i) => ({
        x: xs[i],
        y: scoreYs[i],
        label: p.label,
        score: p.averageScore,
      })),
    };
  }, [points]);

  return (
    <ProgressSection title="Performance Over Time">
      {points.length === 0 ? (
        <EmptyState
          title="No performance history"
          description="Complete assessments to see your score trend over time."
        />
      ) : (
        <div>
          <div className="mb-3 flex gap-4 type-caption text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Score
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-success" />
              Completion trend
            </span>
          </div>

          <svg
            viewBox="0 0 560 200"
            width="100%"
            height="220"
            role="img"
            aria-label="Performance over time chart"
            className="h-[220px] w-full motion-safe:transition-opacity motion-safe:duration-300"
            style={{ opacity: ready ? 1 : 0 }}
          >
            {[0, 25, 50, 75, 100].map((tick) => {
              const y = 24 + (176 - 24) * (1 - tick / 100);
              return (
                <g key={tick}>
                  <line
                    x1={36}
                    x2={524}
                    y1={y}
                    y2={y}
                    stroke="var(--border-light)"
                    strokeDasharray="4 6"
                  />
                  <text
                    x={8}
                    y={y + 4}
                    fill="var(--text-muted)"
                    fontSize="10"
                    fontFamily="var(--font-body)"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            <path
              d={pathCompletion}
              fill="none"
              stroke={PROGRESS_COLS.success}
              strokeWidth={2}
              strokeDasharray="6 4"
              opacity={0.7}
            />
            <path
              d={pathScore}
              fill="none"
              stroke={`url(#${gid}-line)`}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id={`${gid}-line`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={PROGRESS_COLS.primary} />
                <stop offset="100%" stopColor={PROGRESS_COLS.info} />
              </linearGradient>
            </defs>

            {dots.map((d) => (
              <g key={`${d.label}-${d.x}`}>
                <circle
                  cx={d.x}
                  cy={d.y}
                  r={5}
                  fill={PROGRESS_COLS.primary}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  <title>
                    {d.label}: {d.score ?? "—"}%
                  </title>
                </circle>
              </g>
            ))}

            {points.map((p, i) => {
              const x =
                points.length === 1
                  ? 280
                  : 36 + (i / (points.length - 1)) * (560 - 72);
              return (
                <text
                  key={p.date}
                  x={x}
                  y={194}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="11"
                  fontFamily="var(--font-body)"
                >
                  {p.label}
                </text>
              );
            })}
          </svg>

          <p className="type-caption mt-2 mb-0 text-muted">
            {points.reduce((s, p) => s + p.attempts, 0)} assessment attempts in this range
          </p>
        </div>
      )}
    </ProgressSection>
  );
}
