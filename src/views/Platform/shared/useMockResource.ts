"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type MockResourceState = "loading" | "ready" | "error";

/**
 * Load lifecycle for the prototype portal screens.
 *
 * These pages render fixture data rather than a server response, but they
 * still need the three states a real screen has. Rather than fake a failure at
 * random — which would make the error state untestable and the retry a lie —
 * the load only fails when the browser reports itself offline, so the
 * `ErrorState` retry is a genuine, reachable path.
 */
export function useMockResource(delay = 420): {
  state: MockResourceState;
  reload: () => void;
} {
  const [state, setState] = useState<MockResourceState>("loading");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setState("loading");
    timer.current = setTimeout(() => {
      const offline =
        typeof navigator !== "undefined" && navigator.onLine === false;
      setState(offline ? "error" : "ready");
    }, delay);
  }, [delay]);

  useEffect(() => {
    reload();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [reload]);

  return { state, reload };
}
