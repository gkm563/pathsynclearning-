"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { ProjectRubricBreakdownItem } from "@/lib/projects/types";
import { ProjectRubricList } from "@/components/projects/ProjectWorkspace";

/**
 * Same PASSED / score% overlay used by roadmap assessments, for Challenges.
 */
export default function ChallengeResultScreen({
  score,
  passed,
  passMark,
  xp,
  coins,
  alreadySolved,
  breakdown,
  onDone,
  onRetry,
}: {
  score: number;
  passed: boolean;
  passMark: number;
  xp: number;
  coins: number;
  alreadySolved?: boolean;
  breakdown?: ProjectRubricBreakdownItem[];
  onDone: () => void;
  onRetry?: () => void;
}) {
  const [autoAdvanceIn, setAutoAdvanceIn] = useState(passed ? 3 : 0);
  const missing = (breakdown || []).filter(
    (b) => !b.passed && b.label.toLowerCase() !== "manual review",
  );

  const finish = useCallback(() => {
    onDone();
  }, [onDone]);

  useEffect(() => {
    if (!passed) return;
    if (autoAdvanceIn <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setAutoAdvanceIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [autoAdvanceIn, finish, passed]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        background: "var(--bg-main, #f8fafc)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        overflow: "auto",
      }}
    >
      <div
        style={{
          background: "var(--bg-card, #fff)",
          border: "1px solid var(--border-light, rgba(15,23,42,0.1))",
          borderRadius: 16,
          padding: 32,
          maxWidth: passed ? 480 : 560,
          width: "100%",
          textAlign: "center",
          margin: "auto",
        }}
      >
        <div
          style={{
            fontFamily: "Fira Code, monospace",
            fontSize: 12,
            fontWeight: 700,
            color: passed ? "#059669" : "#ef4444",
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          {passed ? "PASSED" : "NOT PASSED"}
        </div>
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 56,
            fontWeight: 800,
            color: passed ? "#00c9a7" : "#ef4444",
            lineHeight: 1,
          }}
        >
          {score}%
        </div>
        <p
          style={{
            color: "var(--text-muted, #64748b)",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            marginTop: 8,
          }}
        >
          Pass mark: {passMark}%
          {!passed ? ` · Need ${Math.max(0, passMark - score)} more points` : ""}
        </p>
        <h2
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 20,
            margin: "12px 0 8px",
            color: "var(--text-main, #0f172a)",
          }}
        >
          {passed
            ? alreadySolved
              ? "Already completed"
              : "Challenge complete!"
            : "Not quite — here’s what’s missing"}
        </h2>
        <p
          style={{
            color: "var(--text-muted, #64748b)",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            margin: 0,
          }}
        >
          {passed
            ? alreadySolved
              ? "No extra XP this time. Returning to Challenges."
              : `+${xp} XP · ${coins} coins awarded. Returning to Challenges.`
            : "Fix the items below, then submit again. No XP until you pass."}
        </p>

        {!passed && missing.length > 0 ? (
          <div
            style={{
              marginTop: 20,
              textAlign: "left",
              padding: 14,
              borderRadius: 12,
              border: "1px solid rgba(239,68,68,0.25)",
              background: "rgba(239,68,68,0.06)",
            }}
          >
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontWeight: 800,
                fontSize: 14,
                color: "#b91c1c",
                marginBottom: 10,
              }}
            >
              To pass, complete:
            </div>
            <ol
              style={{
                margin: 0,
                paddingLeft: 18,
                display: "grid",
                gap: 10,
              }}
            >
              {missing.map((b) => (
                <li
                  key={b.id}
                  style={{
                    fontFamily: "Outfit, sans-serif",
                    fontSize: 13.5,
                    color: "var(--text-main)",
                    lineHeight: 1.45,
                  }}
                >
                  <strong>{b.label}</strong>
                  <div
                    style={{
                      color: "var(--text-muted)",
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    {b.detail}
                  </div>
                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 12,
                      color: "#ef4444",
                      fontWeight: 700,
                    }}
                  >
                    0/{b.weight} pts
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {!passed && breakdown && breakdown.length > 0 ? (
          <div style={{ marginTop: 8 }}>
            <ProjectRubricList breakdown={breakdown} />
          </div>
        ) : null}

        {passed ? (
          <p
            style={{
              marginTop: 20,
              fontFamily: "Outfit, sans-serif",
              fontWeight: 600,
              fontSize: 14,
              color: "var(--text-muted, #64748b)",
            }}
          >
            Returning in {autoAdvanceIn}s…
          </p>
        ) : null}

        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {!passed && onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              style={{
                width: "100%",
                padding: "12px 24px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
                color: "#fff",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Fix & submit again
            </button>
          ) : null}
          <button
            type="button"
            onClick={finish}
            style={{
              width: "100%",
              padding: "12px 24px",
              borderRadius: 10,
              border: passed ? "none" : "1.5px solid var(--border-light)",
              background: passed ? "#00c9a7" : "transparent",
              color: passed ? "#fff" : "var(--text-main)",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back to Challenges
          </button>
        </div>
      </div>
    </div>
  );
}
