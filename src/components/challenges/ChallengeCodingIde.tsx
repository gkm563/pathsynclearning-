"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import AssessmentShell from "@/components/roadmap/assessment/AssessmentShell";
import CodingAssessment from "@/components/roadmap/assessment/CodingAssessment";
import ChallengeResultScreen from "@/components/challenges/ChallengeResultScreen";
import { apiSend } from "@/lib/api";
import type { ChallengeSummary } from "@/lib/challenges/types";
import type { CodingGradeResult } from "@/lib/roadmap/coding-client";
import type { CodingLanguageId } from "@/lib/roadmap/coding-languages";
import type { NodeAssessment } from "@/types/roadmap";

/**
 * Challenges coding — same IDE + PASSED/score overlay as roadmap.
 * Completes (XP/coins) only when the judge passes.
 */
export default function ChallengeCodingIde({
  item,
  onClose,
  onFinished,
}: {
  item: ChallengeSummary;
  onClose: () => void;
  onFinished: (payload: {
    score: number;
    passed: boolean;
    code: string;
    language: string;
  }) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [resultPassed, setResultPassed] = useState(false);
  const persistedRef = useRef(false);
  const harness = item.coding;

  const assessment: NodeAssessment | null = useMemo(() => {
    if (!harness) return null;
    return {
      type: "coding",
      passScore: 100,
      timeLimitMinutes: Math.max(15, item.estMinutes || 45),
      coding: {
        prompt: item.prompt || item.description,
        starterCode: harness.starterCode,
        functionName: harness.functionName,
        examples: harness.examples,
        publicTests: harness.publicTests,
      },
    };
  }, [harness, item]);

  const passMark = assessment?.passScore ?? 100;

  const persistOnce = useCallback(
    (score: number, passed: boolean, code: string, language: string) => {
      if (persistedRef.current) return;
      persistedRef.current = true;
      onFinished({ score, passed, code, language });
    },
    [onFinished],
  );

  if (!harness || !assessment) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1200,
          background: "#1a1a1a",
          color: "#eff1f6",
          display: "grid",
          placeItems: "center",
          fontFamily: "Outfit",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p>No coding harness for this challenge.</p>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

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
    <AssessmentShell
      title={item.title}
      timeLimitMinutes={assessment.timeLimitMinutes}
      assessmentType="coding"
      passScore={passMark}
      previousAttempts={[]}
      answerReview={null}
      onClose={onClose}
      onFailProctor={() => {
        setResultScore(0);
        setResultPassed(false);
        persistOnce(0, false, "", "javascript");
        setShowResult(true);
      }}
    >
      {() => (
        <CodingAssessment
          assessment={assessment}
          nodeId={item.id}
          runSource="challenge"
          noteTitle={item.title}
          submitting={submitting}
          onSubmit={async ({ code, language }) => {
            setSubmitting(true);
            try {
              const result = await apiSend<CodingGradeResult>(
                "/api/me/challenges/run",
                "POST",
                {
                  questionId: item.id,
                  code,
                  language: language as CodingLanguageId,
                  mode: "submit",
                },
              );
              const passed = Boolean(result.passed);
              const score = Math.round(Number(result.score) || 0);
              setResultScore(score);
              setResultPassed(passed);
              persistOnce(score, passed, code, language);
              setShowResult(true);
              return result;
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </AssessmentShell>
  );
}
