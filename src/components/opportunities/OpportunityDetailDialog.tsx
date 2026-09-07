"use client";

import { Sparkles } from "lucide-react";
import { Badge, Button, DescriptionList, Dialog } from "@/components/ui";
import { formatDeadline, techTags } from "./helpers";
import { OpportunityActionControl, type OpportunityAction } from "./OpportunityAction";
import type { Opportunity } from "./types";

/**
 * Full profile for one opportunity. Presents as a bottom sheet on phones (see
 * `Dialog`), which is why the long metadata list is a `DescriptionList` rather
 * than a two-column grid that would clip at 360px.
 */
export function OpportunityDetailDialog({
  opportunity,
  action,
  onClose,
  categoryLabel,
  locked = false,
}: {
  opportunity: Opportunity | null;
  action: OpportunityAction;
  onClose: () => void;
  /** Human label for the category; falls back to the raw id. */
  categoryLabel?: string;
  locked?: boolean;
}) {
  return (
    <Dialog
      open={opportunity !== null}
      onClose={onClose}
      title="Opportunity profile"
      description={opportunity ? `Organised by ${opportunity.organizer}` : undefined}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="min-h-11">
            Close
          </Button>
          {opportunity ? (
            <OpportunityActionControl
              action={action}
              opportunity={opportunity}
              className="min-h-11"
            />
          ) : null}
        </>
      }
    >
      {opportunity ? (
        <div className="flex flex-col gap-5 pt-1">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-md)] border border-line bg-sunken">
            <img
              src={opportunity.coverImage}
              alt={opportunity.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {opportunity.parthed_og ? (
                <Badge tone="accent" className="gap-1">
                  <Sparkles size={10} aria-hidden />
                  PathEd OG
                </Badge>
              ) : null}
              {opportunity.tier ? (
                <Badge
                  tone={opportunity.tier === "premium" ? "accent" : "success"}
                >
                  {opportunity.tier}
                </Badge>
              ) : null}
              {locked ? <Badge tone="warning">Premium required</Badge> : null}
            </div>
            <h3 className="type-h3 m-0 text-ink">{opportunity.title}</h3>
            <p className="type-body mt-2 mb-0 text-muted">{opportunity.desc}</p>
          </div>

          {locked ? (
            <p className="type-small m-0 rounded-[var(--radius-md)] border border-warning/30 bg-warning-soft px-4 py-3 text-ink">
              Advanced tracks are part of PathEd Premium. Upgrade to apply —
              your saved details carry over.
            </p>
          ) : null}

          <DescriptionList
            className="rounded-[var(--radius-md)] border border-line bg-sunken p-4"
            items={[
              { label: "Category", value: categoryLabel ?? opportunity.category },
              { label: "Mode", value: opportunity.mode },
              { label: "Difficulty", value: opportunity.difficulty },
              { label: "Eligibility", value: opportunity.eligibility },
              {
                label: "Reward",
                value: (
                  <span className="font-semibold text-ink">
                    {opportunity.prizePool}
                  </span>
                ),
              },
              {
                label: "Deadline",
                value: (
                  <span className="type-numeric font-semibold text-accent">
                    {formatDeadline(opportunity.deadline)}
                  </span>
                ),
              },
              {
                label: "Seats left",
                value: (
                  <span className="type-numeric">{opportunity.seatsLeft}</span>
                ),
              },
            ]}
          />

          <div className="min-w-0">
            <h4 className="type-overline m-0 mb-2 text-faint">
              Required stack
            </h4>
            <ul className="flex list-none flex-wrap gap-1.5 p-0">
              {techTags(opportunity.tech).map((tag) => (
                <li
                  key={tag}
                  className="type-caption rounded-full border border-primary-border bg-primary-soft px-2.5 py-1 text-primary"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
