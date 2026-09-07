"use client";

import React from "react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

export type McqReviewQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  yourIndex: number | null;
  isCorrect: boolean;
};

export type AnswerReviewPayload =
  | { type: "mcq"; questions: McqReviewQuestion[] }
  | {
      type: "coding";
      functionName: string;
      examples: { input: string; output: string }[];
      publicTests: { args: unknown[]; expected: unknown }[];
      hiddenTests: { args: unknown[]; expected: unknown }[];
    };

export default function AnswerReview({ review }: { review: AnswerReviewPayload }) {
  if (review.type === "mcq") {
    return (
      <div className="mt-5 text-left">
        <div className="type-label mb-2.5">Answers</div>
        <div className="flex flex-col gap-3">
          {review.questions.map((q, i) => (
            <Card key={q.id} className="bg-sunken p-3.5">
              <div className="type-label mb-2">
                {i + 1}. {q.prompt}
              </div>
              <div className="flex flex-col gap-1.5">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correctIndex;
                  const isYours = oi === q.yourIndex;
                  return (
                    <div
                      key={oi}
                      className={cn(
                        "rounded-[var(--radius-sm)] px-2.5 py-2 type-small text-ink",
                        isCorrect && "border border-success bg-success-soft",
                        isYours && !isCorrect && "border border-danger bg-danger-soft",
                        !isCorrect && !isYours && "border border-transparent",
                      )}
                    >
                      {String.fromCharCode(65 + oi)}. {opt}
                      {isCorrect ? " ✓ correct" : ""}
                      {isYours && !isCorrect ? " · your answer" : ""}
                      {isYours && isCorrect ? " · your answer" : ""}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const allTests = [
    ...review.publicTests.map((t, i) => ({ ...t, label: `Public ${i + 1}` })),
    ...review.hiddenTests.map((t, i) => ({ ...t, label: `Hidden ${i + 1}` })),
  ];

  return (
    <div className="mt-5 text-left">
      <div className="type-label mb-2.5">Expected answers ({review.functionName})</div>
      {review.examples?.length > 0 && (
        <div className="mb-3">
          {review.examples.map((ex, i) => (
            <div key={i} className="type-code mb-1 text-muted">
              Example {i + 1}: {ex.input} → {ex.output}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {allTests.map((t, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-md)] border border-line bg-sunken p-3 type-code"
          >
            <div className="mb-1 text-muted">{t.label}</div>
            <div>
              args: {JSON.stringify(t.args)} → expected: {JSON.stringify(t.expected)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
