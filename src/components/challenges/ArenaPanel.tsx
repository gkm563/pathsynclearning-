"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Square, Timer } from "lucide-react";
import type { ChallengeSummary } from "@/lib/challenges/types";
import { ARENA_DURATION_SEC } from "@/lib/challenges/progress";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import ChallengeCard from "./ChallengeCard";

export default function ArenaPanel({
  pack,
  bestScore,
  lastPlayedAt,
  sessionSolvedIds,
  onOpen,
  onComplete,
  onSessionStart,
}: {
  pack: ChallengeSummary[];
  bestScore: number;
  lastPlayedAt?: string;
  sessionSolvedIds: string[];
  onOpen: (item: ChallengeSummary) => void;
  onComplete: (score: number) => void;
  onSessionStart: () => void;
}) {
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(ARENA_DURATION_SEC);

  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          setRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (running || left > 0) return;
    if (left === 0) {
      const score = Math.round(
        (sessionSolvedIds.length / Math.max(1, pack.length)) * 100,
      );
      onComplete(score);
    }
     
  }, [left, running]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  const progress = useMemo(
    () =>
      Math.round((sessionSolvedIds.length / Math.max(1, pack.length)) * 100),
    [sessionSolvedIds, pack.length],
  );

  const start = () => {
    onSessionStart();
    setLeft(ARENA_DURATION_SEC);
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    const score = Math.round(
      (sessionSolvedIds.length / Math.max(1, pack.length)) * 100,
    );
    onComplete(score);
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <h3 className="type-h4 m-0 text-ink">Timed Arena · 25 minutes</h3>
        <p className="type-small mt-1.5 mb-0 text-muted">
          Mixed MCQ + coding pack. Score counts challenges you actually pass
          before the clock ends.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "type-numeric inline-flex items-center gap-1.5 text-lg font-semibold",
              left < 60 ? "text-danger" : "text-ink",
            )}
          >
            <Timer size={18} aria-hidden /> {mm}:{ss}
          </span>
          <span className="type-small text-muted">
            Best {bestScore}% · Session {progress}%
            {lastPlayedAt
              ? ` · Last ${new Date(lastPlayedAt).toLocaleString()}`
              : ""}
          </span>
          {!running ? (
            <Button onClick={start}>
              <Play size={14} aria-hidden /> Start arena
            </Button>
          ) : (
            <Button variant="secondary" onClick={stop}>
              <Square size={14} aria-hidden /> Finish early
            </Button>
          )}
        </div>
      </Card>

      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2",
          !running && "opacity-70",
        )}
      >
        {pack.map((item) => (
          <ChallengeCard
            key={item.id}
            item={{
              ...item,
              status: sessionSolvedIds.includes(item.id)
                ? "solved"
                : item.status,
            }}
            onOpen={() => {
              if (!running) return;
              onOpen(item);
            }}
          />
        ))}
      </div>
    </div>
  );
}
