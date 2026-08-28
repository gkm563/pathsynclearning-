import type { ProjectAssessmentSpec } from "@/lib/projects/types";
import type { NodeAssessment, RoadmapNode } from "@/types/roadmap";

/** Default guided project spec for roadmap project nodes. */
export function buildProjectSpecForNode(node: RoadmapNode): ProjectAssessmentSpec {
  const title = node.title || "Project";
  const stack = [
    ...(node.skills || []).slice(0, 4),
    ...(node.topics || []).slice(0, 2),
  ].filter(Boolean);
  const goal =
    node.project ||
    node.description ||
    `Build and document a working deliverable for ${title}.`;

  return {
    type: "project",
    passScore: 70,
    timeLimitMinutes: Math.max(60, Math.round((node.estimatedHours || 4) * 60)),
    overview: {
      goal,
      stack: stack.length ? stack : ["Your stack", "Git", "Documentation"],
      deliverables: [
        "Working implementation that meets the goal",
        "README with setup and usage",
        "Short reflection on design choices",
      ],
      estimatedHours: node.estimatedHours || 4,
    },
    steps: [
      {
        id: "scope",
        title: "Scope the project",
        instructions: `Write down the problem, users, and success criteria for “${title}”. Keep the first version small enough to finish in the estimated hours.`,
        acceptance: [
          "Clear problem statement",
          "Listed in-scope and out-of-scope items",
          "Success criteria defined",
        ],
        requiredEvidence: ["notes"],
      },
      {
        id: "setup",
        title: "Set up the repository",
        instructions:
          "Create a Git repository, add a README skeleton, choose the stack, and make an initial commit. Prefer a public GitHub repo for verification.",
        acceptance: [
          "Repo exists with README",
          "Initial commit present",
          "Stack noted in README",
        ],
        requiredEvidence: ["repo_url"],
        resources: [
          {
            label: "GitHub quickstart",
            url: "https://docs.github.com/en/get-started",
          },
        ],
      },
      {
        id: "build",
        title: "Implement the core deliverable",
        instructions: `Implement the core features for ${title}. Focus on correctness and clarity over extra polish.`,
        acceptance: [
          "Core feature works end-to-end",
          "Code organized in readable modules",
          "Basic error handling in place",
        ],
        requiredEvidence: ["screenshot_url"],
      },
      {
        id: "docs",
        title: "Document and demo",
        instructions:
          "Finish the README (setup, run, architecture). Optionally add a short demo link or screenshot of the running app.",
        acceptance: [
          "README explains how to run",
          "Demo or screenshot of working result",
          "Reflection covers tradeoffs",
        ],
        requiredEvidence: ["demo_url", "notes"],
      },
    ],
    rubric: [
      {
        id: "checklist",
        label: "All guide steps completed",
        weight: 30,
        check: "checklist_complete",
      },
      {
        id: "evidence",
        label: "Required evidence submitted",
        weight: 25,
        check: "evidence_present",
      },
      {
        id: "reflection",
        label: "Reflection covers acceptance themes",
        weight: 15,
        check: "keyword_notes",
        keywords: ["setup", "implement", "readme", "tradeoff", "test"],
      },
      {
        id: "gh_readme",
        label: "GitHub README present",
        weight: 15,
        check: "github_readme",
      },
      {
        id: "gh_commits",
        label: "Repository has commits",
        weight: 15,
        check: "github_commits",
      },
    ],
  };
}

export function nodeAssessmentFromProjectSpec(
  spec: ProjectAssessmentSpec,
): NodeAssessment {
  return {
    type: "project",
    passScore: spec.passScore,
    timeLimitMinutes: spec.timeLimitMinutes || 120,
    project: {
      overview: spec.overview,
      steps: spec.steps,
      rubric: spec.rubric,
    },
  };
}
