"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Card, ErrorState, PageHeader, PageSpinner, Progress } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { interviewPath, routes } from "@/lib/routes";
import type { InterviewReportPublic, InterviewSessionPublic } from "@/lib/ai/interview-types";

export default function PlatformInterviewReport() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<InterviewReportPublic | null>(null);
  const [session, setSession] = useState<InterviewSessionPublic | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const rows: Array<{ label: string; value: number }> = [
    { label: "Communication", value: report.scores.communication },
    { label: "Problem solving", value: report.scores.problemSolving },
    { label: "Code quality", value: report.scores.codeQuality },
    { label: "Depth", value: report.scores.depth },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Career"
        title="Interview report"
        description={`${session.targetRole}${session.targetCompany ? ` · ${session.targetCompany}` : ""}`}
        actions={
          <Link href={routes.app.interview}>
            <Button variant="secondary">New mock</Button>
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <p className="type-caption m-0 text-[var(--primary)]">Overall</p>
          <p className="mt-1 mb-4 text-4xl font-semibold tracking-[-0.04em]">{report.overall}</p>
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
          <Card>
            <h2 className="mt-0 mb-3 text-base font-semibold">Practice next</h2>
            <ul className="m-0 grid list-none gap-2 p-0">
              {report.nextPractice.map((item) => (
                <li key={item.href}>
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
