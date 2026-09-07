"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ProgressNextAction } from "@/lib/progress/types";
import { Button, Card } from "@/components/ui";
import { routes } from "@/lib/routes";

export function NextActionCard({ action }: { action: ProgressNextAction }) {
  const router = useRouter();
  const caughtUp = action.kind === "caught_up";

  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 bg-primary-soft">
      <div className="min-w-0 flex-1">
        <p className="type-caption m-0 font-semibold tracking-[0.08em] text-primary uppercase">
          {caughtUp ? "All done" : "Continue where you left off"}
        </p>
        <h2 className="type-h3 mt-1.5 mb-0 text-ink">{action.title}</h2>
        <p className="type-small mt-1.5 mb-0 max-w-prose text-muted">
          {action.subtitle}
        </p>
      </div>

      <Button
        className="min-h-11"
        onClick={() => router.push(action.href || routes.app.challenges)}
      >
        {caughtUp ? "Browse challenges" : "Continue"}
        <ArrowRight size={16} aria-hidden />
      </Button>
    </Card>
  );
}
