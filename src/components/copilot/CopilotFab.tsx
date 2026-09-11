"use client";

import { Sparkles } from "lucide-react";
import { IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useCopilot } from "./CopilotProvider";

export function CopilotFab() {
  const { open, toggle } = useCopilot();
  if (open) return null;

  return (
    <IconButton
      label="Open PathED Copilot"
      variant="primary"
      size="lg"
      onClick={toggle}
      className={cn(
        "fixed right-4 rounded-full shadow-[var(--shadow-lg)] lg:right-6",
        "bottom-[calc(var(--mobile-tabbar-height)+1rem+env(safe-area-inset-bottom,0px))] lg:bottom-6",
      )}
      style={{ zIndex: "var(--z-header)" }}
    >
      <Sparkles size={18} aria-hidden />
    </IconButton>
  );
}
