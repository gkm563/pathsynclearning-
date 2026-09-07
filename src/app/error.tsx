"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { ErrorScreen } from "@/components/ui/ErrorScreen";
import { routes } from "@/lib/routes";

/**
 * Root route error boundary — catches render/data errors in any segment that
 * doesn't declare a closer boundary. The portal has its own at
 * `(app)/(portal)/error.tsx` so a failure there keeps the shell mounted.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorScreen
      digest={error.digest}
      onRetry={reset}
      secondaryAction={
        <Link href={routes.home}>
          <Button variant="secondary">Go home</Button>
        </Link>
      }
    />
  );
}
