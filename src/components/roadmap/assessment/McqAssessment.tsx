"use client";

import React, { useState } from "react";
import type { NodeAssessment } from "@/types/roadmap";

export default function McqAssessment({
  assessment,
  onSubmit,
  submitting,
}: {
  assessment: NodeAssessment;
  onSubmit: (answers: Record<string, number>) => void;
  submitting: boolean;
}) {
  const questions = assessment.mcq?.questions || [];
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <p style={{ color: "var(--text-muted)", fontFamily: "Inter", fontSize: 14 }}>
        Answer all questions. Passing score: {assessment.passScore}%. Copy/paste and tab
        switching are disabled.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 16 }}>
        {questions.map((q, idx) => (
          <div
            key={q.id}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div
              style={{
                fontFamily: "Outfit",
                fontWeight: 700,
                marginBottom: 12,
                fontSize: 16,
              }}
            >
              {idx + 1}. {q.prompt}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                return (
                  <button
                    key={oi}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      borderRadius: 8,
                      border: selected
                        ? "1.5px solid #6c63ff"
                        : "1px solid var(--border-light)",
                      background: selected ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                      color: "var(--text-main)",
                      cursor: "pointer",
                      fontFamily: "Inter",
                      fontSize: 14,
                    }}
                  >
                    {String.fromCharCode(65 + oi)}. {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={!allAnswered || submitting}
        onClick={() => onSubmit(answers)}
        style={{
          marginTop: 24,
          width: "100%",
          padding: 14,
          borderRadius: 10,
          border: "none",
          background: allAnswered ? "#6c63ff" : "var(--bg-alt)",
          color: allAnswered ? "#fff" : "var(--text-muted)",
          fontFamily: "Outfit",
          fontWeight: 700,
          cursor: allAnswered && !submitting ? "pointer" : "not-allowed",
        }}
      >
        {submitting ? "Submitting…" : "Submit answers"}
      </button>
    </div>
  );
}
