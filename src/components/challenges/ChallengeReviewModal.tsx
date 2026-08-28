"use client";

import React from "react";
import AnswerReview, {
  type AnswerReviewPayload,
} from "@/components/roadmap/assessment/AnswerReview";
import type { ChallengeSummary } from "@/lib/challenges/types";

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
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1250,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        overflow: "auto",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card, #fff)",
          borderRadius: 16,
          border: "1px solid var(--border-light, rgba(15,23,42,0.1))",
          padding: 28,
          maxWidth: 640,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            fontFamily: "Fira Code, monospace",
            fontSize: 12,
            fontWeight: 700,
            color: passed ? "#059669" : "#ef4444",
            letterSpacing: 1,
          }}
        >
          {passed ? "PASSED" : "NOT PASSED"} · REVIEW
        </div>
        <h2
          style={{
            margin: "8px 0 4px",
            fontFamily: "Outfit, sans-serif",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--text-main, #0f172a)",
          }}
        >
          {item.title}
        </h2>
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontSize: 42,
            fontWeight: 800,
            color: passed ? "#00c9a7" : "#ef4444",
            lineHeight: 1.1,
          }}
        >
          {score}%
        </div>
        <p
          style={{
            margin: "6px 0 0",
            fontFamily: "Inter, sans-serif",
            fontSize: 13,
            color: "var(--text-muted, #64748b)",
          }}
        >
          {item.type.toUpperCase()} · +{item.xp} XP when first passed
          {passed ? " · Solution unlocked" : ""}
        </p>

        {passed && review ? (
          <AnswerReview review={review} />
        ) : !passed ? (
          <p
            style={{
              marginTop: 16,
              fontFamily: "Outfit",
              color: "var(--text-muted)",
              fontSize: 14,
            }}
          >
            Score recorded. Pass this challenge to unlock the solution and answer key.
          </p>
        ) : (
          <p
            style={{
              marginTop: 16,
              fontFamily: "Outfit",
              color: "var(--text-muted)",
            }}
          >
            No attempt details saved yet. Retry the challenge to generate a review.
          </p>
        )}

        {passed && item.solution && (
          <div
            style={{
              marginTop: 18,
              padding: 14,
              borderRadius: 12,
              background: "rgba(108,99,255,0.08)",
              border: "1px solid rgba(108,99,255,0.25)",
              textAlign: "left",
            }}
          >
            <div style={{ fontFamily: "Outfit", fontWeight: 800, marginBottom: 6 }}>
              Solution
            </div>
            <p style={{ margin: "0 0 8px", fontSize: 13, fontFamily: "Outfit", lineHeight: 1.5 }}>
              {item.solution.editorial}
            </p>
            {item.solution.complexity &&
              item.solution.complexity.toLowerCase() !== "n/a" && (
                <div style={{ fontSize: 12, fontFamily: "Fira Code", color: "#6c63ff" }}>
                  {item.solution.complexity}
                </div>
              )}
            {item.solution.notes && (
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                {item.solution.notes}
              </p>
            )}
          </div>
        )}

        {passed && item.type === "mcq" && item.questions && item.questions.length > 0 && (
          <div style={{ marginTop: 14, textAlign: "left" }}>
            <div style={{ fontFamily: "Outfit", fontWeight: 800, marginBottom: 8 }}>
              Answer key
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {item.questions.map((q, i) => {
                const letter = String.fromCharCode(65 + q.correct);
                const answer = q.opts[q.correct] ?? "—";
                return (
                  <div
                    key={String(q.id)}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "var(--bg-alt)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: 13 }}>
                      {i + 1}. {q.q}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        fontFamily: "Outfit",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#059669",
                      }}
                    >
                      Correct: {letter}. {answer}
                    </div>
                    {q.explanation && (
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: 12.5,
                          fontFamily: "Outfit",
                          color: "var(--text-muted)",
                          lineHeight: 1.5,
                        }}
                      >
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {passed && item.lastAttempt?.code && (
          <pre
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 10,
              background: "#0f172a",
              color: "#e2e8f0",
              fontSize: 12,
              fontFamily: "Fira Code, monospace",
              overflow: "auto",
              maxHeight: 220,
              textAlign: "left",
            }}
          >
            {item.lastAttempt.code}
          </pre>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onRetry}
            style={{
              flex: 1,
              minWidth: 140,
              padding: "12px 16px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
              color: "#fff",
              fontFamily: "Outfit",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Retry challenge
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              minWidth: 120,
              padding: "12px 16px",
              borderRadius: 10,
              border: "1.5px solid var(--border-light)",
              background: "var(--bg-alt)",
              color: "var(--text-main)",
              fontFamily: "Outfit",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
