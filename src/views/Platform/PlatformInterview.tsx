"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  Clock,
  LoaderCircle,
  Mic,
  Route,
  Sparkles,
  Target,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  Input,
  Select,
  Skeleton,
  useToast,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { apiGet, apiSend } from "@/lib/api";
import {
  formatInterviewRun,
  interviewRanSeconds,
  interviewScopeLabel,
} from "@/lib/ai/interview-code";
import { interviewPath, interviewReportPath } from "@/lib/routes";
import type {
  InterviewDifficulty,
  InterviewDurationMinutes,
  InterviewSessionSummary,
  InterviewStyle,
  InterviewTrack,
} from "@/lib/ai/interview-types";

type ListResponse = {
  sessions: InterviewSessionSummary[];
  livekitConfigured: boolean;
  defaults?: {
    targetRole?: string;
    targetCompany?: string;
  };
};

type RoadmapOption = {
  id: string;
  title: string;
  targetRole: string;
  targetCompany: string | null;
  isActive: boolean;
  completedNodes?: number;
  studiedNodes?: number;
  interviewTrack?: InterviewTrack;
  interviewDifficulty?: InterviewDifficulty;
  interviewFocus?: string;
};

const TRACKS: Array<{ id: InterviewTrack; label: string; hint: string }> = [
  {
    id: "dsa_behavioral",
    label: "DSA + behavioral",
    hint: "Closest to a real SDE loop",
  },
  { id: "dsa", label: "DSA only", hint: "Talk through, then code" },
  { id: "behavioral", label: "Behavioral", hint: "Projects and ownership" },
];

const LENGTHS: InterviewDurationMinutes[] = [5, 10, 15, 20, 30];

const TRACK_LABEL: Record<InterviewTrack, string> = {
  dsa_behavioral: "DSA + behavioral",
  dsa: "DSA only",
  behavioral: "Behavioral",
};

const DIFF_LABEL: Record<InterviewDifficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const STYLE_LABEL: Record<InterviewStyle, string> = {
  supportive: "Supportive",
  balanced: "Balanced",
  strict: "Strict",
};

