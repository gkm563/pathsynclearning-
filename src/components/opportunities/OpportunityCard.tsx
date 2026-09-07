"use client";

import type { ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatDeadline, primaryTech } from "./helpers";
import { OpportunityActionControl, type OpportunityAction } from "./OpportunityAction";
import type { Opportunity } from "./types";

/**
 * The single opportunity card, shared by the events and OG catalogues.
 *
 * Renders as an `<li>`: every caller shows these in a `<ul>` grid, so the list
 * semantics belong here rather than being re-derived per page.
 */
export function OpportunityCard({
  opportunity,
  action,
  onDetails,
  locked = false,
}: {
  opportunity: Opportunity;
  action: OpportunityAction;
  onDetails: (opportunity: Opportunity) => void;
  /** Dims the cover and states that premium is required. */
  locked?: boolean;
}) {
  return (
    <li
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-xs)]",
        "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:transition-none",
        "hover:border-line-strong hover:shadow-[var(--shadow-md)]",
      )}
    >
      {/* Fixed aspect ratio reserves the space before the cover loads, so the
          grid doesn't reflow as images arrive. */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-sunken">
        <img
          src={opportunity.coverImage}
          alt={opportunity.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />

        {opportunity.tier ? (
          <div className="absolute top-2.5 right-2.5">
            <Badge
              tone={opportunity.tier === "premium" ? "accent" : "success"}
              className="bg-surface"
            >
              {opportunity.tier}
            </Badge>
          </div>
        ) : null}

        {locked ? (
          <div className="absolute inset-0 flex items-center justify-center bg-inverse/55 px-3">
            <span className="type-caption inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 font-semibold text-ink shadow-[var(--shadow-sm)]">
              <Lock size={12} aria-hidden />
              Premium only
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-4 sm:p-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="type-caption min-w-0 truncate rounded-full border border-line bg-sunken px-2.5 py-0.5 text-muted">
            {opportunity.organizer}
          </span>
          {opportunity.parthed_og ? (
            <Badge tone="accent" className="gap-1">
              <Sparkles size={10} aria-hidden />
              PathEd OG
            </Badge>
          ) : (
            <span className="type-caption min-w-0 truncate text-faint">
              {opportunity.mode}
            </span>
          )}
        </div>

        <h3 className="type-h4 m-0 line-clamp-2 text-ink">
          {opportunity.title}
        </h3>

        <p className="type-small m-0 line-clamp-3 text-muted">
          {opportunity.desc}
        </p>

        <dl className="mt-auto grid gap-1.5 border-t border-line pt-3">
          <MetaRow label="Reward">
            <span className="font-semibold text-ink">
              {opportunity.prizePool}
            </span>
          </MetaRow>
          <MetaRow label="Deadline">
            <span className="type-numeric font-semibold text-accent">
              {formatDeadline(opportunity.deadline)}
            </span>
          </MetaRow>
          <MetaRow label="Prerequisite">
            <code className="type-code text-primary">
              {primaryTech(opportunity.tech)}
            </code>
          </MetaRow>
        </dl>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3 sm:px-5">
        <Button
          variant="secondary"
          className="min-h-11 flex-1 basis-28"
          onClick={() => onDetails(opportunity)}
        >
          Details
        </Button>
        <OpportunityActionControl
          action={action}
          opportunity={opportunity}
          className="min-h-11 flex-[1.4] basis-36"
        />
      </div>
    </li>
  );
}

/**
 * Card grid. One column on phones, two from `sm`, three from `xl` — the extra
 * breakpoint is because the portal sidebar eats ~16rem of the viewport, so
 * three columns only become comfortable well past `lg`.
 */
export function OpportunityGrid({
  children,
  ariaLabel,
}: {
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <ul
      aria-label={ariaLabel}
      className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3"
    >
      {children}
    </ul>
  );
}

function MetaRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3">
      <dt className="type-caption shrink-0 text-muted">{label}</dt>
      <dd className="type-small m-0 min-w-0 text-right break-words">
        {children}
      </dd>
    </div>
  );
}
