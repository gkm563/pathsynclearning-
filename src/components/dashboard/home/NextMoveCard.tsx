"use client";

import Link from "next/link";
import { ArrowRight, PartyPopper, Route } from "lucide-react";
import type { ProgressNextAction } from "@/lib/progress/types";
import { Button, ErrorState, Skeleton } from "@/components/ui";
import { routes } from "@/lib/routes";
import { homeUi } from "./tokens";

type Props = {
  action: ProgressNextAction | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

const cta =
  "type-label inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * "What should I do next" — the single most prominent actionable element on
 * the page.
 *
 * It earns that emphasis by inverting onto the primary surface while every
 * other widget stays on `bg-surface`; no gradient or shadow stack is needed to
 * make one filled panel the obvious target.
 */
export function NextMoveCard({ action, loading, error, onRetry }: Props) {
  if (loading && !action) {
    return (
      <div className={homeUi.card} aria-busy>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-4 h-8 w-3/4" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-auto h-11 w-40" />
      </div>
    );
  }

  if (error && !action) {
    return (
      <ErrorState
        compact
        title="Couldn’t work out your next step"
        description="Your next action needs your progress data, which didn’t load."
        detail={error}
        action={
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    );
  }

  const caughtUp = action?.kind === "caught_up";
  const href =
    action?.href || (caughtUp ? routes.app.roadmap : routes.app.challenges);
  const remaining = action?.remainingTasks ?? 0;

  return (
    <article className="flex min-w-0 flex-1 flex-col justify-between gap-6 rounded-[var(--radius-lg)] bg-primary p-5 text-on-primary shadow-[var(--shadow-sm)] sm:p-6">
      <div className="min-w-0">
        <p className="type-overline m-0 flex items-center gap-2 text-on-primary/75">
          {caughtUp ? <PartyPopper size={14} aria-hidden /> : null}
          {caughtUp ? "All caught up" : "Do this next"}
        </p>

        <h3 className="type-h2 mt-2.5 mb-0 text-on-primary">
          {action?.title || "Continue your path"}
        </h3>

        <p className="type-body mt-2 mb-0 text-on-primary/80">
          {action?.subtitle ||
            "Pick up where you left off on your roadmap or today’s challenges."}
        </p>

        {remaining > 0 ? (
          <p
            className="type-small type-numeric mt-3 mb-0 text-on-primary/75"
            aria-live="polite"
          >
            {remaining} {remaining === 1 ? "task" : "tasks"} left in this track
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Link
          href={href}
          className={`${cta} bg-surface text-primary hover:bg-raised`}
        >
          {caughtUp ? "Browse challenges" : "Continue"}
          <ArrowRight size={16} aria-hidden />
        </Link>
        <Link
          href={routes.app.roadmap}
          className={`${cta} border border-on-primary/35 text-on-primary hover:bg-on-primary/10`}
        >
          <Route size={15} aria-hidden />
          Open roadmap
        </Link>
      </div>

      {error ? (
        <p className="type-caption m-0 text-on-primary/75" role="status">
          Showing your last known step — refresh didn’t reach the server.
        </p>
      ) : null}
    </article>
  );
}
