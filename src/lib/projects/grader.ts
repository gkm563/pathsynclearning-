import type {
  ProjectAssessmentSpec,
  ProjectEvidenceInput,
  ProjectGradeResult,
  ProjectRubricBreakdownItem,
} from "@/lib/projects/types";
import { inspectGithubRepo } from "@/lib/projects/github-inspector";

function evidenceLabel(kind: string): string {
  switch (kind) {
    case "repo_url":
      return "GitHub repository URL";
    case "demo_url":
      return "Live demo URL";
    case "screenshot_url":
      return "Screenshot / preview URL";
    case "notes":
      return "Written notes (at least 20 characters)";
    default:
      return kind;
  }
}

function isHttpUrl(v: string | undefined): boolean {
  if (!v) return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function checklistPct(stepIds: string[], stepsDone: string[]): number {
  if (!stepIds.length) return 100;
  const done = stepIds.filter((id) => stepsDone.includes(id)).length;
  return Math.round((done / stepIds.length) * 100);
}

function hasEvidenceKind(
  evidence: ProjectEvidenceInput[],
  kind: ProjectEvidenceInput["kind"],
): boolean {
  return evidence.some((e) => {
    if (e.kind !== kind) return false;
    if (kind === "notes") return Boolean(e.text && e.text.trim().length >= 20);
    return isHttpUrl(e.url);
  });
}

function keywordHit(text: string, keywords: string[]): boolean {
  const hay = text.toLowerCase();
  const hits = keywords.filter((k) => hay.includes(k.toLowerCase()));
  return hits.length >= Math.max(1, Math.ceil(keywords.length * 0.4));
}

/**
 * Server-side project grader — never trust client score.
 */
export async function gradeProject(
  spec: ProjectAssessmentSpec,
  opts: {
    stepsDone: string[];
    evidence: ProjectEvidenceInput[];
    repoUrl?: string;
    reflection?: string;
  },
): Promise<ProjectGradeResult> {
  const stepIds = spec.steps.map((s) => s.id);
  const pct = checklistPct(stepIds, opts.stepsDone);
  const missingSteps = spec.steps
    .filter((s) => !opts.stepsDone.includes(s.id))
    .map((s) => s.title);
  const evidence = [...opts.evidence];
  if (opts.repoUrl && isHttpUrl(opts.repoUrl)) {
    evidence.push({ kind: "repo_url", url: opts.repoUrl });
  }

  // Required evidence across steps
  const requiredKinds = new Set<ProjectEvidenceInput["kind"]>();
  for (const step of spec.steps) {
    for (const k of step.requiredEvidence || []) requiredKinds.add(k);
  }

  let githubReport: Awaited<ReturnType<typeof inspectGithubRepo>> | null = null;
  const needsGithub = spec.rubric.some((r) =>
    r.check.startsWith("github_"),
  );
  if (needsGithub) {
    const repo =
      opts.repoUrl ||
      evidence.find((e) => e.kind === "repo_url" && e.url)?.url ||
      "";
    githubReport = await inspectGithubRepo(repo);
  }

  const breakdown: ProjectRubricBreakdownItem[] = [];

  for (const item of spec.rubric) {
    let passed = false;
    let detail = "";

    switch (item.check) {
      case "checklist_complete": {
        passed = pct >= 100;
        detail = passed
          ? `All ${stepIds.length} guide steps completed`
          : `Complete remaining steps: ${missingSteps.join(", ") || "unfinished checklist"} (${pct}% done)`;
        break;
      }
      case "evidence_present": {
        const missing = [...requiredKinds].filter(
          (k) => !hasEvidenceKind(evidence, k),
        );
        if (requiredKinds.size === 0) {
          passed = evidence.some(
            (e) =>
              (e.kind === "notes" && (e.text || "").trim().length >= 20) ||
              isHttpUrl(e.url),
          );
          detail = passed
            ? "Evidence provided"
            : "Add a valid demo/repo link or notes with at least 20 characters";
        } else {
          passed = missing.length === 0;
          detail = passed
            ? "All required evidence present"
            : `Still need: ${missing.map(evidenceLabel).join("; ")}`;
        }
        break;
      }
      case "keyword_notes": {
        const text = [
          opts.reflection || "",
          ...evidence.filter((e) => e.kind === "notes").map((e) => e.text || ""),
        ].join(" ");
        const keywords =
          item.keywords ||
          spec.steps.flatMap((s) => s.acceptance).slice(0, 8);
        const missingKeywords = keywords.filter(
          (k) => !text.toLowerCase().includes(k.toLowerCase()),
        );
        passed = keywordHit(text, keywords);
        detail = passed
          ? "Reflection covers key acceptance themes"
          : missingKeywords.length
            ? `Expand your reflection to cover: ${missingKeywords.slice(0, 5).join(", ")}`
            : "Write a longer reflection covering how you met the acceptance criteria";
        break;
      }
      case "manual": {
        passed = false;
        detail = "Manual review is not scored in the automated pass";
        break;
      }
      case "github_readme": {
        passed = Boolean(githubReport?.hasReadme);
        detail = githubReport?.ok
          ? passed
            ? "README found in repository"
            : "Add a README.md to your GitHub repository root"
          : githubReport?.error ||
            "Add a public GitHub repository URL so we can check for README.md";
        break;
      }
      case "github_structure": {
        const required = item.requiredPaths || [];
        if (!githubReport?.ok) {
          passed = false;
          detail =
            githubReport?.error ||
            "Add a public GitHub repository URL so we can inspect project structure";
        } else if (!required.length) {
          passed = (githubReport.paths?.length || 0) > 0;
          detail = passed
            ? "Repository has files"
            : "Repository appears empty — push your project files";
        } else {
          const missing = required.filter(
            (p) =>
              !(githubReport.paths || []).some((path) =>
                path.toLowerCase().includes(p.toLowerCase()),
              ),
          );
          passed = missing.length === 0;
          detail = passed
            ? "Required paths present"
            : `Add these paths to the repo: ${missing.join(", ")}`;
        }
        break;
      }
      case "github_commits": {
        const count = githubReport?.recentCommits ?? 0;
        passed = Boolean(githubReport?.ok) && count >= 1;
        detail = githubReport?.ok
          ? passed
            ? `Repository has ${count} recent commit${count === 1 ? "" : "s"}`
            : "Push at least one commit to your repository"
          : githubReport?.error ||
            "Add a public GitHub repository URL so we can check commits";
        break;
      }
      default:
        passed = false;
        detail = "Unknown check";
    }

    breakdown.push({
      id: item.id,
      label: item.label,
      weight: item.weight,
      earned: passed ? item.weight : 0,
      passed,
      detail,
    });
  }

  const active = breakdown.filter((b) => {
    const rub = spec.rubric.find((r) => r.id === b.id);
    return rub?.check !== "manual";
  });
  const weightSum = active.reduce((s, b) => s + b.weight, 0) || 100;
  const earnedSum = active.reduce((s, b) => s + b.earned, 0);
  const score = Math.round((earnedSum / weightSum) * 100);

  return {
    score,
    passed: score >= (spec.passScore ?? 70),
    checklistPct: pct,
    breakdown,
  };
}
