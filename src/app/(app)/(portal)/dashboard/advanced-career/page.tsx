"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

export default function AdvancedCareerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${routes.app.dashboard}?feature=advanced-career`);
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-sm text-[var(--text-muted)]">Redirecting to dashboard...</p>
    </div>
  );
}
