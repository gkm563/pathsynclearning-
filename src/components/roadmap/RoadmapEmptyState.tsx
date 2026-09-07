"use client";

import { Map } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";

export default function RoadmapEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <EmptyState
        icon={<Map size={20} aria-hidden />}
        title="No roadmap yet"
        description="You skipped this for later. Create a company-specific or general roadmap whenever you are ready."
        action={<Button onClick={onCreate}>Create a roadmap</Button>}
      />
    </div>
  );
}
