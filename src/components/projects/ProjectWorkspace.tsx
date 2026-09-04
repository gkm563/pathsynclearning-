"use client";

import React, { useMemo, useState } from "react";
import type {
  ProjectAssessmentSpec,
  ProjectEvidenceInput,
  ProjectEvidenceKind,
  ProjectRubricBreakdownItem,
} from "@/lib/projects/types";

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
      style={{
        position: embedded ? "relative" : "fixed",
        inset: embedded ? undefined : 0,
        flex: embedded ? 1 : undefined,
        minHeight: embedded ? 0 : undefined,
        zIndex: embedded ? undefined : 1200,
        background: "var(--bg-main, #f8fafc)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Outfit, sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-light, rgba(15,23,42,0.1))",
          background: "var(--bg-card, #fff)",
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>
            Project assessment · +{xp} XP · {coins} coins
          </div>
          <h1 style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800 }}>
            {title}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontFamily: "Fira Code", fontSize: 12, fontWeight: 700 }}>
            {donePct}% steps
          </span>
          <button type="button" onClick={onClose} style={ghostBtn}>
            Close
          </button>
        </div>
      </header>

      <nav
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 20px",
          borderBottom: "1px solid var(--border-light)",
          background: "var(--bg-card)",
        }}
      >
        {(
          [
            ["overview", "Overview"],
            ["steps", "Step-by-step"],
            ["submit", "Submit"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPhase(id)}
            style={{
              ...ghostBtn,
              background: phase === id ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
              borderColor: phase === id ? "#6c63ff" : "var(--border-light)",
              color: phase === id ? "#6c63ff" : "var(--text-main)",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {phase === "overview" && (
          <div style={{ maxWidth: 820, margin: "0 auto", display: "grid", gap: 16 }}>
            <Card>
              <h2 style={h2}>Goal</h2>
              <p style={body}>{spec.overview.goal}</p>
            </Card>
            <Card>
              <h2 style={h2}>Stack</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {spec.overview.stack.map((s) => (
                  <span key={s} style={chip}>
                    {s}
                  </span>
                ))}
              </div>
            </Card>
            <Card>
              <h2 style={h2}>Deliverables</h2>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {spec.overview.deliverables.map((d) => (
                  <li key={d} style={body}>
                    {d}
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <h2 style={h2}>Pass rubric (summary)</h2>
              <p style={body}>
                Pass mark {spec.passScore}%. Estimated {spec.overview.estimatedHours}{" "}
                hours. Complete steps, attach evidence, then submit for automated
                checks (including GitHub when a repo URL is provided).
              </p>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {spec.rubric.map((r) => (
                  <li key={r.id} style={{ ...body, marginBottom: 4 }}>
                    {r.label} · {r.weight}%
                  </li>
                ))}
              </ul>
            </Card>
            <button
              type="button"
              onClick={() => setPhase("steps")}
              style={primaryBtn}
            >
              Start step-by-step guide
            </button>
          </div>
        )}

        {phase === "steps" && current && (
          <div style={{ maxWidth: 820, margin: "0 auto", display: "grid", gap: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {spec.steps.map((s, i) => {
                const done = stepsDone.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStepIndex(i)}
                    style={{
                      ...ghostBtn,
                      borderColor:
                        i === stepIndex
                          ? "#6c63ff"
                          : done
                            ? "#00c9a7"
                            : "var(--border-light)",
                      background:
                        i === stepIndex
                          ? "rgba(108,99,255,0.12)"
                          : done
                            ? "rgba(0,201,167,0.1)"
                            : "var(--bg-alt)",
                    }}
                  >
                    {i + 1}. {s.title}
                  </button>
                );
              })}
            </div>
            <Card>
              <h2 style={h2}>
                Step {stepIndex + 1}: {current.title}
              </h2>
              <p style={body}>{current.instructions}</p>
              <h3 style={{ ...h2, fontSize: 14, marginTop: 14 }}>Acceptance</h3>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {current.acceptance.map((a) => (
                  <li key={a} style={body}>
                    {a}
                  </li>
                ))}
              </ul>
              {current.resources && current.resources.length > 0 && (
                <>
                  <h3 style={{ ...h2, fontSize: 14, marginTop: 14 }}>Resources</h3>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {current.resources.map((r) => (
                      <li key={r.url}>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#6c63ff", fontFamily: "Outfit" }}
                        >
                          {r.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 16,
                  fontWeight: 700,
                }}
              >
                <input
                  type="checkbox"
                  checked={stepsDone.includes(current.id)}
                  onChange={() => toggleStep(current.id)}
                />
                Mark this step complete
              </label>
            </Card>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                disabled={stepIndex === 0}
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                style={ghostBtn}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={stepIndex >= spec.steps.length - 1}
                onClick={() =>
                  setStepIndex((i) => Math.min(spec.steps.length - 1, i + 1))
                }
                style={ghostBtn}
              >
                Next
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void persist()}
                style={ghostBtn}
              >
                {saving ? "Saving…" : "Save progress"}
              </button>
              <button
                type="button"
                onClick={() => setPhase("submit")}
                style={primaryBtn}
              >
                Continue to submit
              </button>
            </div>
          </div>
        )}

        {phase === "submit" && (
          <div style={{ maxWidth: 820, margin: "0 auto", display: "grid", gap: 14 }}>
            <Card>
              <h2 style={h2}>Evidence</h2>
              <p style={body}>
                Attach links and a short reflection. GitHub checks run when you
                provide a repository URL.
              </p>
              <Field
                label="Repository URL"
                value={repoUrl}
                onChange={setRepoUrl}
                placeholder="https://github.com/you/project"
              />
              <Field
                label="Demo URL (optional)"
                value={evidenceValue("demo_url")?.url || ""}
                onChange={(v) => setEvidenceField("demo_url", { url: v })}
                placeholder="https://…"
              />
              <Field
                label="Screenshot / preview URL (optional)"
                value={evidenceValue("screenshot_url")?.url || ""}
                onChange={(v) => setEvidenceField("screenshot_url", { url: v })}
                placeholder="https://…"
              />
              <label style={{ display: "block", marginTop: 12, fontWeight: 700 }}>
                Reflection
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={5}
                  placeholder="What you built, how you verified it, tradeoffs…"
                  style={textarea}
                />
              </label>
            </Card>
            <Card>
              <h2 style={h2}>Checklist status</h2>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {spec.steps.map((s) => (
                  <li key={s.id} style={body}>
                    {stepsDone.includes(s.id) ? "Done" : "Open"} — {s.title}
                  </li>
                ))}
              </ul>
            </Card>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                disabled={saving}
                onClick={() => void persist()}
                style={ghostBtn}
              >
                {saving ? "Saving…" : "Save draft"}
              </button>
              <button
                type="button"
                disabled={submitting}
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
                style={primaryBtn}
              >
                {submitting ? "Submitting…" : "Submit for check"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 16,
        background: "var(--bg-card, #fff)",
        border: "1.5px solid var(--border-light, rgba(15,23,42,0.1))",
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={{ display: "block", marginTop: 12, fontWeight: 700 }}>
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          display: "block",
          width: "100%",
          marginTop: 6,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid var(--border-light)",
          fontFamily: "Outfit",
          fontSize: 14,
        }}
      />
    </label>
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
    <div style={{ marginTop: 16, textAlign: "left" }}>
      <div style={{ fontFamily: "Outfit", fontWeight: 800, marginBottom: 8 }}>
        Rubric breakdown
      </div>
      {failed.length > 0 ? (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 12,
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <div
            style={{
              fontFamily: "Outfit",
              fontWeight: 800,
              fontSize: 13,
              color: "#b91c1c",
              marginBottom: 6,
            }}
          >
            Missing to pass
          </div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {failed.map((b) => (
              <li
                key={`missing-${b.id}`}
                style={{
                  fontSize: 13,
                  fontFamily: "Outfit",
                  marginBottom: 4,
                  color: "var(--text-main)",
                }}
              >
                <strong>{b.label}</strong> — {b.detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {breakdown.map((b) => (
        <div
          key={b.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            padding: "8px 0",
            borderTop: "1px solid var(--border-light)",
            fontSize: 13,
            fontFamily: "Outfit",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 700,
                color: b.passed ? "#059669" : "#ef4444",
              }}
            >
              {b.passed ? "✓ Pass" : "✗ Fail"} · {b.label}
            </div>
            <div style={{ color: "var(--text-muted)" }}>{b.detail}</div>
          </div>
          <strong style={{ color: b.passed ? "#059669" : "#ef4444" }}>
            {b.earned}/{b.weight}
          </strong>
        </div>
      ))}
    </div>
  );
}

const h2: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 16,
  fontWeight: 800,
};
const body: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.55,
  color: "var(--text-main)",
};
const chip: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 999,
  background: "rgba(108,99,255,0.1)",
  color: "#6c63ff",
  fontSize: 12,
  fontWeight: 700,
};
const ghostBtn: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1.5px solid var(--border-light)",
  background: "var(--bg-alt)",
  color: "var(--text-main)",
  fontWeight: 700,
  fontFamily: "Outfit",
  fontSize: 13,
  cursor: "pointer",
};
const primaryBtn: React.CSSProperties = {
  padding: "12px 18px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
  color: "#fff",
  fontWeight: 800,
  fontFamily: "Outfit",
  fontSize: 14,
  cursor: "pointer",
};
const textarea: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: 12,
  borderRadius: 10,
  border: "1px solid var(--border-light)",
  fontFamily: "Outfit",
  fontSize: 14,
  resize: "vertical",
};
