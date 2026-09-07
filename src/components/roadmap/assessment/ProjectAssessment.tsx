"use client";

import React from "react";
import ProjectWorkspace from "@/components/projects/ProjectWorkspace";
import type { NodeAssessment } from "@/types/roadmap";
import type {
  ProjectAssessmentSpec,
  ProjectEvidenceInput,
} from "@/lib/projects/types";

export default function ProjectAssessment({
  assessment,
  title,
  submitting,
  onClose,
  onSaveProgress,
  onSubmit,
}: {
  assessment: NodeAssessment;
  title: string;
  submitting: boolean;
  onClose: () => void;
  onSaveProgress?: (payload: {
    stepsDone: string[];
    evidence: ProjectEvidenceInput[];
    repoUrl?: string;
    reflection?: string;
  }) => Promise<void> | void;
  onSubmit: (payload: {
    stepsDone: string[];
    evidence: ProjectEvidenceInput[];
    repoUrl?: string;
    reflection?: string;
  }) => void | Promise<void>;
}) {
  const project = assessment.project;
  if (!project) {
    return (
      <div className="p-6 type-body text-muted">
        No project assessment configured for this node.
      </div>
    );
  }

  const spec: ProjectAssessmentSpec = {
    type: "project",
    passScore: assessment.passScore,
    timeLimitMinutes: assessment.timeLimitMinutes,
    overview: project.overview,
    steps: project.steps,
    rubric: project.rubric,
  };

  return (
    <ProjectWorkspace
      title={title}
      xp={0}
      coins={0}
      spec={spec}
      submitting={submitting}
      onClose={onClose}
      onSaveProgress={onSaveProgress || (() => undefined)}
      onSubmit={onSubmit}
    />
  );
}
