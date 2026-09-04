"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "@/lib/api";
import ChallengeResultScreen from "@/components/challenges/ChallengeResultScreen";
import ProjectWorkspace, {
  ProjectRubricList,
} from "@/components/projects/ProjectWorkspace";
import { AddNoteButton } from "@/components/memory-lane/AddNoteButton";
import type { ChallengeSummary } from "@/lib/challenges/types";
import type {
  ProjectAssessmentSpec,
  ProjectEvidenceInput,
  ProjectRubricBreakdownItem,
} from "@/lib/projects/types";

type ProjectLoad = {
  questionId: string;
  title: string;
  xp: number;
  coins: number;
  spec: ProjectAssessmentSpec;
  run: {
    id: string;
    status: string;
    score: number;
    checklistPct: number;
    repoUrl?: string | null;
    reflection?: string | null;
    stepsDone: string[];
    evidence: ProjectEvidenceInput[];
    rubricBreakdown: ProjectRubricBreakdownItem[];
  };
};

export default function ChallengeProjectIde({
  item,
  onClose,
  onFinished,
}: {
  item: ChallengeSummary;
  onClose: () => void;
  onFinished: (payload: {
    score: number;
    passed: boolean;
    challengesPayload?: unknown;
  }) => void;
}) {
  const [data, setData] = useState<ProjectLoad | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultScore, setResultScore] = useState(0);
  const [resultPassed, setResultPassed] = useState(false);
  const [breakdown, setBreakdown] = useState<ProjectRubricBreakdownItem[]>([]);

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await apiGet<ProjectLoad>(
        `/api/me/challenges/project?questionId=${encodeURIComponent(item.id)}`,
      );
      setData(res);
      if (res.run.status === "passed") {
        setResultScore(res.run.score);
        setResultPassed(true);
        setBreakdown(
          (res.run.rubricBreakdown || []) as ProjectRubricBreakdownItem[],
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load project");
    }
  }, [item.id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <div style={overlay}>
        <div style={{ textAlign: "center", fontFamily: "Outfit" }}>
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
      <div style={overlay}>
        <div style={{ fontFamily: "Outfit" }}>Loading project workspace…</div>
      </div>
    );
  }

  if (showResult || data.run.status === "passed") {
    return (
      <div style={{ position: "relative", zIndex: 1300 }}>
        <ChallengeResultScreen
          score={resultScore || data.run.score}
          passed={resultPassed || data.run.status === "passed"}
          passMark={data.spec.passScore}
          xp={data.xp}
          coins={data.coins}
          alreadySolved={item.status === "solved"}
          onDone={onClose}
        />
        {(breakdown.length > 0 || data.run.rubricBreakdown?.length) &&
          (resultPassed || data.run.status === "passed") && (
            <div
              style={{
                position: "fixed",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1301,
                width: "min(520px, 92vw)",
                maxHeight: 220,
                overflow: "auto",
                padding: 16,
                borderRadius: 14,
                background: "var(--bg-card)",
                border: "1px solid var(--border-light)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              }}
            >
              <ProjectRubricList
                breakdown={
                  breakdown.length
                    ? breakdown
                    : (data.run.rubricBreakdown as ProjectRubricBreakdownItem[])
                }
              />
            </div>
          )}
      </div>
    );
  }

  return (
    <>
      <div style={{ position: "fixed", top: 16, right: 72, zIndex: 1300 }}>
        <AddNoteButton
          sourceType="project"
          sourceId={item.id}
          defaultTitle={`${data.title} notes`}
          contextLabel={`Project · ${data.title}`}
          links={[{ entityType: "project_run", entityId: data.run.id }]}
        />
      </div>
      <ProjectWorkspace
      title={data.title}
      xp={data.xp}
      coins={data.coins}
      spec={data.spec}
      initialStepsDone={data.run.stepsDone}
      initialEvidence={data.run.evidence}
      initialRepoUrl={data.run.repoUrl || ""}
      initialReflection={data.run.reflection || ""}
      submitting={submitting}
      onClose={onClose}
      onSaveProgress={async (payload) => {
        await apiSend("/api/me/challenges/project/progress", "PUT", {
          questionId: item.id,
          ...payload,
        });
      }}
      onSubmit={async (payload) => {
        setSubmitting(true);
        try {
          const res = await apiSend<{
            passed: boolean;
            score: number;
            breakdown: ProjectRubricBreakdownItem[];
            awarded?: boolean;
          } & Record<string, unknown>>(
            "/api/me/challenges/project/submit",
            "POST",
            { questionId: item.id, ...payload },
          );
          setResultScore(res.score);
          setResultPassed(res.passed);
          setBreakdown(res.breakdown || []);
          setShowResult(true);
          onFinished({
            score: res.score,
            passed: res.passed,
            challengesPayload: res,
          });
        } finally {
          setSubmitting(false);
        }
      }}
    />
    </>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1200,
  display: "grid",
  placeItems: "center",
  background: "var(--bg-main)",
};
