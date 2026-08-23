"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";

export default function OnboardingIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace(routes.onboarding.stage1);
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-sm text-[var(--text-muted)]">Loading onboarding...</p>
    </div>
  );
}
