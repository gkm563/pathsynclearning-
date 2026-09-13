"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Card, ErrorState, PageHeader, PageSpinner, Progress } from "@/components/ui";
import { apiGet, apiSend } from "@/lib/api";
import {
  blendInterviewOverall,
  formatInterviewRun,
  interviewCodedInIde,
  interviewRanSeconds,
  interviewScopeLabel,
} from "@/lib/ai/interview-code";
import { interviewPath, routes } from "@/lib/routes";
import type { InterviewReportPublic, InterviewSessionPublic } from "@/lib/ai/interview-types";
import RoadmapGenerating from "@/views/RoadmapOnboarding/RoadmapGenerating";

export default function PlatformInterviewReport() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<InterviewReportPublic | null>(null);
  const [session, setSession] = useState<InterviewSessionPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adapting, setAdapting] = useState(false);
  const [adaptLabel, setAdaptLabel] = useState("Updating your path…");
  const [applied, setApplied] = useState(false);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      apiGet<{ report: InterviewReportPublic }>(`/api/ai/interview/sessions/${id}/report`),
      apiGet<{ session: InterviewSessionPublic }>(`/api/ai/interview/sessions/${id}`),
    ])
      .then(([rep, ses]) => {
        if (!alive) return;
        setReport(rep.report);
        setSession(ses.session);
      })
      .catch((err: Error) => {
        if (alive) setError(err.message);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!report || !session) return;
    if (report.proctorFailed) return;
    if (session.plan.purpose !== "roadmap_final") return;
    if (report.outcome !== "remediate" && report.outcome !== "redesign") return;
    let alive = true;
    setAdapting(true);
    setAdaptLabel(
      report.outcome === "redesign"
        ? "Rebuilding from your interview gaps"
        : "Updating your path…",
    );
    apiSend<{ focusNodeId?: string | null }>(
      `/api/roadmap/adapt?sessionId=${encodeURIComponent(id)}`,
      "POST",
      {},
    )
      .then((result) => {
        if (!alive) return;
        setFocusNodeId(result.focusNodeId || null);
        setApplied(true);
      })
      .catch((err: Error) => {
        if (alive) setError(err.message);
      })
      .finally(() => {
        if (alive) setAdapting(false);
      });
    return () => {
      alive = false;
    };
  }, [id, report, session]);

  if (error) {
    return (
      <ErrorState
        title="Report not ready"
        description={error}
        action={
          <Link href={interviewPath(id)}>
            <Button variant="secondary">Back to session</Button>
          </Link>
        }
      />
    );
  }
  if (!report || !session) return <PageSpinner label="Scoring interview" />;

  const codedInIde =
    report.codedInIde ||
    interviewCodedInIde({
      turns: session.turns,
      codeSnapshot: session.codeSnapshot,
      starterCode: session.plan.coding?.starterCode,
    });
  const overall = codedInIde
    ? report.overall
    : blendInterviewOverall(report.scores, false);
  const rows: Array<{ label: string; value: number }> = [
    { label: "Communication", value: report.scores.communication },
    { label: "Problem solving", value: report.scores.problemSolving },
    ...(codedInIde
      ? [{ label: "Code quality", value: report.scores.codeQuality }]
      : []),
    { label: "Depth", value: report.scores.depth },
  ];
  const isFinal = session.plan.purpose === "roadmap_final";
  const outcome = report.outcome;
  const diagnoses = report.nodeDiagnoses || [];
  const roadmapHref = focusNodeId
    ? `${routes.app.roadmap}?node=${encodeURIComponent(focusNodeId)}`
    : routes.app.roadmap;

  return (
    <>
      <RoadmapGenerating
        isOpen={adapting && outcome === "redesign"}
        progress={{
          step: "graph",
          percent: 42,
          message: adaptLabel,
        }}
      />
      <PageHeader
        eyebrow={isFinal ? "Certification" : "Career"}
        title={
          report.proctorFailed
            ? "Interview ended"
            : isFinal
            ? outcome === "certified"
              ? "Roadmap certified"
              : outcome === "redesign"
                ? "Path will be rebuilt"
                : "Certification report"
            : "Interview report"
        }
        description={`${interviewScopeLabel(session.targetRole, session.targetCompany)} · Ran ${formatInterviewRun(interviewRanSeconds(session.startedAt, session.endedAt))} (set for ${session.durationMinutes}m)`}
        actions={
          report.proctorFailed ? (
            <Link href={isFinal ? routes.app.roadmap : routes.app.interview}>
              <Button variant="secondary">{isFinal ? "Back to roadmap" : "New mock"}</Button>
            </Link>
          ) : isFinal && outcome === "certified" ? (
            <Link href={routes.app.roadmap}>
              <Button>Open roadmap</Button>
            </Link>
          ) : isFinal && (outcome === "remediate" || outcome === "redesign") ? (
            <Link href={roadmapHref}>
              <Button loading={adapting} disabled={adapting && !applied}>
                {adapting
                  ? outcome === "redesign"
                    ? "Rebuilding…"
                    : "Updating your path…"
                  : "Open roadmap"}
              </Button>
            </Link>
          ) : (
            <Link href={routes.app.interview}>
              <Button variant="secondary">New mock</Button>
            </Link>
          )
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <p className="type-caption m-0 text-[var(--primary)]">
            {report.proctorFailed
              ? "Proctoring fail"
              : isFinal
              ? outcome === "certified"
                ? "Passed"
                : outcome === "redesign"
                  ? "Score 0 — rebuild"
                  : "Did not pass"
              : "Overall"}
          </p>
          <p className="mt-1 mb-4 text-4xl font-semibold tracking-[-0.04em]">{overall}</p>
          <div className="grid gap-3">
            {rows.map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{row.label}</span>
                  <span className="text-muted">{row.value}</span>
                </div>
                <Progress value={row.value} />
              </div>
            ))}
          </div>
          <p className="mt-4 mb-0 text-sm leading-relaxed text-muted">{report.summary}</p>
        </Card>
        <div className="grid gap-4">
          {isFinal && diagnoses.length ? (
            <Card>
              <h2 className="mt-0 mb-3 text-base font-semibold">Weak points</h2>
              <ul className="m-0 grid list-none gap-3 p-0">
                {diagnoses
                  .filter((item) => item.action !== "ok")
                  .map((item) => (
                    <li key={item.nodeId} className="rounded-[var(--radius-md)] bg-[var(--bg-alt)] p-3">
                      <p className="m-0 text-sm font-medium">
                        {item.title} · {item.score}
                        <span className="ml-2 text-muted">
                          {item.action === "loop" ? "review again" : "extra practice"}
                        </span>
                      </p>
                      {item.weakness ? (
                        <p className="type-caption mt-1 mb-0 text-muted">{item.weakness}</p>
                      ) : null}
                    </li>
                  ))}
              </ul>
            </Card>
          ) : (
            <Card>
              <h2 className="mt-0 mb-3 text-base font-semibold">Evidence</h2>
              {report.quotes.length ? (
                <ul className="m-0 grid list-none gap-3 p-0">
                  {report.quotes.map((q, i) => (
                    <li key={i} className="rounded-[var(--radius-md)] bg-[var(--bg-alt)] p-3">
                      <p className="m-0 text-sm italic">“{q.quote}”</p>
                      {q.note ? <p className="type-caption mt-1 mb-0 text-muted">{q.note}</p> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="type-caption m-0 text-muted">No quotes captured for this round.</p>
              )}
            </Card>
          )}
          <Card>
            <h2 className="mt-0 mb-3 text-base font-semibold">Practice next</h2>
            <ul className="m-0 grid list-none gap-2 p-0">
              {report.nextPractice.map((item, index) => (
                <li key={`${item.href}-${item.label}-${index}`}>
                  <Link className="text-sm font-medium text-[var(--primary)]" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
