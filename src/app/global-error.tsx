"use client";

import { ErrorScreen } from "@/components/ui/ErrorScreen";
// The root layout never renders when this boundary is hit, so its stylesheet
// import doesn't apply — this file has to pull in the token layer itself.
import "./globals.css";

/**
 * Last-resort boundary for errors thrown in the root layout itself.
 *
 * Must render its own <html>/<body>. `data-theme` is intentionally unset:
 * whatever set it has already failed, so this falls back to the light theme
 * rather than risking an unstyled or unreadable screen.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-canvas text-ink">
        <ErrorScreen
          title="PathEd hit an unexpected error"
          description="The application failed to start. Reloading usually resolves it — if it keeps happening, please get in touch with the reference below."
          digest={error.digest}
          onRetry={reset}
          retryLabel="Reload"
          secondaryAction={
            <a
              href="/"
              className="type-label inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-line-strong bg-surface px-4 font-semibold text-ink transition-colors hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Go home
            </a>
          }
          className="min-h-dvh"
        />
      </body>
    </html>
  );
}
