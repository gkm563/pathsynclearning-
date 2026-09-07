"use client";

import { Download, Settings2 } from "lucide-react";
import { Button, PageHeader } from "@/components/ui";

export function MemoryLaneHeader({
  onOpenSettings,
  onExport,
}: {
  onOpenSettings: () => void;
  onExport: () => void;
}) {
  return (
    <PageHeader
      eyebrow="Your journey"
      title="Memory Lane"
      description="Three lanes for everything you've done — roadmap, challenges, and the rest of your PathEd story."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={onExport}>
            <Download size={15} aria-hidden />
            Export
          </Button>
          <Button variant="secondary" onClick={onOpenSettings}>
            <Settings2 size={15} aria-hidden />
            Settings
          </Button>
        </div>
      }
    />
  );
}
