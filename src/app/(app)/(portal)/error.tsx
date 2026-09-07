"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { ErrorScreen } from "@/components/ui/ErrorScreen";
import { routes } from "@/lib/routes";

/**
 * Portal error boundary. Sits below the shell, so navigation, the sidebar and
 * the header stay usable while one page has failed — the user can move on
 * instead of being dropped onto a bare full-page error.
 */
export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      title="This page didn’t load"
      description="Something went wrong fetching your data. Try again — the rest of your workspace is still available from the navigation."
      digest={error.digest}
      onRetry={reset}
      secondaryAction={
        <Link href={routes.app.dashboard}>
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      }
      className="min-h-[50vh]"
    />
  );
}
