"use client";

import React, { useCallback, useEffect, useState } from "react";

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
  onDone,
}: {
  score: number;
  passed: boolean;
  passMark: number;
  xp: number;
  coins: number;
  alreadySolved?: boolean;
  onDone: () => void;
}) {
  const [autoAdvanceIn, setAutoAdvanceIn] = useState(3);

  const finish = useCallback(() => {
    onDone();
  }, [onDone]);

  useEffect(() => {
    if (autoAdvanceIn <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setAutoAdvanceIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [autoAdvanceIn, finish]);

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
          maxWidth: 480,
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
            : "Not quite — try again"}
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
            : "Review the problem and submit again when ready. No XP until you pass."}
        </p>

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
        <button
          type="button"
          onClick={finish}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "12px 24px",
            borderRadius: 10,
            border: "none",
            background: passed ? "#00c9a7" : "#6c63ff",
            color: "#fff",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Challenges
        </button>
      </div>
    </div>
  );
}
