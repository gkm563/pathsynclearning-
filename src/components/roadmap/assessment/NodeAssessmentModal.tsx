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
import { Badge, Button, Card, Dialog } from "@/components/ui";
import { cn } from "@/lib/cn";

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
      <Dialog
        open
        onClose={onClose}
        title="Could not load assessment"
        description={error}
        footer={<Button onClick={onClose}>Close</Button>}
      />
    );
  }

  if (!data) {
    return (
      <Dialog open onClose={onClose} title="Loading assessment" hideHeader>
        <p className="type-body m-0 py-8 text-center text-muted">Loading assessment…</p>
      </Dialog>
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
      <Dialog
        open
        onClose={finishResult}
        size={resultPassed && answerReview ? "lg" : "md"}
        title={resultMsg || "Assessment ended"}
        footer={
          <Button className="w-full sm:w-auto" onClick={finishResult}>
            {resultPassed && !nodeComplete ? "Next assessment" : "Back to roadmap"}
          </Button>
        }
      >
        <div className="text-center">
          <div className={cn("type-overline mb-2", resultPassed ? "text-success" : "text-danger")}>
            {resultPassed ? "Passed" : "Not passed"}
          </div>
          <div
            className={cn(
              "type-numeric text-[56px] leading-none font-extrabold",
              resultPassed ? "text-success" : "text-danger",
            )}
          >
            {score}%
          </div>
          <p className="type-small mt-2 text-muted">Pass mark: {passMark}%</p>
          <p className="type-body text-muted">
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
            <Card padded={false} className="mt-5 p-3.5 text-left">
              <div className="type-label mb-2">
                {active ? `${assessmentLabel(active)} · attempt history` : "Attempt history"}
              </div>
              {historyForActive.slice(0, 5).map((a, i) => (
                <div
                  key={a.id || i}
                  className={cn(
                    "flex justify-between py-1 type-small text-muted",
                    i ? "border-t border-line" : "",
                  )}
                >
                  <span>
                    {i === 0 ? "This attempt" : `Attempt ${historyForActive.length - i}`}
                    {a.passed ? " · passed" : ""}
                  </span>
                  <strong className={a.passed ? "text-success" : "text-ink"}>{a.score}%</strong>
                </div>
              ))}
            </Card>
          )}

          {autoAdvanceIn !== null && (nodeComplete || !resultPassed) ? (
            <p className="type-label mt-5 text-muted">
              Returning to roadmap in {autoAdvanceIn}s…
            </p>
          ) : null}
        </div>
      </Dialog>
    );
  }

  const passedSet = new Set(data.passedAssessmentIds);
  const showPicker = list.length > 1 && !active;

  if (showPicker) {
    const done = list.filter((a) => a.id && passedSet.has(a.id)).length;
    return (
      <Dialog
        open
        onClose={onClose}
        size="md"
        title={data.title}
        description={`This node has ${list.length} assessments. Pass all of them to unlock the next nodes (${done}/${list.length} done).`}
        footer={
          <Button variant="secondary" className="w-full" onClick={onClose}>
            Back to roadmap
          </Button>
        }
      >
        <div className="grid gap-2.5">
          {list.map((item, i) => {
            const passed = Boolean(item.id && passedSet.has(item.id));
            const ownAttempts = attemptsForAssessment(data.attempts, item, list);
            const best = ownAttempts.reduce((m, a) => Math.max(m, a.score), 0);
            const last = ownAttempts[0];
            return (
              <button
                key={item.id || i}
                type="button"
                disabled={passed}
                onClick={() => item.id && setActiveId(item.id)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line px-4 py-3.5 text-left",
                  passed ? "bg-success-soft" : "bg-sunken",
                  passed && "cursor-default",
                )}
              >
                <span>
                  <strong className="type-label">
                    {i + 1}. {assessmentLabel(item)}
                  </strong>
                  <span className="type-overline mt-1 block text-muted">
                    {item.type} · {item.timeLimitMinutes} min · pass {item.passScore}%
                    {last
                      ? ` · last ${last.score}%${best !== last.score ? ` · best ${best}%` : ""}`
                      : ""}
                  </span>
                </span>
                <Badge tone={passed ? "success" : "accent"}>{passed ? "Passed" : "Start"}</Badge>
              </button>
            );
          })}
        </div>
      </Dialog>
    );
  }

  if (!active) {
    return null;
  }

  return (
    <>
      {active.type !== "coding" ? (
        <div className="fixed top-4 right-[72px] z-[1300]">
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
