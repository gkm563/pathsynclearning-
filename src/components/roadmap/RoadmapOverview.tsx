"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { RoadmapNode } from "@/types/roadmap";
import { computeRoadmapStats } from "@/lib/roadmap/stats";
import { Progress } from "@/components/ui";
import { cn } from "@/lib/cn";
import RoadmapSwitcher from "./RoadmapSwitcher";

export default function RoadmapOverview({
  roadmapId,
  roadmapTitle,
  targetCompany,
  nodes,
  progress,
  onSwitched,
  onCreateNew,
  onBusyChange,
}: {
  roadmapId: string;
  roadmapTitle: string;
  targetCompany?: string | null;
  nodes: RoadmapNode[];
  progress: Map<string, string>;
  onSwitched?: () => void | Promise<void>;
  onCreateNew?: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const stats = computeRoadmapStats(nodes, progress);
  const reduceMotion = useReducedMotion();
  const toggleEase = [0.32, 0.72, 0, 1] as const;

  if (!onSwitched || !onCreateNew) {
    return (
      <div className="absolute top-3 right-3 left-3 z-10 flex items-center rounded-[var(--radius-lg)] border border-line bg-surface/94 px-3 py-2 shadow-[var(--shadow-md)] backdrop-blur-md lg:top-5 lg:right-auto lg:left-1/2 lg:w-max lg:max-w-[calc(100%-32px)] lg:-translate-x-1/2 lg:px-[18px] lg:py-3">
        <Stats
          stats={stats}
          targetCompany={targetCompany}
          compact={false}
        />
      </div>
    );
  }

  return (
    <RoadmapSwitcher
      activeRoadmapId={roadmapId}
      activeTitle={roadmapTitle}
      onSwitched={onSwitched}
      onCreateNew={onCreateNew}
      onBusyChange={onBusyChange}
      embedded
    >
      {({ open, trigger, list }) => (
        <div
          className={cn(
            "absolute top-3 right-3 left-3 z-10 flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface/94 shadow-[var(--shadow-md)] backdrop-blur-md",
            "lg:top-5 lg:right-auto lg:left-1/2 lg:max-w-[calc(100%-32px)] lg:-translate-x-1/2",
            open ? "lg:w-[min(28rem,calc(100%-32px))]" : "lg:w-max",
          )}
        >
          <div className="flex min-w-0 items-center px-3 py-2.5 lg:px-[18px] lg:py-3">
            <div className="flex min-w-0 flex-1 items-center overflow-hidden">
              {trigger}
            </div>
            <AnimatePresence initial={false}>
              {!open ? (
                <motion.div
                  key="roadmap-stats"
                  initial={reduceMotion ? false : { opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={
                    reduceMotion
                      ? { width: 0, opacity: 0 }
                      : { opacity: 0, width: 0 }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.28,
                    ease: toggleEase,
                  }}
                  className="flex min-w-0 shrink-0 items-center overflow-hidden"
                >
                  <Divider />
                  <div className="flex min-w-0 shrink-0 items-center">
                    <Stats stats={stats} targetCompany={targetCompany} compact={false} />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          {list}
        </div>
      )}
    </RoadmapSwitcher>
  );
}

function Stats({
  stats,
  targetCompany,
  compact,
}: {
  stats: ReturnType<typeof computeRoadmapStats>;
  targetCompany?: string | null;
  compact: boolean;
}) {
  return (
    <>
      {targetCompany && !compact ? (
        <>
          <div className="hidden shrink-0 flex-col justify-center sm:flex">
            <span className="type-overline text-muted">Company</span>
            <div className="type-h4 mt-1 max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap text-ink">
              {targetCompany}
            </div>
          </div>
          <Divider className="hidden sm:block" />
        </>
      ) : null}

      <div className="flex min-w-0 shrink-0 flex-col justify-center">
        <span className="type-overline text-muted">Progress</span>
        <div className="mt-1 flex items-center gap-2.5">
          <span className="type-numeric min-w-8 text-base font-extrabold leading-none tracking-[-0.02em] text-success lg:min-w-10 lg:text-lg">
            {stats.completionPercent}%
          </span>
          <Progress
            value={stats.completionPercent}
            tone="success"
            size="sm"
            className="hidden w-[84px] shrink-0 sm:block"
          />
        </div>
      </div>

      {!compact ? (
        <>
          <Divider className="hidden md:block" />

          <div className="hidden shrink-0 flex-col justify-center md:flex">
            <span className="type-overline text-muted">Nodes</span>
            <div className="type-h4 mt-1 whitespace-nowrap">
              <span className="text-ink">{stats.completedNodes}</span>
              <span className="font-semibold text-muted"> / {stats.totalNodes}</span>
            </div>
          </div>

          <Divider className="hidden md:block" />

          <div className="hidden shrink-0 flex-col justify-center md:flex">
            <span className="type-overline text-muted">Time left</span>
            <div className="type-h4 mt-1 whitespace-nowrap text-ink">
              ~{stats.remainingHours}
              <span className="type-small font-semibold text-muted"> hrs</span>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "mx-3 h-8 w-px shrink-0 bg-[var(--border-light)] lg:mx-4 lg:h-9",
        className,
      )}
    />
  );
}
