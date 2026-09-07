"use client";

import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export function RoadmapSpinner({
  label = "Loading roadmap…",
  overlay = false,
}: {
  label?: string;
  overlay?: boolean;
}) {
  const body = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3"
    >
      <LoaderCircle
        size={28}
        aria-hidden
        className="animate-spin text-primary motion-reduce:animate-none"
      />
      <p className="type-small m-0 text-muted">{label}</p>
    </div>
  );

  if (!overlay) {
    return (
      <div className="grid min-h-[50vh] w-full place-items-center px-6">
        {body}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 z-30 grid place-items-center",
        "bg-canvas/72 backdrop-blur-[2px]",
      )}
    >
      {body}
    </div>
  );
}
