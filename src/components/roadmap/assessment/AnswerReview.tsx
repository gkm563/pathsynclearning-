"use client";

import React from "react";

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
      <div style={{ marginTop: 20, textAlign: "left" }}>
        <div
          style={{
            fontFamily: "Outfit",
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 10,
          }}
        >
          Answers
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {review.questions.map((q, i) => (
            <div
              key={q.id}
              style={{
                background: "var(--bg-alt)",
                borderRadius: 12,
                padding: 14,
                border: "1px solid var(--border-light)",
              }}
            >
              <div
                style={{
                  fontFamily: "Outfit",
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 8,
                }}
              >
                {i + 1}. {q.prompt}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correctIndex;
                  const isYours = oi === q.yourIndex;
                  return (
                    <div
                      key={oi}
                      style={{
                        fontFamily: "Inter",
                        fontSize: 13,
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: isCorrect
                          ? "rgba(5,150,105,0.12)"
                          : isYours && !isCorrect
                            ? "rgba(239,68,68,0.1)"
                            : "transparent",
                        border: isCorrect
                          ? "1px solid #059669"
                          : isYours && !isCorrect
                            ? "1px solid #ef4444"
                            : "1px solid transparent",
                        color: "var(--text-main)",
                      }}
                    >
                      {String.fromCharCode(65 + oi)}. {opt}
                      {isCorrect ? " ✓ correct" : ""}
                      {isYours && !isCorrect ? " · your answer" : ""}
                      {isYours && isCorrect ? " · your answer" : ""}
                    </div>
                  );
                })}
              </div>
            </div>
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
    <div style={{ marginTop: 20, textAlign: "left" }}>
      <div
        style={{
          fontFamily: "Outfit",
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 10,
        }}
      >
        Expected answers ({review.functionName})
      </div>
      {review.examples?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {review.examples.map((ex, i) => (
            <div
              key={i}
              style={{
                fontFamily: "Fira Code",
                fontSize: 12,
                color: "var(--text-muted)",
                marginBottom: 4,
              }}
            >
              Example {i + 1}: {ex.input} → {ex.output}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {allTests.map((t, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-alt)",
              borderRadius: 10,
              padding: 12,
              fontFamily: "Fira Code",
              fontSize: 12,
              border: "1px solid var(--border-light)",
            }}
          >
            <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{t.label}</div>
            <div>
              args: {JSON.stringify(t.args)} → expected: {JSON.stringify(t.expected)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
