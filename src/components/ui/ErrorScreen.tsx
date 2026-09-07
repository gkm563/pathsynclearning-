"use client";

import { RotateCcw } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./primitives";

/**
 * Full-height failure screen shared by the route error boundaries.
 *
 * Deliberately shows no stack trace or raw message: an `Error` thrown on the
 * server is redacted in production anyway, and exposing internals to users
 * helps nobody. The `digest` is surfaced as a short reference so a user can
 * quote it in a support request while the real detail stays in the logs.
 */
export function ErrorScreen({
  title = "Something went wrong",
  description = "We hit an unexpected problem loading this page. Trying again usually fixes it.",
  digest,
  onRetry,
  retryLabel = "Try again",
  secondaryAction,
  className,
}: {
  title?: string;
  description?: string;
  digest?: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryAction?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex min-h-[60vh] flex-col items-center justify-center px-6 py-16 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface text-accent shadow-[var(--shadow-sm)]"
      >
        <RotateCcw size={20} />
      </span>

      <h1 className="type-h2 m-0 max-w-lg text-ink">{title}</h1>
      <p className="type-body mx-auto mt-3 mb-0 max-w-md text-muted">
        {description}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
        {onRetry ? (
          <Button onClick={onRetry} data-autofocus>
            {retryLabel}
          </Button>
        ) : null}
        {secondaryAction}
      </div>

      {digest ? (
        <p className="type-caption type-code mt-8 mb-0 text-faint">
          Reference: {digest}
        </p>
      ) : null}
    </div>
  );
}
