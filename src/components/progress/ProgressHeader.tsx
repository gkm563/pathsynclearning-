"use client";

import type { ProgressRange } from "@/lib/progress/types";

const OPTIONS: { id: ProgressRange; label: string }[] = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
];

export function ProgressHeader({
  range,
  onRangeChange,
}: {
  range: ProgressRange;
  onRangeChange: (range: ProgressRange) => void;
}) {
  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 8,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: "Outfit, sans-serif",
            fontSize: "clamp(26px, 4vw, 34px)",
            fontWeight: 800,
            color: "var(--text-main)",
            letterSpacing: "-0.02em",
          }}
        >
          Your Progress
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            color: "var(--text-muted)",
            fontSize: 15,
            maxWidth: 520,
            lineHeight: 1.5,
          }}
        >
          Track your journey, performance, assessments, and milestones.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Time range"
        style={{
          display: "inline-flex",
          gap: 4,
          padding: 4,
          borderRadius: 14,
          background: "var(--bg-alt)",
          border: "1.5px solid var(--border-light)",
        }}
      >
        {OPTIONS.map((opt) => {
          const active = range === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onRangeChange(opt.id)}
              style={{
                border: "none",
                cursor: "pointer",
                borderRadius: 10,
                padding: "8px 14px",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                fontSize: 13,
                background: active
                  ? "linear-gradient(135deg, #6c63ff, #00c9a7)"
                  : "transparent",
                color: active ? "#fff" : "var(--text-muted)",
                transition: "opacity 0.15s ease, transform 0.15s ease",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
