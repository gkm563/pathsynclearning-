"use client";

import { RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui";

export function SaveBar({
  dirty,
  saving,
  status,
  onSave,
  onDiscard,
}: {
  dirty: boolean;
  saving: boolean;
  status?: string;
  onSave: () => void;
  onDiscard: () => void;
}) {
  if (!dirty && !saving) return null;

  return (
    <div
      role="region"
      aria-label="Unsaved changes"
      className="sticky bottom-[calc(var(--mobile-tabbar-height)+0.75rem+env(safe-area-inset-bottom,0px))] z-[var(--z-sticky)] mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-primary-border bg-surface px-4 py-3.5 shadow-[var(--shadow-md)] sm:px-5 lg:bottom-4"
    >
      <div className="min-w-0">
        <p className="type-label m-0 text-ink">Unsaved changes</p>
        <p className="type-caption mt-0.5 mb-0 text-muted">
          {status || "Save to sync your profile and preferences."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={saving} onClick={onDiscard}>
          <RotateCcw size={15} aria-hidden />
          Discard
        </Button>
        <Button loading={saving} disabled={!dirty} onClick={onSave}>
          <Save size={15} aria-hidden />
          Save changes
        </Button>
      </div>
    </div>
  );
}
