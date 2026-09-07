"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet } from "@/lib/api";
import type { ApplicationKind, ApplicationsResponse } from "./types";

type Status = "loading" | "ready" | "error";

export type ApplicationsState = {
  /** Ids applied to with `kind: "event"` — the events catalogue. */
  eventIds: string[];
  /** Ids applied to with `kind: "og"` — the PathEd OG catalogue. */
  ogIds: string[];
  status: Status;
  /** True while re-fetching with content already on screen. */
  refreshing: boolean;
  reload: () => void;
  isApplied: (id: string, kind: ApplicationKind) => boolean;
  /**
   * Records an application locally without a request. Used for the optimistic
   * update before `POST /api/me/applications`, and for external partner
   * opportunities which never hit the API at all.
   */
  markApplied: (id: string, kind: ApplicationKind) => void;
};

/**
 * Reads the signed-in student's applications from `GET /api/me/applications`.
 *
 * Both opportunity pages need the same two id lists, and both need to add to
 * them optimistically, so the fetch, the error/retry state and the local
 * bookkeeping live here rather than being duplicated per page.
 */
export function useApplications(): ApplicationsState {
  const [eventIds, setEventIds] = useState<string[]>([]);
  const [ogIds, setOgIds] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [refreshing, setRefreshing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const loaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    if (loaded.current) setRefreshing(true);

    (async () => {
      try {
        const data = await apiGet<ApplicationsResponse>(
          "/api/me/applications",
        );
        if (cancelled) return;
        setEventIds(data.eventIds ?? []);
        setOgIds(data.ogIds ?? []);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setEventIds([]);
        setOgIds([]);
        setStatus("error");
      } finally {
        if (!cancelled) {
          loaded.current = true;
          setRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const isApplied = useCallback(
    (id: string, kind: ApplicationKind) =>
      (kind === "og" ? ogIds : eventIds).includes(id),
    [eventIds, ogIds],
  );

  const markApplied = useCallback((id: string, kind: ApplicationKind) => {
    const add = (list: string[]) =>
      list.includes(id) ? list : [...list, id];
    if (kind === "og") setOgIds(add);
    else setEventIds(add);
  }, []);

  return {
    eventIds,
    ogIds,
    status,
    refreshing,
    reload,
    isApplied,
    markApplied,
  };
}