export default function PlatformInterview() {
  const router = useRouter();
  const toast = useToast();
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState<InterviewTrack>("dsa_behavioral");
  const [minutes, setMinutes] = useState<InterviewDurationMinutes>(20);
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("medium");
  const [style, setStyle] = useState<InterviewStyle>("balanced");
  const [focus, setFocus] = useState("");
  const [roadmaps, setRoadmaps] = useState<RoadmapOption[]>([]);
  const [roadmapId, setRoadmapId] = useState("");
  const [switching, setSwitching] = useState(false);
  const [starting, setStarting] = useState(false);
  const [purposeFinal, setPurposeFinal] = useState(false);

  const applyRoadmapFields = (
    selected: RoadmapOption,
    defaults?: ListResponse["defaults"],
  ) => {
    setRole(selected.targetRole || defaults?.targetRole || "");
    setCompany(selected.targetCompany || defaults?.targetCompany || "");
    setTrack(selected.interviewTrack || "dsa_behavioral");
    setDifficulty(selected.interviewDifficulty || "medium");
    setFocus(selected.interviewFocus || "");
    setStyle("balanced");
  };

  useEffect(() => {
    let alive = true;
    const params = new URLSearchParams(window.location.search);
    const isFinal = params.get("purpose") === "roadmap_final";
    const queryId = params.get("roadmapId") || "";
    if (isFinal) {
      setPurposeFinal(true);
      if (queryId) setRoadmapId(queryId);
      setMinutes(20);
    }
    Promise.all([
      apiGet<ListResponse>("/api/ai/interview"),
      apiGet<{ roadmaps: RoadmapOption[] }>("/api/roadmap/list").catch(() => ({
        roadmaps: [] as RoadmapOption[],
      })),
    ])
      .then(([res, maps]) => {
        if (!alive) return;
        setData(res);
        const list = maps.roadmaps || [];
        setRoadmaps(list);
        if (isFinal) {
          const id = queryId || list.find((item) => item.isActive)?.id || "";
          const selected = list.find((item) => item.id === id);
          if (selected) {
            setRoadmapId(selected.id);
            applyRoadmapFields(selected, res.defaults);
          }
        }
      })
      .catch((err: Error) => {
        if (alive) setError(err.message);
      });
    return () => {
      alive = false;
    };
  }, []);

  const applyRoadmap = async (id: string) => {
    setRoadmapId(id);
    if (!id) {
      setRole("");
      setCompany("");
      setFocus("");
      return;
    }
    setSwitching(true);
    try {
      const maps = await apiGet<{ roadmaps: RoadmapOption[] }>("/api/roadmap/list");
      const list = maps.roadmaps || [];
      setRoadmaps(list);
      const selected = list.find((item) => item.id === id);
      if (!selected) return;
      applyRoadmapFields(selected);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load that roadmap");
    } finally {
      setSwitching(false);
    }
  };

  const fromRoadmap = Boolean(roadmapId);
  const selectedRoadmap = roadmaps.find((item) => item.id === roadmapId);
  const completedOnRoadmap = selectedRoadmap?.completedNodes ?? selectedRoadmap?.studiedNodes ?? 0;
  const noStudiedNodes = fromRoadmap && completedOnRoadmap < 1;
  const startBlocked = purposeFinal ? switching || !roadmapId : noStudiedNodes || switching;

  const start = async () => {
    if (switching) return;
    if (!purposeFinal && noStudiedNodes) {
      toast.error("Study at least one node on this roadmap before starting.");
      return;
    }
    setStarting(true);
    try {
      const res = await apiSend<{ session: { id: string } }>(
        "/api/ai/interview/sessions",
        "POST",
        {
          track,
          mode: "voice",
          durationMinutes: purposeFinal ? (minutes === 30 ? 30 : 20) : minutes,
          targetRole: role.trim() || undefined,
          targetCompany: company.trim() || null,
          difficulty,
          style,
          focus: focus.trim(),
          roadmapId: roadmapId || null,
          purpose: purposeFinal ? "roadmap_final" : "practice",
        },
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
      <div className="flex flex-col gap-4">
        <LobbyHeader />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100dvh-9rem)] lg:overflow-hidden">
      <LobbyHeader />

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)] lg:items-stretch">
        <Card
          padded={false}
          className="flex min-h-0 flex-col overflow-hidden max-lg:max-h-[min(82vh,calc(100dvh-11rem))]"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border-light)] px-5 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="type-overline m-0 text-[var(--primary)]">
                {purposeFinal ? "Certification" : "New mock"}
              </p>
              <h2 className="mt-0.5 mb-0 text-base font-semibold tracking-[-0.03em] sm:text-lg">
                {purposeFinal ? "Final interview for your roadmap" : "Set up, then begin"}
              </h2>
            </div>
            <Badge tone="accent">Voice</Badge>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            {purposeFinal ? (
              <section className="rounded-[var(--radius-md)] border border-primary bg-primary-soft p-4">
                <p className="m-0 text-sm leading-relaxed text-ink">
                  This round certifies{" "}
                  <strong>{selectedRoadmap?.title || "your roadmap"}</strong>
                  {role ? ` for ${role}` : ""}. Pass it to complete the path. Weak topics
                  reopen with new materials if you miss the bar.
                </p>
              </section>
            ) : null}
            {!purposeFinal ? (
            <>
            <section className="grid gap-2">
              <Field
                label="Roadmap"
                hint={
                  roadmaps.length
                    ? noStudiedNodes
                      ? "No completed nodes yet — finish a node, or pick None"
                      : fromRoadmap
                        ? "Questions come only from nodes you already completed"
                        : "Use a roadmap, or pick None to customize"
                    : "Create a roadmap first to select one here"
                }
              >
                <Select
                  value={roadmapId}
                  onChange={(e) => void applyRoadmap(e.target.value)}
                  disabled={!roadmaps.length || switching}
                >
                  {roadmaps.length === 0 ? (
                    <option value="">No roadmaps yet</option>
                  ) : (
                    <>
                      <option value="">None — custom role</option>
                      {roadmaps.map((item) => {
                        const studied = item.completedNodes ?? item.studiedNodes ?? 0;
                        const hint = [
                          item.targetRole,
                          `${studied} studied`,
                          item.isActive ? "Active" : "",
                        ]
                          .filter(Boolean)
                          .join(" · ");
                        return (
                          <option key={item.id} value={item.id} data-hint={hint}>
                            {item.title}
                          </option>
                        );
                      })}
                    </>
                  )}
                </Select>
                {switching ? (
                  <p className="type-caption m-0 mt-1 inline-flex items-center gap-1.5 text-muted">
                    <LoaderCircle size={14} className="animate-spin" aria-hidden />
                    Loading roadmap…
                  </p>
                ) : null}
              </Field>
            </section>

            {fromRoadmap ? (
              <div className="rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-alt)] px-3.5 py-3">
                <p className="type-overline m-0 mb-2.5 text-muted">Locked to this roadmap</p>
                <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                  <SummaryRow icon={Route} label={selectedRoadmap?.title || "Roadmap"} />
                  <SummaryRow icon={Briefcase} label={role || "Role not set"} />
                  <SummaryRow icon={Building2} label={company || "No company"} />
                  <SummaryRow
                    icon={Target}
                    label={`${TRACK_LABEL[track]} · ${DIFF_LABEL[difficulty]} · ${STYLE_LABEL[style]}`}
                  />
                  {focus ? (
                    <div className="sm:col-span-2">
                      <SummaryRow icon={Sparkles} label={focus} />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <section className="grid gap-2">
                  <p className="type-overline m-0 text-muted">Format</p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {TRACKS.map((item) => {
                      const selected = track === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTrack(item.id)}
                          className={cn(
                            "rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors",
                            selected
                              ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                              : "border-[var(--border-light)] hover:bg-[var(--bg-alt)]",
                          )}
                        >
                          <span className="block text-sm font-semibold">{item.label}</span>
                          <span className="type-caption mt-0.5 block text-muted">{item.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Role">
                    <Input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Software Engineer intern"
                      maxLength={80}
                    />
                  </Field>
                  <Field label="Company" hint="Optional">
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Google, Stripe, startup…"
                      maxLength={80}
                    />
                  </Field>
                  <Field label="Difficulty">
                    <Select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}
                    >
                      <option value="easy">Easy — fundamentals</option>
                      <option value="medium">Medium — typical loop</option>
                      <option value="hard">Hard — deeper probes</option>
                    </Select>
                  </Field>
                  <Field label="Interviewer style">
                    <Select
                      value={style}
                      onChange={(e) => setStyle(e.target.value as InterviewStyle)}
                    >
                      <option value="supportive">Supportive</option>
                      <option value="balanced">Balanced</option>
                      <option value="strict">Strict</option>
                    </Select>
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Focus" hint="Optional topic to stay on">
                      <Input
                        value={focus}
                        onChange={(e) => setFocus(e.target.value)}
                        placeholder="Graphs, rate limiter, system design, leadership…"
                        maxLength={120}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}
            </>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-[var(--border-light)] bg-[var(--bg-card)] px-5 py-3.5 sm:px-6">
            {!purposeFinal && noStudiedNodes ? (
              <p className="type-caption mt-0 mb-3 text-[var(--error)]">
                This roadmap has no completed nodes. Finish a node, or choose None to customize.
              </p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="type-overline m-0 mb-2 text-muted">Length</p>
                <div className="flex flex-wrap gap-1.5">
                  {(purposeFinal ? ([20, 30] as InterviewDurationMinutes[]) : LENGTHS).map((value) => {
                    const selected = minutes === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMinutes(value)}
                        className={cn(
                          "inline-flex h-8 min-w-11 items-center justify-center rounded-full border px-2.5 text-sm font-medium transition-colors",
                          selected
                            ? "border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]"
                            : "border-[var(--border-light)] text-[var(--text-main)] hover:bg-[var(--bg-alt)]",
                        )}
                      >
                        {value}m
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="type-caption hidden text-muted xl:inline">
                  {TRACK_LABEL[track]} · {DIFF_LABEL[difficulty]}
                </span>
                <Button
                  onClick={() => void start()}
                  loading={starting || switching}
                  disabled={startBlocked}
                >
                  <Mic size={16} aria-hidden />
                  {purposeFinal ? "Start certification interview" : "Begin interview"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card
          padded={false}
          className="flex min-h-0 flex-col overflow-hidden max-lg:max-h-[min(70vh,28rem)]"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-[var(--border-light)] px-5 py-3 sm:px-6">
            <Sparkles size={16} className="text-[var(--primary)]" aria-hidden />
            <h2 className="m-0 text-base font-semibold tracking-[-0.03em] sm:text-lg">
              Past mocks
            </h2>
            {data.sessions.length ? (
              <Badge tone="neutral">{data.sessions.length}</Badge>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5">
            {data.sessions.length === 0 ? (
              <EmptyState
                compact
                title="No interviews yet"
                description="Run a mock to get a scored report and practice links."
              />
            ) : (
              <ul className="m-0 grid list-none gap-1.5 p-0">
                {data.sessions.map((session) => (
                  <li key={session.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-alt)]"
                      onClick={() =>
                        router.push(
                          session.status === "completed"
                            ? interviewReportPath(session.id)
                            : interviewPath(session.id),
                        )
                      }
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {interviewScopeLabel(session.targetRole, session.targetCompany)}
                        </span>
                        <span className="type-caption inline-flex items-center gap-1.5 text-muted">
                          <Clock size={12} aria-hidden />
                          {TRACK_LABEL[session.track] || session.track.replace("_", " + ")} ·{" "}
                          {session.status === "completed" || session.endedAt
                            ? `Ran ${formatInterviewRun(interviewRanSeconds(session.startedAt, session.endedAt))}`
                            : `In progress · ${formatInterviewRun(interviewRanSeconds(session.startedAt))}`}
                          {` · ${new Date(session.createdAt).toLocaleDateString()}`}
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
          </div>
        </Card>
      </div>
    </div>
  );
}

function LobbyHeader() {
  return (
    <header className="shrink-0">
      <p className="type-overline m-0 text-[var(--primary)]">Career</p>
      <h1 className="mt-1 mb-0 text-[clamp(1.5rem,2.4vw,1.85rem)] font-semibold tracking-[-0.038em] text-[var(--text-main)]">
        AI Interview
      </h1>
      <p className="mt-1 mb-0 max-w-xl text-sm text-[var(--text-muted)]">
        Voice mock with an optional coding round, then a scored report.
      </p>
    </header>
  );
}

function SummaryRow({
  icon: Icon,
  label,
}: {
  icon: typeof Route;
  label: string;
}) {
  return (
    <p className="m-0 flex min-w-0 items-start gap-2 text-sm text-[var(--text-main)]">
      <Icon size={14} className="mt-0.5 shrink-0 text-[var(--primary)]" aria-hidden />
      <span className="min-w-0 leading-snug">{label}</span>
    </p>
  );
}
