"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { ProjectRubricBreakdownItem } from "@/lib/projects/types";
import { ProjectRubricList } from "@/components/projects/ProjectWorkspace";
import { Badge, Button, Card } from "@/components/ui";

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
      className="fixed inset-0 flex items-center justify-center overflow-auto bg-canvas p-6"
      style={{ zIndex: "var(--z-modal)" }}
    >
      <Card
        className={`mx-auto w-full text-center ${passed ? "max-w-md" : "max-w-xl"}`}
      >
        <Badge tone={passed ? "success" : "error"}>
          {passed ? "Passed" : "Not passed"}
        </Badge>
        <p
          className={`type-h1 mt-3 mb-0 leading-none ${passed ? "text-success" : "text-danger"}`}
        >
          {score}%
        </p>
        <p className="type-small mt-2 mb-0 text-muted">
          Pass mark: {passMark}%
          {!passed ? ` · Need ${Math.max(0, passMark - score)} more points` : ""}
        </p>
        <h2 className="type-h3 mt-3 mb-2 text-ink">
          {passed
            ? alreadySolved
              ? "Already completed"
              : "Challenge complete!"
            : "Not quite — here’s what’s missing"}
        </h2>
        <p className="type-body m-0 text-muted">
          {passed
            ? alreadySolved
              ? "No extra XP this time. Returning to Challenges."
              : `+${xp} XP · ${coins} coins awarded. Returning to Challenges.`
            : "Fix the items below, then submit again. No XP until you pass."}
        </p>

        {!passed && missing.length > 0 ? (
          <div className="mt-5 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--error)_28%,var(--border-light))] bg-danger-soft p-3.5 text-left">
            <p className="type-label mb-2.5 text-danger">To pass, complete:</p>
            <ol className="m-0 grid list-decimal gap-2.5 pl-4.5">
              {missing.map((b) => (
                <li key={b.id} className="type-small text-ink">
                  <strong>{b.label}</strong>
                  <div className="mt-0.5 font-medium text-muted">{b.detail}</div>
                  <div className="type-caption mt-0.5 font-semibold text-danger">
                    0/{b.weight} pts
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {!passed && breakdown && breakdown.length > 0 ? (
          <div className="mt-2">
            <ProjectRubricList breakdown={breakdown} />
          </div>
        ) : null}

        {passed ? (
          <p className="type-small mt-5 mb-0 font-semibold text-muted">
            Returning in {autoAdvanceIn}s…
          </p>
        ) : null}

        <div className="mt-3 flex flex-col gap-2">
          {!passed && onRetry ? (
            <Button className="w-full" onClick={onRetry}>
              Fix & submit again
            </Button>
          ) : null}
          <Button
            variant={passed ? "primary" : "secondary"}
            className="w-full"
            onClick={finish}
          >
            Back to Challenges
          </Button>
        </div>
      </Card>
    </div>
  );
}
