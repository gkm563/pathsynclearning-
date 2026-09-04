"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  ProgressSkeleton,
  ProgressStats,
} from "@/components/progress";
import { Button, EmptyState } from "@/components/ui/primitives";

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

  // Refresh when the tab becomes visible again (after completing assessments)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void load(range);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load, range]);

  if (loading && !data) {
    return (
      <div style={{ padding: "8px 4px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <ProgressSkeleton />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{ padding: "8px 4px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <EmptyState
          title="Unable to load your progress."
          description="Please try again. If the problem continues, refresh the page."
          action={
            <Button onClick={() => void load(range)}>Try Again</Button>
          }
        />
      </div>
    );
  }

  if (!data) return null;

  const emptyJourney = data.summary.totalTasks === 0;

  return (
    <div style={{ padding: "8px 4px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <ProgressHeader range={range} onRangeChange={setRange} />

      {emptyJourney ? (
        <div style={{ marginTop: 20 }}>
          <EmptyState
            title="No progress yet"
            description="Complete your first assessment to start building your progress history."
            action={
              <Button onClick={() => router.push(routes.app.challenges)}>
                Start Assessment →
              </Button>
            }
          />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            marginTop: 20,
          }}
        >
          <OverallProgressCard summary={data.summary} />
          <ProgressStats summary={data.summary} />
          <AssessmentProgress assessments={data.assessments} />

          <div
            className="progress-mid-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.3fr 0.7fr",
              gap: 16,
            }}
          >
            <PerformanceChart points={data.performance} />
            <MilestoneTracker milestones={data.milestones} />
          </div>

          <ActivityTimeline activity={data.activity} />
          <NextActionCard action={data.nextAction} />
        </div>
      )}

      {error ? (
        <p
          role="alert"
          style={{
            marginTop: 16,
            color: "#ef4444",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          {error}{" "}
          <button
            type="button"
            onClick={() => void load(range)}
            style={{
              border: "none",
              background: "transparent",
              color: "#6c63ff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </p>
      ) : null}

      <style>{`
        @keyframes progressShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 900px) {
          .progress-mid-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .progress-page * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
