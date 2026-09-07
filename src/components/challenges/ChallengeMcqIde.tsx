"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import AssessmentShell from "@/components/roadmap/assessment/AssessmentShell";
import McqAssessment from "@/components/roadmap/assessment/McqAssessment";
import ChallengeResultScreen from "@/components/challenges/ChallengeResultScreen";
import { AddNoteButton } from "@/components/memory-lane/AddNoteButton";
import type { ChallengeSummary } from "@/lib/challenges/types";
import type { NodeAssessment } from "@/types/roadmap";

/**
 * Challenges MCQ — same guidelines + score result overlay as roadmap assessments.
 * Completes (XP/coins) only when score >= pass mark.
 */
export default function ChallengeMcqIde({
  item,
  onClose,
  onFinished,
}: {
  item: ChallengeSummary;
  onClose: () => void;
  onFinished: (payload: {
    score: number;
    passed: boolean;
    answers: Record<string, number>;
  }) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [resultPassed, setResultPassed] = useState(false);
  const finishedRef = useRef(false);
  const persistedRef = useRef(false);

  const assessment: NodeAssessment = useMemo(() => {
    const questions = (item.questions || []).map((q) => ({
      id: String(q.id),
      prompt: q.q,
      options: q.opts,
      correctIndex: q.correct,
    }));
    return {
      type: "mcq",
      passScore: 70,
      timeLimitMinutes: Math.max(7, item.estMinutes || 10),
      mcq: { questions },
    };
  }, [item]);

  const passMark = assessment.passScore ?? 70;

  const scoreFromAnswers = (answers: Record<string, number>) => {
    const qs = assessment.mcq?.questions || [];
    let correct = 0;
    for (const q of qs) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    return Math.round((correct / Math.max(1, qs.length)) * 100);
  };

  const persistOnce = useCallback(
    (score: number, passed: boolean, answers: Record<string, number>) => {
      if (persistedRef.current) return;
      persistedRef.current = true;
      onFinished({ score, passed, answers });
    },
    [onFinished],
  );

  const handleSubmit = (answers: Record<string, number>) => {
    if (finishedRef.current || submitting) return;
    finishedRef.current = true;
    setSubmitting(true);
    const score = scoreFromAnswers(answers);
    const passed = score >= passMark;
    setResultScore(score);
    setResultPassed(passed);
    persistOnce(score, passed, answers);
    setShowResult(true);
    setSubmitting(false);
  };

  if (showResult) {
    return (
      <ChallengeResultScreen
        score={resultScore}
        passed={resultPassed}
        passMark={passMark}
        xp={item.xp}
        coins={item.coins}
        alreadySolved={item.status === "solved"}
        onDone={onClose}
      />
    );
  }

  return (
    <>
      <div
        className="fixed top-4 right-[72px]"
        style={{ zIndex: "var(--z-popover)" }}
      >
        <AddNoteButton
          sourceType="challenge"
          sourceId={item.id}
          defaultTitle={`${item.title} notes`}
          contextLabel={`Challenge · ${item.title}`}
          compact
        />
      </div>
      <AssessmentShell
      title={item.title}
      timeLimitMinutes={assessment.timeLimitMinutes}
      assessmentType="mcq"
      passScore={passMark}
      previousAttempts={[]}
      answerReview={null}
      onClose={onClose}
      onFailProctor={() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        setResultScore(0);
        setResultPassed(false);
        persistOnce(0, false, {});
        setShowResult(true);
      }}
    >
      {({ secondsLeft }) => (
        <McqAssessment
          assessment={assessment}
          submitting={submitting}
          secondsLeft={secondsLeft}
          onSubmit={handleSubmit}
        />
      )}
    </AssessmentShell>
    </>
  );
}
