"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { PageSpinner } from "@/components/ui/primitives";

/**
 * Settings now live inside Profile Management.
 * Keep this route for nav/bookmarks and forward to preferences.
 */
export default function PlatformSettings() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${routes.app.profile}?section=preferences`);
  }, [router]);

  return (
    <div style={{ padding: 48, display: "flex", justifyContent: "center" }}>
      <PageSpinner label="Opening preferences…" />
    </div>
  );
}
