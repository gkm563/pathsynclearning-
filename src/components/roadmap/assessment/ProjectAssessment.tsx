"use client";

import React, { useState } from "react";
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
  onSubmit,
}: {
  assessment: NodeAssessment;
  title: string;
  submitting: boolean;
  onSubmit: (payload: {
    stepsDone: string[];
    evidence: ProjectEvidenceInput[];
    repoUrl?: string;
    reflection?: string;
  }) => void;
}) {
  const project = assessment.project;
  const [mounted] = useState(true);
  if (!project || !mounted) {
    return (
      <div style={{ padding: 24, fontFamily: "Outfit" }}>
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
      onClose={() => {}}
      onSaveProgress={() => undefined}
      onSubmit={onSubmit}
    />
  );
}
