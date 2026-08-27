"use client";

import React, { useCallback, useEffect, useState } from "react";
import AssessmentShell, {
  type ProctorViolation,
  type PreviousAttempt,
} from "./AssessmentShell";
import McqAssessment from "./McqAssessment";
import CodingAssessment from "./CodingAssessment";
import AnswerReview, { type AnswerReviewPayload } from "./AnswerReview";
import type { NodeAssessment } from "@/types/roadmap";
import { apiGet, apiSend } from "@/lib/api";

type LoadState = {
  title: string;
  assessment: NodeAssessment;
  hasPassed: boolean;
  attempts: PreviousAttempt[];
  answerReview?: AnswerReviewPayload | null;
};

function isAnswerReview(value: unknown): value is AnswerReviewPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as { type?: string };
  return v.type === "mcq" || v.type === "coding";
}

export default function NodeAssessmentModal({
  nodeId,
  onClose,
  onCompleted,
}: {
  nodeId: string;
  onClose: () => void;
  onCompleted: (payload: {
    allProgress?: unknown[];
    unlockedNodeIds?: string[];
  }) => void;
}) {
  const [data, setData] = useState<LoadState | null>(null);
  const [error, setError] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [resultScore, setResultScore] = useState<number | null>(null);
  const [resultPassed, setResultPassed] = useState(false);
  const [pendingProgress, setPendingProgress] = useState<unknown[] | undefined>();
  const [unlockedNodeIds, setUnlockedNodeIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [answerReview, setAnswerReview] = useState<AnswerReviewPayload | null>(null);
  const [autoAdvanceIn, setAutoAdvanceIn] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet<LoadState>(
          `/api/roadmap/assessment?nodeId=${encodeURIComponent(nodeId)}`,
        );
        if (!cancelled) {
          setData({
            ...res,
            attempts: Array.isArray(res.attempts) ? res.attempts : [],
          });
          if (res.hasPassed && isAnswerReview(res.answerReview)) {
            setAnswerReview(res.answerReview);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load assessment");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [nodeId]);

  const submit = useCallback(
    async (payload: {
      answers?: Record<string, number>;
      code?: string;
      language?: string;
      violations?: ProctorViolation[];
    }) => {
      if (!data) return;
      setSubmitting(true);
      setResultMsg("");
      try {
        const res = await apiSend<{
          passed: boolean;
          score: number;
          message?: string;
          allProgress?: unknown[];
          unlockedNodeIds?: string[];
          answerReview?: unknown;
        }>("/api/roadmap/assessment/submit", "POST", {
          nodeId,
          type: data.assessment.type,
          answers: payload.answers,
          code: payload.code,
          language: payload.language,
          violations: payload.violations || [],
        });
        setResultScore(res.score ?? 0);
        setResultPassed(Boolean(res.passed));
        setResultMsg(res.message || (res.passed ? "Passed!" : "Not passed"));
        setPendingProgress(res.allProgress);
        setUnlockedNodeIds(
          Array.isArray(res.unlockedNodeIds) ? res.unlockedNodeIds : [],
        );
        if (res.passed && isAnswerReview(res.answerReview)) {
          setAnswerReview(res.answerReview);
        }
        setShowResult(true);
        // Always return to roadmap after a short countdown
        setAutoAdvanceIn(res.passed && res.answerReview ? 4 : 2);
        setData((prev) =>
          prev
            ? {
                ...prev,
                attempts: [
                  {
                    id: `latest-${Date.now()}`,
                    passed: Boolean(res.passed),
                    score: res.score ?? 0,
                    type: prev.assessment.type,
                    createdAt: new Date().toISOString(),
                  },
                  ...prev.attempts,
                ],
                hasPassed: prev.hasPassed || Boolean(res.passed),
              }
            : prev,
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Submit failed");
        setResultScore(0);
        setResultPassed(false);
        setResultMsg(e instanceof Error ? e.message : "Submit failed");
        setShowResult(true);
        setAutoAdvanceIn(3);
      } finally {
        setSubmitting(false);
      }
    },
    [data, nodeId],
  );

  const onFailProctor = useCallback(
    (violations: ProctorViolation[]) => {
      void submit({
        answers: data?.assessment.type === "mcq" ? {} : undefined,
        code: data?.assessment.type === "coding" ? "" : undefined,
        violations,
      });
    },
    [data, submit],
  );

  const finishResult = useCallback(() => {
    if (resultPassed) {
      onCompleted({
        allProgress: pendingProgress,
        unlockedNodeIds,
      });
    } else {
      onClose();
    }
  }, [resultPassed, onCompleted, pendingProgress, unlockedNodeIds, onClose]);

  // After any result (pass or fail), return to the roadmap view
  useEffect(() => {
    if (!showResult || autoAdvanceIn === null) return;
    if (autoAdvanceIn <= 0) {
      finishResult();
      return;
    }
    const t = setTimeout(
      () => setAutoAdvanceIn((n) => (n === null ? null : n - 1)),
      1000,
    );
    return () => clearTimeout(t);
  }, [showResult, autoAdvanceIn, finishResult]);

  if (error && !data) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "var(--bg-card)",
            padding: 24,
            borderRadius: 12,
            maxWidth: 400,
          }}
        >
          <p>{error}</p>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "var(--bg-main)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Outfit",
        }}
      >
        Loading assessment…
      </div>
    );
  }

  if (showResult) {
    const passMark = data.assessment.passScore ?? 70;
    const score = resultScore ?? 0;
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "var(--bg-main)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          overflow: "auto",
        }}
      >
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: 16,
            padding: 32,
            maxWidth: resultPassed && answerReview ? 640 : 480,
            width: "100%",
            textAlign: "center",
            margin: "auto",
          }}
        >
          <div
            style={{
              fontFamily: "Fira Code",
              fontSize: 12,
              fontWeight: 700,
              color: resultPassed ? "#059669" : "#ef4444",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            {resultPassed ? "PASSED" : "NOT PASSED"}
          </div>
          <div
            style={{
              fontFamily: "Outfit",
              fontSize: 56,
              fontWeight: 800,
              color: resultPassed ? "#00c9a7" : "#ef4444",
              lineHeight: 1,
            }}
          >
            {score}%
          </div>
          <p
            style={{
              color: "var(--text-muted)",
              fontFamily: "Inter",
              fontSize: 13,
              marginTop: 8,
            }}
          >
            Pass mark: {passMark}%
          </p>
          <h2 style={{ fontFamily: "Outfit", fontSize: 20, marginBottom: 8 }}>
            {resultMsg || "Assessment ended"}
          </h2>
          <p style={{ color: "var(--text-muted)", fontFamily: "Inter", fontSize: 14 }}>
            {resultPassed
              ? unlockedNodeIds.length
                ? "Great work — new nodes unlocked on your roadmap."
                : "Great work — returning to your roadmap."
              : "Review the module resources (including YouTube videos) and try again from the roadmap."}
          </p>

          {resultPassed && answerReview && <AnswerReview review={answerReview} />}

          {data.attempts.length > 1 && (
            <div
              style={{
                marginTop: 20,
                textAlign: "left",
                background: "var(--bg-alt)",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "Outfit",
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                Attempt history
              </div>
              {data.attempts.slice(0, 5).map((a, i) => (
                <div
                  key={a.id || i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 13,
                    fontFamily: "Inter",
                    color: "var(--text-muted)",
                    padding: "4px 0",
                    borderTop: i ? "1px solid var(--border-light)" : "none",
                  }}
                >
                  <span>
                    {i === 0 ? "This attempt" : `Attempt ${data.attempts.length - i}`}
                    {a.passed ? " · passed" : ""}
                  </span>
                  <strong style={{ color: a.passed ? "#059669" : "var(--text-main)" }}>
                    {a.score}%
                  </strong>
                </div>
              ))}
            </div>
          )}

          <p
            style={{
              marginTop: 20,
              fontFamily: "Outfit",
              fontWeight: 600,
              fontSize: 14,
              color: "var(--text-muted)",
            }}
          >
            Returning to roadmap in {autoAdvanceIn ?? 0}s…
          </p>
          <button
            type="button"
            onClick={finishResult}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "12px 24px",
              borderRadius: 10,
              border: "none",
              background: resultPassed ? "#00c9a7" : "#6c63ff",
              color: "#fff",
              fontFamily: "Outfit",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Back to roadmap
          </button>
        </div>
      </div>
    );
  }

  return (
    <AssessmentShell
      title={data.title}
      timeLimitMinutes={data.assessment.timeLimitMinutes}
      assessmentType={data.assessment.type}
      passScore={data.assessment.passScore}
      previousAttempts={data.attempts}
      answerReview={data.hasPassed ? answerReview : null}
      onClose={onClose}
      onFailProctor={onFailProctor}
    >
      {({ violations }) =>
        data.assessment.type === "mcq" ? (
          <McqAssessment
            assessment={data.assessment}
            submitting={submitting}
            onSubmit={(answers) => submit({ answers, violations })}
          />
        ) : (
          <CodingAssessment
            assessment={data.assessment}
            nodeId={nodeId}
            submitting={submitting}
            onSubmit={({ code, language }) =>
              submit({ code, language, violations })
            }
          />
        )
      }
    </AssessmentShell>
  );
}
