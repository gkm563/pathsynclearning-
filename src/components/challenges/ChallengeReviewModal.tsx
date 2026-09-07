"use client";

import React from "react";
import AnswerReview, {
  type AnswerReviewPayload,
} from "@/components/roadmap/assessment/AnswerReview";
import type { ChallengeSummary } from "@/lib/challenges/types";
import { Badge, Button, Card, Dialog } from "@/components/ui";

function buildReview(item: ChallengeSummary): AnswerReviewPayload | null {
  if (item.type === "mcq" && item.questions?.length) {
    const answers = item.lastAttempt?.answers || {};
    return {
      type: "mcq",
      questions: item.questions.map((q) => {
        const id = String(q.id);
        const yourIndex =
          answers[id] !== undefined ? Number(answers[id]) : null;
        return {
          id,
          prompt: q.q,
          options: q.opts,
          correctIndex: q.correct,
          yourIndex,
          isCorrect: yourIndex === q.correct,
        };
      }),
    };
  }

  if ((item.type === "coding" || item.coding) && item.coding) {
    return {
      type: "coding",
      functionName: item.coding.functionName,
      examples: item.coding.examples || [],
      publicTests: item.coding.publicTests || [],
      hiddenTests: item.coding.hiddenTests || [],
    };
  }

  return null;
}

export default function ChallengeReviewModal({
  item,
  onClose,
  onRetry,
}: {
  item: ChallengeSummary;
  onClose: () => void;
  onRetry: () => void;
}) {
  const review = buildReview(item);
  const passed = item.status === "solved";
  const score = item.score ?? 0;

  return (
    <Dialog
      open
      onClose={onClose}
      size="lg"
      title={item.title}
      description={`${item.type.toUpperCase()} · +${item.xp} XP when first passed${passed ? " · Solution unlocked" : ""}`}
      footer={
        <>
          <Button variant="secondary" className="sm:min-w-28" onClick={onClose}>
            Close
          </Button>
          <Button className="sm:min-w-36" onClick={onRetry}>
            Retry challenge
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <Badge tone={passed ? "success" : "error"}>
            {passed ? "Passed" : "Not passed"} · Review
          </Badge>
          <p
            className={`type-h1 m-0 leading-none ${passed ? "text-success" : "text-danger"}`}
          >
            {score}%
          </p>
        </div>

        {passed && review ? (
          <AnswerReview review={review} />
        ) : !passed ? (
          <p className="type-body m-0 text-muted">
            Score recorded. Pass this challenge to unlock the solution and
            answer key.
          </p>
        ) : (
          <p className="type-body m-0 text-muted">
            No attempt details saved yet. Retry the challenge to generate a
            review.
          </p>
        )}

        {passed && item.solution && (
          <Card className="border-primary-border bg-primary-soft">
            <h3 className="type-h4 m-0 text-ink">Solution</h3>
            <p className="type-small mt-2 mb-0 leading-relaxed text-ink">
              {item.solution.editorial}
            </p>
            {item.solution.complexity &&
              item.solution.complexity.toLowerCase() !== "n/a" && (
                <p className="type-code mt-2 mb-0 text-primary">
                  {item.solution.complexity}
                </p>
              )}
            {item.solution.notes && (
              <p className="type-caption mt-2 mb-0 text-muted">
                {item.solution.notes}
              </p>
            )}
          </Card>
        )}

        {passed && item.type === "mcq" && item.questions && item.questions.length > 0 && (
          <div>
            <h3 className="type-h4 mb-2 text-ink">Answer key</h3>
            <div className="flex flex-col gap-2.5">
              {item.questions.map((q, i) => {
                const letter = String.fromCharCode(65 + q.correct);
                const answer = q.opts[q.correct] ?? "—";
                return (
                  <Card key={String(q.id)} className="bg-sunken p-4 sm:p-4">
                    <p className="type-small m-0 font-semibold text-ink">
                      {i + 1}. {q.q}
                    </p>
                    <p className="type-small mt-1 mb-0 font-semibold text-success">
                      Correct: {letter}. {answer}
                    </p>
                    {q.explanation && (
                      <p className="type-caption mt-1.5 mb-0 leading-relaxed text-muted">
                        {q.explanation}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {passed && item.lastAttempt?.code && (
          <pre className="type-code m-0 max-h-56 overflow-auto rounded-[var(--radius-md)] bg-inverse p-3 text-on-inverse">
            {item.lastAttempt.code}
          </pre>
        )}
      </div>
    </Dialog>
  );
}
