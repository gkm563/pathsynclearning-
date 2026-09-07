"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactFlowProvider } from "@xyflow/react";
import { apiGet, apiSend, ApiClientError } from "@/lib/api";
import type { Roadmap, RoadmapNodeProgress } from "@/types/roadmap";
import { routes } from "@/lib/routes";
import { isRoadmapDeferred, setRoadmapDeferred } from "@/lib/roadmap/defer";
import RoadmapEmptyState from "@/components/roadmap/RoadmapEmptyState";
import { RoadmapSpinner } from "@/components/roadmap/RoadmapSpinner";
import { Button } from "@/components/ui";

const RoadmapOnboarding = React.lazy(
  () => import("@/views/RoadmapOnboarding/RoadmapOnboarding"),
);
const RoadmapCanvas = React.lazy(
  () => import("@/components/roadmap/RoadmapCanvas"),
);

type ViewState = "loading" | "onboarding" | "canvas" | "empty";

export default function RoadmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusNodeId = searchParams.get("node") || undefined;
  const intentNew = searchParams.get("intent") === "new";
  const [view, setView] = useState<ViewState>("loading");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState<RoadmapNodeProgress[]>([]);
  const [statusError, setStatusError] = useState<string | null>(null);
  /** True when user chose "Create new" while already having roadmaps. */
  const [creatingNew, setCreatingNew] = useState(intentNew);

  const fetchRoadmap = useCallback(async () => {
    try {
      const data = await apiGet<{
        roadmap: Roadmap | null;
        progress?: RoadmapNodeProgress[];
      }>("/api/roadmap");
      if (data.roadmap) {
        setRoadmap(data.roadmap);
        setProgress(data.progress || []);
        return data.roadmap;
      }
      setRoadmap(null);
      setProgress([]);
      return null;
    } catch {
      setRoadmap(null);
      setProgress([]);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const active = await fetchRoadmap();
      if (cancelled) return;
      if (creatingNew) setView("onboarding");
      else if (active) setView("canvas");
      else if (isRoadmapDeferred()) setView("empty");
      else setView("onboarding");
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchRoadmap, creatingNew]);

  const handleOnboardingComplete = useCallback(async () => {
    setCreatingNew(false);
    setRoadmapDeferred(false);
    if (intentNew) {
      router.replace(routes.app.roadmap);
    }
    const active = await fetchRoadmap();
    setView(active ? "canvas" : isRoadmapDeferred() ? "empty" : "onboarding");
  }, [fetchRoadmap, intentNew, router]);

  const handleCreateNew = useCallback(() => {
    setRoadmapDeferred(false);
    setCreatingNew(true);
    setView("onboarding");
  }, []);

  const handleCancelCreate = useCallback(() => {
    if (roadmap) {
      setCreatingNew(false);
      setView("canvas");
      if (intentNew) router.replace(routes.app.roadmap);
    }
  }, [roadmap, intentNew, router]);

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
    return <RoadmapSpinner label="Opening roadmap…" />;
  }

  if (view === "empty") {
    return <RoadmapEmptyState onCreate={handleCreateNew} />;
  }

  if (view === "onboarding") {
    return (
      <React.Suspense fallback={<RoadmapSpinner label="Opening roadmap…" />}>
        <div className="relative">
          {creatingNew && roadmap ? (
            <Button
              variant="secondary"
              className="sticky top-3 z-[5] mb-3"
              onClick={handleCancelCreate}
            >
              Back to current roadmap
            </Button>
          ) : null}
          <RoadmapOnboarding
            onComplete={handleOnboardingComplete}
          />
        </div>
      </React.Suspense>
    );
  }

  if (!roadmap) return null;

  return (
    <React.Suspense fallback={<RoadmapSpinner label="Opening roadmap…" />}>
      <ReactFlowProvider>
        <div
          className="relative overflow-hidden bg-canvas max-lg:-mx-4 max-lg:-mt-5 max-lg:-mb-[calc(var(--mobile-tabbar-height)+1rem+env(safe-area-inset-bottom,0px))] h-[calc(100dvh-3.5rem-var(--mobile-tabbar-height)-env(safe-area-inset-bottom,0px))] sm:h-[calc(100dvh-4rem-var(--mobile-tabbar-height)-env(safe-area-inset-bottom,0px))] lg:h-[calc(100dvh-5.5rem)] lg:-mx-8 lg:-mt-6 lg:mb-0"
        >
          <RoadmapNoPageScroll />
          <RoadmapCanvas
            roadmap={roadmap}
            progress={progress}
            onStatusChange={handleStatusChange}
            onRegenerate={handleRegenerate}
            onRefresh={async () => {
              const active = await fetchRoadmap();
              if (!active) {
                setCreatingNew(false);
                setView(isRoadmapDeferred() ? "empty" : "onboarding");
              }
            }}
            onCreateNew={handleCreateNew}
            statusError={statusError}
            initialFocusNodeId={focusNodeId}
          />
        </div>
      </ReactFlowProvider>
    </React.Suspense>
  );
}

function RoadmapNoPageScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);
  return null;
}
