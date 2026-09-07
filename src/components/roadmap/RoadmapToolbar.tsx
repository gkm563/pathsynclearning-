"use client";

import React, { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Focus,
  Search,
  Filter,
  RefreshCw,
  Target,
  Map,
} from "lucide-react";
import { IconButton, Input } from "@/components/ui";
import { cn } from "@/lib/cn";

export default function RoadmapToolbar({
  onSearch,
  onFilter,
  onRegenerate,
  activeFilter,
  isFullscreen,
  onToggleFullscreen,
  showMinimap,
  onToggleMinimap,
  onFocusGoal,
}: {
  onSearch: (q: string) => void;
  onFilter: (f: string) => void;
  onRegenerate: () => void;
  activeFilter: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  showMinimap?: boolean;
  onToggleMinimap?: () => void;
  onFocusGoal?: () => void;
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const filters = [
    "All",
    "Skills",
    "Projects",
    "Milestones",
    "Completed",
    "In Progress",
    "Locked",
    "High Priority",
  ];

  return (
    <div
      className="absolute bottom-3 left-1/2 z-10 flex max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-1 rounded-full border border-line bg-surface/90 px-2 py-1.5 shadow-[var(--shadow-lg)] backdrop-blur-md lg:bottom-6 lg:gap-3 lg:px-4 lg:py-2"
    >
      <IconButton label="Zoom out" size="sm" className="hidden sm:inline-flex" onClick={() => zoomOut()}>
        <ZoomOut size={18} />
      </IconButton>
      <IconButton label="Zoom in" size="sm" className="hidden sm:inline-flex" onClick={() => zoomIn()}>
        <ZoomIn size={18} />
      </IconButton>
      <IconButton
        label="Fit view"
        size="sm"
        onClick={() =>
          fitView({
            duration: 600,
            padding: typeof window !== "undefined" && window.innerWidth < 1024 ? 0.45 : 0.35,
            maxZoom: typeof window !== "undefined" && window.innerWidth < 1024 ? 0.95 : 1,
          })
        }
      >
        <Focus size={18} />
      </IconButton>
      {onToggleFullscreen ? (
        <IconButton
          label={isFullscreen ? "Exit full screen" : "Full screen"}
          size="sm"
          className="hidden lg:inline-flex"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </IconButton>
      ) : null}
      {onToggleMinimap && (
        <IconButton
          label={showMinimap ? "Hide minimap" : "Show minimap"}
          size="sm"
          className={cn("hidden lg:inline-flex", showMinimap && "text-primary")}
          onClick={onToggleMinimap}
        >
          <Map size={18} />
        </IconButton>
      )}

      <div className="mx-0.5 hidden h-6 w-px bg-[var(--border-strong)] sm:block" />

      <div className="relative flex items-center">
        {searchOpen ? (
          <Input
            autoFocus
            onChange={(e) => onSearch(e.target.value)}
            onBlur={() => setSearchOpen(false)}
            placeholder="Search nodes..."
            className="h-9 min-h-0 w-[min(150px,40vw)] border-0 bg-transparent px-2 py-0 shadow-none focus-visible:shadow-none"
          />
        ) : (
          <IconButton label="Search nodes" size="sm" onClick={() => setSearchOpen(true)}>
            <Search size={18} />
          </IconButton>
        )}
      </div>

      <div className="relative">
        <IconButton
          label="Filter"
          size="sm"
          onClick={() => setFilterOpen((v) => !v)}
          className={cn(activeFilter !== "All" && "text-primary")}
        >
          <Filter size={18} />
        </IconButton>
        {filterOpen ? (
          <div className="absolute bottom-full left-1/2 mb-3 flex min-w-[150px] -translate-x-1/2 flex-col gap-1 rounded-[var(--radius-md)] border border-line bg-surface p-2 shadow-[var(--shadow-lg)]">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  onFilter(f);
                  setFilterOpen(false);
                }}
                className={cn(
                  "rounded-[var(--radius-sm)] px-3 py-2 text-left type-label transition-colors",
                  activeFilter === f
                    ? "bg-sunken text-primary"
                    : "text-ink hover:bg-sunken",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mx-0.5 hidden h-6 w-px bg-[var(--border-strong)] sm:block" />

      <IconButton
        label="Center on my goal"
        size="sm"
        className="text-success"
        onClick={() => onFocusGoal?.()}
      >
        <Target size={18} />
      </IconButton>

      <IconButton
        label="Regenerate roadmap"
        size="sm"
        className="hidden text-warning sm:inline-flex"
        onClick={() => {
          if (
            confirm(
              "Regenerate this roadmap? A new version becomes active — your other saved roadmaps stay available. Progress on the current active roadmap will not carry over.",
            )
          ) {
            onRegenerate();
          }
        }}
      >
        <RefreshCw size={18} />
      </IconButton>
    </div>
  );
}
