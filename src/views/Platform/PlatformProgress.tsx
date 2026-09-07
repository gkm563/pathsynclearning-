"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag } from "lucide-react";
import {
  Button,
  EmptyState,
  ErrorState,
  PageSkeleton,
} from "@/components/ui";
import { apiGet } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { ProgressPayload, ProgressRange } from "@/lib/progress/types";
import {
  ActivityTimeline,
  AssessmentProgress,
  MilestoneTracker,
  NextActionCard,
  OverallProgressCard,
  PerformanceChart,
  ProgressHeader,
  ProgressStats,
} from "@/components/progress";

export default function PlatformProgress() {
  const router = useRouter();
  const [range, setRange] = useState<ProgressRange>("all");
  const [data, setData] = useState<ProgressPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (selected: ProgressRange) => {
    setLoading(true);
    setError("");
    try {
      const payload = await apiGet<ProgressPayload>(
        `/api/me/progress?range=${selected}`,
      );
      setData(payload);
    } catch (e) {
      setData(null);
      setError(
        e instanceof Error ? e.message : "Unable to load your progress.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(range);
  }, [load, range]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void load(range);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load, range]);

  if (loading && !data) {
    return <PageSkeleton stats variant="cards" />;
  }

  if (error && !data) {
    return (
      <>
        <ProgressHeader range={range} onRangeChange={setRange} />
        <ErrorState
          title="Unable to load your progress"
          description="Check your connection and try again. If this keeps happening, refresh the page."
          detail={error}
          action={
            <Button variant="secondary" onClick={() => void load(range)}>
              Try again
            </Button>
          }
        />
      </>
    );
  }

  if (!data) return null;

  const emptyJourney = data.summary.totalTasks === 0;

  return (
    <>
      <ProgressHeader range={range} onRangeChange={setRange} />

      {emptyJourney ? (
        <EmptyState
          icon={<Flag size={20} aria-hidden />}
          title="No progress yet"
          description="Complete your first assessment to start building a history you can actually use — scores, streaks and next steps will land here."
          action={
            <Button onClick={() => router.push(routes.app.challenges)}>
              Start an assessment
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-4 sm:gap-5">
          <OverallProgressCard summary={data.summary} />
          <ProgressStats summary={data.summary} />
          <AssessmentProgress assessments={data.assessments} />

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <PerformanceChart points={data.performance} />
            <MilestoneTracker milestones={data.milestones} />
          </div>

          <ActivityTimeline activity={data.activity} />
          <NextActionCard action={data.nextAction} />
        </div>
      )}

      {error ? (
        <p role="alert" className="type-small mt-4 mb-0 text-center text-danger">
          {error}{" "}
          <button
            type="button"
            onClick={() => void load(range)}
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Try again
          </button>
        </p>
      ) : null}
    </>
  );
}
