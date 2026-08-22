"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { apiGet, apiSend, ApiClientError } from "@/lib/api";
import type { Roadmap, RoadmapNodeProgress } from "@/types/roadmap";

const RoadmapOnboarding = React.lazy(
  () => import("@/views/RoadmapOnboarding/RoadmapOnboarding"),
);
const RoadmapCanvas = React.lazy(
  () => import("@/components/roadmap/RoadmapCanvas"),
);

type ViewState = "loading" | "onboarding" | "canvas";

export default function RoadmapPage() {
  const [view, setView] = useState<ViewState>("loading");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState<RoadmapNodeProgress[]>([]);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchRoadmap = useCallback(async () => {
    try {
      const data = await apiGet<{
        roadmap: Roadmap | null;
        progress?: RoadmapNodeProgress[];
      }>("/api/roadmap");
      if (data.roadmap) {
        setRoadmap(data.roadmap);
        setProgress(data.progress || []);
        setView("canvas");
      } else {
        setView("onboarding");
      }
    } catch {
      setView("onboarding");
    }
  }, []);

  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);

  const handleOnboardingComplete = useCallback(async () => {
    await fetchRoadmap();
  }, [fetchRoadmap]);

  const handleStatusChange = useCallback(
    async (nodeId: string, status: string) => {
      setStatusError(null);
      try {
        await apiSend("/api/roadmap/progress", "PUT", { nodeId, status });
        await fetchRoadmap();
      } catch (err) {
        const message =
          err instanceof ApiClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to update progress";
        setStatusError(message);
        // Clear toast after a few seconds
        window.setTimeout(() => setStatusError(null), 5000);
      }
    },
    [fetchRoadmap],
  );

  const handleRegenerate = useCallback(async () => {
    setStatusError(null);
    try {
      await apiSend("/api/roadmap/regenerate", "POST", {});
      await fetchRoadmap();
    } catch (err) {
      setStatusError(
        err instanceof Error ? err.message : "Failed to regenerate roadmap",
      );
    }
  }, [fetchRoadmap]);

  if (view === "loading") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 80px)",
          background: "var(--bg-main)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "2px solid #6c63ff",
            borderTopColor: "transparent",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (view === "onboarding") {
    return (
      <React.Suspense
        fallback={
          <div
            style={{
              minHeight: "calc(100vh - 80px)",
              background: "var(--bg-main)",
            }}
          />
        }
      >
        <RoadmapOnboarding onComplete={handleOnboardingComplete} />
      </React.Suspense>
    );
  }

  if (!roadmap) return null;

  return (
    <React.Suspense
      fallback={
        <div
          style={{
            minHeight: "calc(100vh - 80px)",
            background: "var(--bg-main)",
          }}
        />
      }
    >
      <ReactFlowProvider>
        {/* Break out of dashboard main padding so React Flow gets a real viewport */}
        <div
          style={{
            width: "calc(100% + 72px)",
            marginLeft: -36,
            marginRight: -36,
            marginTop: -28,
            marginBottom: -60,
            height: "calc(100vh - 72px)",
            position: "relative",
            background: "var(--bg-main)",
          }}
        >
          <RoadmapCanvas
            roadmap={roadmap}
            progress={progress}
            onStatusChange={handleStatusChange}
            onRegenerate={handleRegenerate}
            statusError={statusError}
          />
        </div>
      </ReactFlowProvider>
    </React.Suspense>
  );
}
