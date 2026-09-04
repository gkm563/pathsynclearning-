"use client";

import { Check, Circle } from "lucide-react";
import type { ProgressMilestone } from "@/lib/progress/types";
import { ProgressSection, PROGRESS_COLS } from "@/components/progress/shared";

export function MilestoneTracker({
  milestones,
}: {
  milestones: ProgressMilestone[];
}) {
  return (
    <ProgressSection title="Milestones">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.max(milestones.length, 1)}, minmax(0, 1fr))`,
          gap: 8,
          alignItems: "start",
        }}
        className="progress-milestone-grid"
      >
        {milestones.map((m, idx) => {
          const achieved = m.achieved;
          const next =
            !achieved &&
            milestones.slice(0, idx).every((x) => x.achieved);
          return (
            <div key={m.id} style={{ textAlign: "center", position: "relative" }}>
              {idx < milestones.length - 1 ? (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 16,
                    left: "50%",
                    width: "100%",
                    height: 3,
                    background: milestones[idx + 1]?.achieved
                      ? PROGRESS_COLS.success
                      : "var(--border-light)",
                    zIndex: 0,
                  }}
                />
              ) : null}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  margin: "0 auto 10px",
                  display: "grid",
                  placeItems: "center",
                  position: "relative",
                  zIndex: 1,
                  background: achieved
                    ? PROGRESS_COLS.success
                    : next
                      ? PROGRESS_COLS.primary
                      : "var(--bg-alt)",
                  color: achieved || next ? "#fff" : "var(--text-muted)",
                  border: achieved || next ? "none" : "1.5px solid var(--border-light)",
                }}
                title={`${m.title} (${m.threshold}%)`}
              >
                {achieved ? <Check size={16} /> : <Circle size={14} />}
              </div>
              <div
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 800,
                  fontSize: 13,
                  color: "var(--text-main)",
                }}
              >
                {m.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-muted)",
                  marginTop: 4,
                  lineHeight: 1.35,
                }}
              >
                {m.threshold}%
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .progress-milestone-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .progress-milestone-grid > div > span {
            display: none;
          }
          .progress-milestone-grid > div {
            display: grid !important;
            grid-template-columns: 34px 1fr;
            text-align: left !important;
            gap: 12px;
            align-items: center;
          }
          .progress-milestone-grid > div > div:first-of-type {
            margin: 0 !important;
          }
        }
      `}</style>
    </ProgressSection>
  );
}
