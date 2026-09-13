"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass } from "lucide-react";
import { apiGet } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { OnboardingStatus } from "@/lib/onboarding/types";
import { Button, Card } from "@/components/ui";

/** Shown when a student has not finished or skipped optional setup. */
export function OnboardingNudge() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<OnboardingStatus>("/api/me/onboarding")
      .then((status) => {
        if (!cancelled && !status.completed) setVisible(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!visible) return null;

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-line bg-sunken text-primary">
          <Compass size={18} aria-hidden />
        </span>
        <div>
          <p className="type-h4 m-0 text-ink">Finish optional setup</p>
          <p className="type-small mt-1 mb-0 text-muted">
            Add basics, pick a career (or let us help), then generate a roadmap or skip.
          </p>
        </div>
      </div>
      <Button type="button" onClick={() => router.push(routes.app.onboarding)}>
        Continue setup
      </Button>
    </Card>
  );
}
