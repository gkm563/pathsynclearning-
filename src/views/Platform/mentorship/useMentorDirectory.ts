"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_ACTIVE_MENTOR_IDS, loadMentors } from "./data";
import type { LoadStatus, Mentor } from "./types";

/**
 * Owns the mentor directory and the student's selected mentors.
 *
 * The directory is a fixture, but it is loaded through the same
 * loading → ready/error path a real request would take so the view can render
 * honest loading, error and retry states instead of assuming success.
 */
export function useMentorDirectory() {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [activeIds, setActiveIds] = useState<string[]>([
    ...DEFAULT_ACTIVE_MENTOR_IDS,
  ]);

  const load = useCallback(() => {
    setStatus("loading");
    setError(undefined);
    try {
      setMentors(loadMentors());
      setStatus("ready");
    } catch (cause) {
      setMentors([]);
      setError(cause instanceof Error ? cause.message : "Unexpected error");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addMentor = useCallback((id: string) => {
    setActiveIds((previous) =>
      previous.includes(id) ? previous : [...previous, id],
    );
  }, []);

  const removeMentor = useCallback((id: string) => {
    setActiveIds((previous) => previous.filter((item) => item !== id));
  }, []);

  return {
    status,
    error,
    mentors,
    activeIds,
    activeMentors: activeIds
      .map((id) => mentors.find((mentor) => mentor.id === id))
      .filter((mentor): mentor is Mentor => mentor !== undefined),
    addMentor,
    removeMentor,
    retry: load,
  };
}
