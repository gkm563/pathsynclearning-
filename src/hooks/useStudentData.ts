"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "@/lib/api";

/** Plan toggle backed by user_settings.plan via API. */
export function usePlan(defaultPlan = "free") {
  const [plan, setPlanState] = useState(defaultPlan);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ settings?: { plan?: string } }>("/api/me/settings");
        if (!cancelled && data.settings?.plan) {
          setPlanState(data.settings.plan);
        }
      } catch {
        // unauthenticated — keep default
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPlan = useCallback(async (next: string) => {
    setPlanState(next);
    try {
      await apiSend("/api/me/settings", "PUT", { plan: next });
    } catch {
      // keep UI state even if sync fails
    }
  }, []);

  return { plan, setPlan, ready };
}