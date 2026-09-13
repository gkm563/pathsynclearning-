"use client";

import { useRouter } from "next/navigation";
import { Mic, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { interviewFinalStartPath } from "@/lib/routes";
import type { RoadmapCertificationStatus } from "@/types/roadmap";

export default function FinalInterviewGate({
  roadmapId,
  status,
  certifiedAt,
}: {
  roadmapId: string;
  status?: RoadmapCertificationStatus | string | null;
  certifiedAt?: string | null;
}) {
  const router = useRouter();
  if (certifiedAt || status === "certified") return null;
  if (status !== "pending_interview") return null;

  return (
    <div className="absolute bottom-20 left-1/2 z-30 w-[min(440px,calc(100%-32px))] -translate-x-1/2 rounded-[var(--radius-lg)] border border-primary bg-surface/96 p-4 shadow-[var(--shadow-lg)] backdrop-blur-md lg:bottom-24">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
          <ShieldCheck size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="type-overline m-0 text-primary">Final interview required</p>
          <p className="mt-1 mb-3 text-sm leading-relaxed text-ink">
            Every node is done. Pass the certification interview to mark this roadmap complete.
          </p>
          <Button
            className="w-full sm:w-auto"
            onClick={() => router.push(interviewFinalStartPath(roadmapId))}
          >
            <Mic size={16} /> Start final interview
          </Button>
        </div>
      </div>
    </div>
  );
}
