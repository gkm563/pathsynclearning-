"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "@/lib/api";
import ChallengeResultScreen from "@/components/challenges/ChallengeResultScreen";
import ProjectWorkspace from "@/components/projects/ProjectWorkspace";
import { AddNoteButton } from "@/components/memory-lane/AddNoteButton";
import type { ChallengeSummary } from "@/lib/challenges/types";
import type {
  ProjectAssessmentSpec,
  ProjectEvidenceInput,
  ProjectRubricBreakdownItem,
} from "@/lib/projects/types";
import { Button, EmptyState, PageSpinner, useToast } from "@/components/ui";
import { FolderKanban } from "lucide-react";

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
  const toast = useToast();
  const [data, setData] = useState<ProjectLoad | null>(null);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
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

  useEffect(() => {
    if (!submitError) return;
    toast.error({ title: "Unable to submit project", description: submitError });
  }, [submitError]);

  if (error) {
    return (
      <div
        className="fixed inset-0 grid place-items-center bg-canvas p-6"
        style={{ zIndex: "var(--z-modal)" }}
      >
        <EmptyState
          icon={<FolderKanban size={20} />}
          title="Couldn’t load project"
          description={error}
          action={<Button onClick={onClose}>Close</Button>}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="fixed inset-0 grid place-items-center bg-canvas"
        style={{ zIndex: "var(--z-modal)" }}
      >
        <PageSpinner label="Loading project workspace…" />
      </div>
    );
  }

  if (showResult || data.run.status === "passed") {
    const activeBreakdown =
      breakdown.length > 0
        ? breakdown
        : (data.run.rubricBreakdown as ProjectRubricBreakdownItem[]) || [];
    const didPass = resultPassed || data.run.status === "passed";

    return (
      <div className="relative" style={{ zIndex: "var(--z-modal)" }}>
        <ChallengeResultScreen
          score={resultScore || data.run.score}
          passed={didPass}
          passMark={data.spec.passScore}
          xp={data.xp}
          coins={data.coins}
          alreadySolved={item.status === "solved"}
          breakdown={activeBreakdown}
          onDone={onClose}
          onRetry={
            didPass
              ? undefined
              : () => {
                  setShowResult(false);
                  setSubmitError("");
                }
          }
        />
      </div>
    );
  }

  return (
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
      notes={
        <AddNoteButton
          compact
          sourceType="project"
          sourceId={item.id}
          defaultTitle={`${data.title} notes`}
          contextLabel={`Project · ${data.title}`}
          links={[{ entityType: "project_run", entityId: data.run.id }]}
        />
      }
      onClose={onClose}
      onSaveProgress={async (payload) => {
        await apiSend("/api/me/challenges/project/progress", "PUT", {
          questionId: item.id,
          ...payload,
        });
      }}
      onSubmit={async (payload) => {
        setSubmitting(true);
        setSubmitError("");
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
        } catch (e) {
          setSubmitError(
            e instanceof Error ? e.message : "Unable to submit project",
          );
        } finally {
          setSubmitting(false);
        }
      }}
    />
  );
}
