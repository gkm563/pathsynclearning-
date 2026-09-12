"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Sparkles } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  PageHeader,
  Select,
  Skeleton,
  useToast,
} from "@/components/ui";
import { apiGet, apiSend } from "@/lib/api";
import { interviewPath, interviewReportPath } from "@/lib/routes";
import type {
  InterviewMode,
  InterviewSessionSummary,
  InterviewTrack,
} from "@/lib/ai/interview-types";

type ListResponse = {
  sessions: InterviewSessionSummary[];
  livekitConfigured: boolean;
};

const TRACKS: Array<{ id: InterviewTrack; label: string; hint: string }> = [
  {
    id: "dsa_behavioral",
    label: "DSA + behavioral",
    hint: "Warm-up, then a coding round — closest to a real SDE loop.",
  },
  { id: "dsa", label: "DSA only", hint: "Talk through a problem and write code." },
  { id: "behavioral", label: "Behavioral", hint: "Projects, ownership, and collaboration." },
];

export default function PlatformInterview() {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState<InterviewTrack>("dsa_behavioral");
  const [mode, setMode] = useState<InterviewMode>("voice");
  const [minutes, setMinutes] = useState<15 | 20 | 30>(20);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let alive = true;
    apiGet<ListResponse>("/api/ai/interview")
      .then((res) => {
        if (alive) setData(res);
      })
      .catch((err: Error) => {
        if (alive) setError(err.message);
      });
    return () => {
      alive = false;
    };
  }, []);

  const start = async () => {
    setStarting(true);
    try {
      const res = await apiSend<{ session: { id: string } }>(
        "/api/ai/interview/sessions",
        "POST",
        { track, mode, durationMinutes: minutes },
      );
      router.push(interviewPath(res.session.id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start interview");
      setStarting(false);
    }
  };

  if (error) {
    return <ErrorState title="Could not load interviews" description={error} />;
  }

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="Career" title="AI Interview" />
        <Skeleton className="h-48 w-full" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Career"
        title="AI Interview"
        description="A mock interviewer that probes like a real loop: voice or text, optional coding, then an evidence-backed report. Swap LiveKit to your own VPS later — the app already reads LIVEKIT_URL from env."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <p className="type-caption m-0 text-[var(--primary)]">New mock</p>
          <h2 className="mt-1 mb-4 text-lg font-semibold tracking-[-0.03em]">
            Start an interview
          </h2>
          <div className="grid gap-3">
            {TRACKS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTrack(item.id)}
                className={`rounded-[var(--radius-md)] border p-3 text-left transition-colors ${
                  track === item.id
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                    : "border-[var(--border-light)] hover:bg-[var(--bg-alt)]"
                }`}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="type-caption text-muted">{item.hint}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Mode">
              <Select
                value={mode}
                onChange={(e) => setMode(e.target.value as InterviewMode)}
              >
                <option value="voice">Voice (browser speech)</option>
                <option value="text">Text only</option>
              </Select>
            </Field>
            <Field label="Length">
              <Select
                value={String(minutes)}
                onChange={(e) => setMinutes(Number(e.target.value) as 15 | 20 | 30)}
              >
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
              </Select>
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={() => void start()} loading={starting}>
              <Mic size={16} aria-hidden />
              Begin interview
            </Button>
            <Badge tone={data.livekitConfigured ? "success" : "neutral"}>
              {data.livekitConfigured ? "LiveKit connected" : "LiveKit not configured"}
            </Badge>
          </div>
          <p className="type-caption mt-3 mb-0 text-muted">
            Questions and scoring use Ollama Cloud. Voice uses your browser&apos;s speech APIs
            (no Groq). Optional LiveKit is only for camera presence — run{" "}
            <code className="font-mono text-[12px]">npm run interview:agent</code> if you want
            the worker connected.
          </p>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--primary)]" aria-hidden />
            <h2 className="m-0 text-lg font-semibold tracking-[-0.03em]">Past mocks</h2>
          </div>
          {data.sessions.length === 0 ? (
            <EmptyState
              title="No interviews yet"
              description="Run one 20-minute mock to get a scored report and practice links."
            />
          ) : (
            <ul className="m-0 grid list-none gap-2 p-0">
              {data.sessions.map((session) => (
                <li key={session.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] px-3 py-2.5 text-left hover:bg-[var(--bg-alt)]"
                    onClick={() =>
                      router.push(
                        session.status === "completed"
                          ? interviewReportPath(session.id)
                          : interviewPath(session.id),
                      )
                    }
                  >
                    <span>
                      <span className="block text-sm font-medium">{session.targetRole}</span>
                      <span className="type-caption text-muted">
                        {session.track.replace("_", " + ")} · {session.durationMinutes}m ·{" "}
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                    <Badge tone={session.status === "completed" ? "success" : "neutral"}>
                      {session.overall != null ? `${session.overall}` : session.status}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
