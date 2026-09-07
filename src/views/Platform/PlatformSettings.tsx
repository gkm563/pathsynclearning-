"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageSpinner } from "@/components/ui";
import { routes } from "@/lib/routes";

/**
 * Settings live inside Profile Management.
 * Keep this route for nav/bookmarks and forward to preferences.
 */
export default function PlatformSettings() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${routes.app.profile}?section=preferences`);
  }, [router]);

  return <PageSpinner label="Opening preferences…" />;
}
