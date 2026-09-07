"use client";

import React, { useMemo, useState } from "react";
import type {
  ProjectAssessmentSpec,
  ProjectEvidenceInput,
  ProjectEvidenceKind,
  ProjectRubricBreakdownItem,
} from "@/lib/projects/types";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  FormField,
  Input,
  Progress,
  Segmented,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { Check, X } from "lucide-react";

type Phase = "overview" | "steps" | "submit";

export default function ProjectWorkspace({
  title,
  xp,
  coins,
  spec,
  initialStepsDone,
  initialEvidence,
  initialRepoUrl,
  initialReflection,
  submitting,
  embedded,
  onSaveProgress,
  onSubmit,
  onClose,
}: {
  title: string;
  xp: number;
  coins: number;
  spec: ProjectAssessmentSpec;
  initialStepsDone?: string[];
  initialEvidence?: ProjectEvidenceInput[];
  initialRepoUrl?: string;
  initialReflection?: string;
  submitting?: boolean;
  /** When true, fills parent instead of fixed fullscreen (roadmap shell). */
  embedded?: boolean;
  onSaveProgress: (payload: {
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
  }) => Promise<void> | void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("overview");
  const [stepIndex, setStepIndex] = useState(0);
  const [stepsDone, setStepsDone] = useState<string[]>(initialStepsDone || []);
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl || "");
  const [reflection, setReflection] = useState(initialReflection || "");
  const [evidence, setEvidence] = useState<ProjectEvidenceInput[]>(
    initialEvidence || [],
  );
  const [saving, setSaving] = useState(false);

  const current = spec.steps[stepIndex];
  const donePct = useMemo(() => {
    if (!spec.steps.length) return 100;
    return Math.round(
      (stepsDone.filter((id) => spec.steps.some((s) => s.id === id)).length /
        spec.steps.length) *
        100,
    );
  }, [stepsDone, spec.steps]);

  const toggleStep = (id: string) => {
    setStepsDone((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const setEvidenceField = (
    kind: ProjectEvidenceKind,
    patch: Partial<ProjectEvidenceInput>,
  ) => {
    setEvidence((prev) => {
      const rest = prev.filter((e) => e.kind !== kind);
      const next = { kind, ...patch };
      const url = typeof next.url === "string" ? next.url.trim() : "";
      const text = typeof next.text === "string" ? next.text.trim() : "";
      // Drop empty optional evidence instead of sending blank URLs
      if (!url && !text) return rest;
      return [
        ...rest,
        {
          ...next,
          ...(url ? { url } : { url: undefined }),
          ...(text ? { text } : { text: undefined }),
        },
      ];
    });
  };

  const evidenceValue = (kind: ProjectEvidenceKind) =>
    evidence.find((e) => e.kind === kind);

  const sanitizeEvidence = (items: ProjectEvidenceInput[]) =>
    items
      .map((e) => {
        const url =
          typeof e.url === "string" && e.url.trim() ? e.url.trim() : undefined;
        const text =
          typeof e.text === "string" && e.text.trim()
            ? e.text.trim()
            : undefined;
        const stepId =
          typeof e.stepId === "string" && e.stepId.trim()
            ? e.stepId.trim()
            : undefined;
        if (!url && !text) return null;
        return {
          kind: e.kind,
          ...(url ? { url } : {}),
          ...(text ? { text } : {}),
          ...(stepId ? { stepId } : {}),
        } as ProjectEvidenceInput;
      })
      .filter((e): e is ProjectEvidenceInput => Boolean(e));

  const persist = async () => {
    setSaving(true);
    try {
      await onSaveProgress({
        stepsDone,
        evidence: sanitizeEvidence(evidence),
        repoUrl: repoUrl.trim() || undefined,
        reflection: reflection.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-canvas",
        embedded ? "relative min-h-0 flex-1" : "fixed inset-0",
      )}
      style={embedded ? undefined : { zIndex: "var(--z-modal)" }}
    >
      <header className="flex items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3.5">
        <div className="min-w-0">
          <p className="type-caption m-0 font-semibold text-muted">
            Project assessment · +{xp} XP · {coins} coins
          </p>
          <h1 className="type-h3 m-0 mt-0.5 truncate text-ink">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="w-28">
            <Progress value={donePct} label="Steps" showValue size="sm" />
          </div>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </header>

      <nav className="border-b border-line bg-surface px-5 py-3">
        <Segmented
          ariaLabel="Project phases"
          value={phase}
          onChange={(id) => setPhase(id as Phase)}
          items={[
            { id: "overview", label: "Overview" },
            { id: "steps", label: "Step-by-step" },
            { id: "submit", label: "Submit" },
          ]}
        />
      </nav>

      <div className="flex-1 overflow-auto p-5">
        {phase === "overview" && (
          <div className="mx-auto grid w-full max-w-[820px] gap-4">
            <Card>
              <h2 className="type-h4 m-0 mb-2 text-ink">Goal</h2>
              <p className="type-body m-0 text-ink">{spec.overview.goal}</p>
            </Card>
            <Card>
              <h2 className="type-h4 m-0 mb-2 text-ink">Stack</h2>
              <div className="flex flex-wrap gap-2">
                {spec.overview.stack.map((s) => (
                  <Badge key={s} tone="accent">
                    {s}
                  </Badge>
                ))}
              </div>
            </Card>
            <Card>
              <h2 className="type-h4 m-0 mb-2 text-ink">Deliverables</h2>
              <ul className="type-body m-0 list-disc pl-4.5 text-ink">
                {spec.overview.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <h2 className="type-h4 m-0 mb-2 text-ink">Pass rubric (summary)</h2>
              <p className="type-body m-0 text-ink">
                Pass mark {spec.passScore}%. Estimated {spec.overview.estimatedHours}{" "}
                hours. Complete steps, attach evidence, then submit for automated
                checks (including GitHub when a repo URL is provided).
              </p>
              <ul className="type-body mt-2 mb-0 list-disc pl-4.5 text-ink">
                {spec.rubric.map((r) => (
                  <li key={r.id} className="mb-1">
                    {r.label} · {r.weight}%
                  </li>
                ))}
              </ul>
            </Card>
            <Button onClick={() => setPhase("steps")}>
              Start step-by-step guide
            </Button>
          </div>
        )}

        {phase === "steps" && current && (
          <div className="mx-auto grid w-full max-w-[820px] gap-3.5">
            <div className="flex flex-wrap gap-2">
              {spec.steps.map((s, i) => {
                const done = stepsDone.includes(s.id);
                return (
                  <Button
                    key={s.id}
                    type="button"
                    variant={i === stepIndex ? "primary" : "secondary"}
                    size="sm"
                    className={cn(
                      done &&
                        i !== stepIndex &&
                        "border-[color-mix(in_srgb,var(--success)_36%,var(--border-light))] bg-success-soft text-success",
                    )}
                    onClick={() => setStepIndex(i)}
                  >
                    {i + 1}. {s.title}
                  </Button>
                );
              })}
            </div>
            <Card>
              <h2 className="type-h4 m-0 text-ink">
                Step {stepIndex + 1}: {current.title}
              </h2>
              <p className="type-body mt-2 mb-0 text-ink">{current.instructions}</p>
              <h3 className="type-label mt-3.5 mb-1.5 text-ink">Acceptance</h3>
              <ul className="type-body m-0 list-disc pl-4.5 text-ink">
                {current.acceptance.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
              {current.resources && current.resources.length > 0 && (
                <>
                  <h3 className="type-label mt-3.5 mb-1.5 text-ink">Resources</h3>
                  <ul className="m-0 list-disc pl-4.5">
                    {current.resources.map((r) => (
                      <li key={r.url}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="type-small text-primary underline-offset-4 hover:underline"
                        >
                          {r.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="mt-4">
                <Checkbox
                  checked={stepsDone.includes(current.id)}
                  onChange={() => toggleStep(current.id)}
                  label="Mark this step complete"
                />
              </div>
            </Card>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={stepIndex === 0}
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={stepIndex >= spec.steps.length - 1}
                onClick={() =>
                  setStepIndex((i) => Math.min(spec.steps.length - 1, i + 1))
                }
              >
                Next
              </Button>
              <Button
                variant="secondary"
                disabled={saving}
                loading={saving}
                onClick={() => void persist()}
              >
                {saving ? "Saving…" : "Save progress"}
              </Button>
              <Button onClick={() => setPhase("submit")}>
                Continue to submit
              </Button>
            </div>
          </div>
        )}

        {phase === "submit" && (
          <div className="mx-auto grid w-full max-w-[820px] gap-3.5">
            <Card>
              <h2 className="type-h4 m-0 mb-2 text-ink">Evidence</h2>
              <p className="type-body m-0 mb-3 text-muted">
                Attach links and a short reflection. GitHub checks run when you
                provide a repository URL.
              </p>
              <div className="grid gap-3">
                <FormField label="Repository URL">
                  {(props) => (
                    <Input
                      {...props}
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/you/project"
                    />
                  )}
                </FormField>
                <FormField label="Demo URL (optional)" optional>
                  {(props) => (
                    <Input
                      {...props}
                      value={evidenceValue("demo_url")?.url || ""}
                      onChange={(e) =>
                        setEvidenceField("demo_url", { url: e.target.value })
                      }
                      placeholder="https://…"
                    />
                  )}
                </FormField>
                <FormField label="Screenshot / preview URL (optional)" optional>
                  {(props) => (
                    <Input
                      {...props}
                      value={evidenceValue("screenshot_url")?.url || ""}
                      onChange={(e) =>
                        setEvidenceField("screenshot_url", {
                          url: e.target.value,
                        })
                      }
                      placeholder="https://…"
                    />
                  )}
                </FormField>
                <FormField label="Reflection">
                  {(props) => (
                    <Textarea
                      {...props}
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      rows={5}
                      placeholder="What you built, how you verified it, tradeoffs…"
                    />
                  )}
                </FormField>
              </div>
            </Card>
            <Card>
              <h2 className="type-h4 m-0 mb-2 text-ink">Checklist status</h2>
              <ul className="type-body m-0 list-disc pl-4.5 text-ink">
                {spec.steps.map((s) => (
                  <li key={s.id}>
                    {stepsDone.includes(s.id) ? "Done" : "Open"} — {s.title}
                  </li>
                ))}
              </ul>
            </Card>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={saving}
                loading={saving}
                onClick={() => void persist()}
              >
                {saving ? "Saving…" : "Save draft"}
              </Button>
              <Button
                disabled={submitting}
                loading={submitting}
                onClick={() =>
                  void onSubmit({
                    stepsDone,
                    evidence: sanitizeEvidence([
                      ...evidence,
                      ...(reflection.trim()
                        ? [{ kind: "notes" as const, text: reflection.trim() }]
                        : []),
                      ...(repoUrl.trim()
                        ? [{ kind: "repo_url" as const, url: repoUrl.trim() }]
                        : []),
                    ]),
                    repoUrl: repoUrl.trim() || undefined,
                    reflection: reflection.trim() || undefined,
                  })
                }
              >
                {submitting ? "Submitting…" : "Submit for check"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectRubricList({
  breakdown,
}: {
  breakdown: ProjectRubricBreakdownItem[];
}) {
  if (!breakdown?.length) return null;
  const failed = breakdown.filter((b) => !b.passed);
  return (
    <div className="mt-4 text-left">
      <h3 className="type-h4 mb-2 text-ink">Rubric breakdown</h3>
      {failed.length > 0 ? (
        <div className="mb-3 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--error)_28%,var(--border-light))] bg-danger-soft p-3">
          <p className="type-label mb-1.5 text-danger">Missing to pass</p>
          <ul className="m-0 list-disc pl-4.5">
            {failed.map((b) => (
              <li key={`missing-${b.id}`} className="type-small mb-1 text-ink">
                <strong>{b.label}</strong> — {b.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {breakdown.map((b) => (
        <div
          key={b.id}
          className="flex justify-between gap-3 border-t border-line py-2"
        >
          <div>
            <div
              className={`type-small flex items-center gap-1.5 font-semibold ${b.passed ? "text-success" : "text-danger"}`}
            >
              {b.passed ? <Check size={14} aria-hidden /> : <X size={14} aria-hidden />}
              {b.passed ? "Pass" : "Fail"} · {b.label}
            </div>
            <p className="type-caption m-0 text-muted">{b.detail}</p>
          </div>
          <strong className={`type-small ${b.passed ? "text-success" : "text-danger"}`}>
            {b.earned}/{b.weight}
          </strong>
        </div>
      ))}
    </div>
  );
}
