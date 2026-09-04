"use client";

import { CheckCircle2, CircleDashed, Loader2, Percent } from "lucide-react";
import type { ProgressSummary } from "@/lib/progress/types";
import { PROGRESS_COLS, cardStyle } from "@/components/progress/shared";

const STATS = [
  {
    key: "completed" as const,
    label: "Completed",
    icon: CheckCircle2,
    color: PROGRESS_COLS.success,
  },
  {
    key: "inProgress" as const,
    label: "In Progress",
    icon: Loader2,
    color: PROGRESS_COLS.primary,
  },
  {
    key: "pending" as const,
    label: "Pending",
    icon: CircleDashed,
    color: PROGRESS_COLS.warning,
  },
  {
    key: "averageScore" as const,
    label: "Average Score",
    icon: Percent,
    color: PROGRESS_COLS.info,
  },
];

export function ProgressStats({ summary }: { summary: ProgressSummary }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 12,
      }}
      className="progress-stats-grid"
    >
      {STATS.map((stat) => {
        const Icon = stat.icon;
        const raw =
          stat.key === "averageScore"
            ? summary.averageScore
            : summary[stat.key];
        const value =
          raw === null || raw === undefined
            ? "—"
            : stat.key === "averageScore"
              ? `${raw}%`
              : String(raw);

        return (
          <div key={stat.key} style={{ ...cardStyle, padding: 18 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                display: "grid",
                placeItems: "center",
                background: `${stat.color}18`,
                color: stat.color,
                marginBottom: 12,
              }}
            >
              <Icon size={18} />
            </div>
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 26,
                fontWeight: 800,
                color: "var(--text-main)",
                lineHeight: 1.1,
              }}
            >
              {value}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "var(--text-muted)",
                fontWeight: 600,
              }}
            >
              {stat.label}
            </div>
          </div>
        );
      })}

      <style>{`
        @media (max-width: 900px) {
          .progress-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </div>
  );
}
