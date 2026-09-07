"use client";

import { Lock } from "lucide-react";
import { Button, Card, Segmented } from "@/components/ui";
import { cn } from "@/lib/cn";

export type PlanId = "free" | "premium";

/**
 * The in-product plan switcher both opportunity pages carry.
 *
 * Kept honest about what it is: a testing affordance that flips the simulated
 * plan through `usePlan()`. The copy states what the current plan changes so
 * the locked cards below never look like a rendering bug.
 */
export function PlanBanner({
  plan,
  onPlanChange,
  onSeePlans,
  lockedSummary,
}: {
  plan: string;
  onPlanChange: (next: PlanId) => void;
  onSeePlans?: () => void;
  /** What the free plan is currently hiding or locking, in plain words. */
  lockedSummary: string;
}) {
  const isPremium = plan === "premium";

  return (
    <Card className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="type-overline m-0 text-faint">Developer testing mode</p>
        <p className="type-label mt-1.5 mb-0 text-ink">
          {isPremium
            ? "Premium plan simulated — every track is unlocked."
            : "Free plan simulated — premium tracks are restricted."}
        </p>
        <p className="type-small mt-1 mb-0 text-muted">
          {isPremium
            ? "Switch back to Free to preview what a non-paying student sees."
            : lockedSummary}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Segmented<PlanId>
          ariaLabel="Simulated plan"
          value={isPremium ? "premium" : "free"}
          onChange={onPlanChange}
          items={[
            { id: "free", label: "Free" },
            { id: "premium", label: "Premium" },
          ]}
          className="[&_button]:min-h-11"
        />
        {!isPremium && onSeePlans ? (
          <Button variant="ghost" onClick={onSeePlans} className="min-h-11">
            See plans
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

/**
 * States exactly how many opportunities the current plan is withholding.
 *
 * Free-plan students never see premium OG tracks in the list; without this the
 * shorter list reads as missing data rather than as a gate.
 */
export function PremiumLockedNotice({
  count,
  onSeePlans,
  className,
}: {
  count: number;
  onSeePlans: () => void;
  className?: string;
}) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-lg)] border border-warning/30 bg-warning-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
        className,
      )}
    >
      <div className="flex min-w-0 gap-3">
        <span
          className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-warning shadow-[var(--shadow-xs)]"
          aria-hidden
        >
          <Lock size={16} />
        </span>
        <div className="min-w-0">
          <p className="type-label m-0 text-ink">
            {count} premium {count === 1 ? "track" : "tracks"} hidden on the
            Free plan
          </p>
          <p className="type-small mt-1 mb-0 text-muted">
            Premium OG tracks — closed cohorts, referral pipelines and live labs
            — unlock with PathEd Premium.
          </p>
        </div>
      </div>
      <Button onClick={onSeePlans} className="min-h-11 shrink-0">
        See premium plans
      </Button>
    </div>
  );
}
