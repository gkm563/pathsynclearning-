"use client";

import { Check, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Opportunity } from "./types";

/**
 * What an opportunity's primary control does.
 *
 * Modelled as a union because the four outcomes are mutually exclusive and
 * need different markup: the partner hand-off is a real link, "applied" is a
 * status rather than a control, and the rest are buttons.
 */
export type OpportunityAction =
  /** PathEd-hosted: opens the in-product application form. */
  | { kind: "apply"; onApply: () => void }
  /** Third-party: hands off to the organiser's portal in a new tab. */
  | { kind: "external"; onOpen: () => void }
  /** Already applied — nothing left to do. */
  | { kind: "applied" }
  /** Behind premium: routes to plans instead of pretending to be applicable. */
  | { kind: "locked"; onUnlock: () => void };

/** Shared by the link variant, which can't reuse `Button` (it renders a `<button>`). */
const linkClass =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-4 font-semibold tracking-[-0.02em] bg-primary text-on-primary transition-colors duration-[var(--duration-fast)] hover:bg-primary-hover motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function OpportunityActionControl({
  action,
  opportunity,
  className,
}: {
  action: OpportunityAction;
  opportunity: Opportunity;
  className?: string;
}) {
  if (action.kind === "applied") {
    return (
      <p
        className={cn(
          "type-label m-0 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-primary-border bg-primary-soft px-4 text-primary",
          className,
        )}
      >
        <Check size={15} aria-hidden />
        Applied
      </p>
    );
  }

  if (action.kind === "locked") {
    return (
      <Button className={className} onClick={action.onUnlock}>
        <Lock size={14} aria-hidden />
        Unlock
      </Button>
    );
  }

  if (action.kind === "external") {
    return (
      <a
        href={opportunity.externalLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={action.onOpen}
        className={cn(linkClass, className)}
      >
        Apply
        <ExternalLink size={14} aria-hidden />
        <span className="sr-only">
          (opens the organiser’s site in a new tab)
        </span>
      </a>
    );
  }

  return (
    <Button className={className} onClick={action.onApply}>
      Apply
    </Button>
  );
}
