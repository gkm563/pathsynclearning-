"use client";

import React, { useCallback, useEffect, useState } from "react";
import AssessmentShell, {
  type ProctorViolation,
  type PreviousAttempt,
} from "./AssessmentShell";
import McqAssessment from "./McqAssessment";
import CodingAssessment from "./CodingAssessment";
import ProjectAssessment from "./ProjectAssessment";
import AnswerReview, { type AnswerReviewPayload } from "./AnswerReview";
import type { NodeAssessment } from "@/types/roadmap";
import { assessmentLabel, attemptsForAssessment } from "@/lib/roadmap/assessment";
import { apiGet, apiSend } from "@/lib/api";
import type { ProjectEvidenceInput } from "@/lib/projects/types";
import { AddNoteButton } from "@/components/memory-lane/AddNoteButton";

type LoadState = {
  title: string;
  assessment: NodeAssessment;
  assessments: NodeAssessment[];
  passedAssessmentIds: string[];
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nodeComplete, setNodeComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiGet<LoadState>(
          `/api/roadmap/assessment?nodeId=${encodeURIComponent(nodeId)}`,
        );
        if (!cancelled) {
          const assessments =
            Array.isArray(res.assessments) && res.assessments.length
              ? res.assessments
              : res.assessment
                ? [res.assessment]
                : [];
          const passedIds = Array.isArray(res.passedAssessmentIds)
            ? res.passedAssessmentIds
            : [];
          setData({
            ...res,
            assessments,
            passedAssessmentIds: passedIds,
            attempts: Array.isArray(res.attempts) ? res.attempts : [],
          });
          if (assessments.length === 1 && assessments[0].id) {
            setActiveId(assessments[0].id);
          }
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
      stepsDone?: string[];
      evidence?: ProjectEvidenceInput[];
      repoUrl?: string;
      reflection?: string;
      violations?: ProctorViolation[];
    }) => {
      if (!data) return;
      const active =
        data.assessments.find((a) => a.id === activeId) || data.assessment;
      setSubmitting(true);
      setResultMsg("");
      try {
        const res = await apiSend<{
          passed: boolean;
          score: number;
          message?: string;
          nodeComplete?: boolean;
          remaining?: number;
          allProgress?: unknown[];
          unlockedNodeIds?: string[];
          answerReview?: unknown;
        }>("/api/roadmap/assessment/submit", "POST", {
          nodeId,
          assessmentId: active.id,
          type: active.type,
          answers: payload.answers,
          code: payload.code,
          language: payload.language,
          stepsDone: payload.stepsDone,
          evidence: payload.evidence,
          repoUrl: payload.repoUrl,
          reflection: payload.reflection,
          violations: payload.violations || [],
        });
        setResultScore(res.score ?? 0);
        setResultPassed(Boolean(res.passed));
        setNodeComplete(Boolean(res.nodeComplete));
        setResultMsg(res.message || (res.passed ? "Passed!" : "Not passed"));
        setPendingProgress(res.allProgress);
        setUnlockedNodeIds(
          Array.isArray(res.unlockedNodeIds) ? res.unlockedNodeIds : [],
        );
        if (res.passed && isAnswerReview(res.answerReview)) {
          setAnswerReview(res.answerReview);
        }
        setShowResult(true);
        const finishedNode = Boolean(res.nodeComplete);
        setAutoAdvanceIn(res.passed && res.answerReview && finishedNode ? 4 : res.passed && !finishedNode ? null : 2);
        setData((prev) =>
          prev
            ? {
                ...prev,
                passedAssessmentIds:
                  res.passed && active.id
                    ? Array.from(new Set([...prev.passedAssessmentIds, active.id]))
                    : prev.passedAssessmentIds,
                attempts: [
                  {
                    id: `latest-${Date.now()}`,
                    passed: Boolean(res.passed),
                    score: res.score ?? 0,
                    type: active.type,
                    assessmentId: active.id || null,
                    createdAt: new Date().toISOString(),
                  },
                  ...prev.attempts,
                ],
                hasPassed: prev.hasPassed || Boolean(res.nodeComplete),
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
    [data, nodeId, activeId],
  );

  const onFailProctor = useCallback(
    (violations: ProctorViolation[]) => {
      void submit({
        answers: data?.assessment.type === "mcq" ? {} : undefined,
        code: (data?.assessments.find((a) => a.id === activeId) || data?.assessment)?.type === "coding" ? "" : undefined,
        violations,
      });
    },
    [data, submit],
  );

  const finishResult = useCallback(() => {
    if (resultPassed && nodeComplete) {
      onCompleted({
        allProgress: pendingProgress,
        unlockedNodeIds,
      });
      return;
    }
    if (resultPassed && !nodeComplete) {
      setShowResult(false);
      setAutoAdvanceIn(null);
      setActiveId(null);
      return;
    }
    onClose();
  }, [resultPassed, nodeComplete, onCompleted, pendingProgress, unlockedNodeIds, onClose]);

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

  const list = data.assessments.length ? data.assessments : [data.assessment];
  const active =
    list.find((a) => a.id === activeId) || (list.length === 1 ? list[0] : null);
  const historyForActive = active
    ? attemptsForAssessment(data.attempts, active, list)
    : [];

  if (showResult) {
    const passMark = active?.passScore ?? data.assessment.passScore ?? 70;
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
              ? nodeComplete
                ? unlockedNodeIds.length
                  ? "Great work — new nodes unlocked on your roadmap."
                  : "Great work — returning to your roadmap."
                : "This part is done. Continue with the remaining assessments on this node."
              : "Review the module resources (including YouTube videos) and try again from the roadmap."}
          </p>

          {resultPassed && answerReview && <AnswerReview review={answerReview} />}

          {historyForActive.length > 0 && (
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
                {active ? `${assessmentLabel(active)} · attempt history` : "Attempt history"}
              </div>
              {historyForActive.slice(0, 5).map((a, i) => (
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
                    {i === 0 ? "This attempt" : `Attempt ${historyForActive.length - i}`}
                    {a.passed ? " · passed" : ""}
                  </span>
                  <strong style={{ color: a.passed ? "#059669" : "var(--text-main)" }}>
                    {a.score}%
                  </strong>
                </div>
              ))}
            </div>
          )}

          {autoAdvanceIn !== null ? (
            <p
              style={{
                marginTop: 20,
                fontFamily: "Outfit",
                fontWeight: 600,
                fontSize: 14,
                color: "var(--text-muted)",
              }}
            >
              {nodeComplete || !resultPassed
                ? `Returning to roadmap in ${autoAdvanceIn}s…`
                : null}
            </p>
          ) : null}
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
            {resultPassed && !nodeComplete ? "Next assessment" : "Back to roadmap"}
          </button>
        </div>
      </div>
    );
  }

  const passedSet = new Set(data.passedAssessmentIds);
  const showPicker = list.length > 1 && !active;

  if (showPicker) {
    const done = list.filter((a) => a.id && passedSet.has(a.id)).length;
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
        }}
      >
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: 16,
            padding: 28,
            maxWidth: 520,
            width: "100%",
          }}
        >
          <h2 style={{ fontFamily: "Outfit", fontSize: 22, margin: "0 0 8px" }}>
            {data.title}
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontFamily: "Inter",
              fontSize: 14,
              margin: "0 0 20px",
            }}
          >
            This node has {list.length} assessments. Pass all of them to unlock the next nodes ({done}/{list.length} done).
          </p>
          <div style={{ display: "grid", gap: 10 }}>
            {list.map((item, i) => {
              const passed = Boolean(item.id && passedSet.has(item.id));
              const ownAttempts = attemptsForAssessment(data.attempts, item, list);
              const best = ownAttempts.reduce(
                (m, a) => Math.max(m, a.score),
                0,
              );
              const last = ownAttempts[0];
              return (
                <button
                  key={item.id || i}
                  type="button"
                  disabled={passed}
                  onClick={() => item.id && setActiveId(item.id)}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: "1px solid var(--border-light)",
                    background: passed ? "rgba(0,201,167,0.08)" : "var(--bg-alt)",
                    cursor: passed ? "default" : "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span>
                    <strong style={{ fontFamily: "Outfit", fontSize: 15 }}>
                      {i + 1}. {assessmentLabel(item)}
                    </strong>
                    <span
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontSize: 12,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      {item.type} · {item.timeLimitMinutes} min · pass {item.passScore}%
                      {last
                        ? ` · last ${last.score}%${best !== last.score ? ` · best ${best}%` : ""}`
                        : ""}
                    </span>
                  </span>
                  <span
                    style={{
                      fontFamily: "Outfit",
                      fontWeight: 700,
                      fontSize: 12,
                      color: passed ? "#059669" : "#6c63ff",
                    }}
                  >
                    {passed ? "Passed" : "Start"}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginTop: 16,
              width: "100%",
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid var(--border-light)",
              background: "transparent",
              cursor: "pointer",
              fontFamily: "Outfit",
              fontWeight: 600,
            }}
          >
            Back to roadmap
          </button>
        </div>
      </div>
    );
  }

  if (!active) {
    return null;
  }

  return (
    <>
      {active.type !== "coding" ? (
        <div style={{ position: "fixed", top: 16, right: 72, zIndex: 1300 }}>
          <AddNoteButton
            sourceType="roadmap_node"
            sourceId={nodeId}
            defaultTitle={data.title}
            contextLabel={`Learning · ${data.title}`}
            compact
          />
        </div>
      ) : null}
      {active.type === "project" ? (
        <ProjectAssessment
          assessment={active}
          title={data.title}
          submitting={submitting}
          onClose={onClose}
          onSubmit={(payload) => void submit(payload)}
        />
      ) : (
        <AssessmentShell
          title={
            list.length > 1
              ? `${data.title} · ${assessmentLabel(active)}`
              : data.title
          }
          timeLimitMinutes={active.timeLimitMinutes}
          assessmentType={active.type}
          passScore={active.passScore}
          previousAttempts={historyForActive}
          answerReview={
            active?.id && data.passedAssessmentIds.includes(active.id)
              ? answerReview
              : null
          }
          onClose={onClose}
          onFailProctor={onFailProctor}
        >
          {({ violations, secondsLeft }) =>
            active.type === "mcq" ? (
              <McqAssessment
                assessment={active}
                submitting={submitting}
                secondsLeft={secondsLeft}
                onSubmit={(answers) => submit({ answers, violations })}
              />
            ) : (
              <CodingAssessment
                key={active.id}
                assessment={active}
                nodeId={nodeId}
                noteTitle={data.title}
                submitting={submitting}
                onSubmit={({ code, language }) =>
                  submit({ code, language, violations })
                }
              />
            )
          }
        </AssessmentShell>
      )}
    </>
  );
}
