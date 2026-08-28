"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Timer, Play, Square } from "lucide-react";
import type { ChallengeSummary } from "@/lib/challenges/types";
import { ARENA_DURATION_SEC } from "@/lib/challenges/progress";
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
  /** Challenge IDs solved during the active arena session (from real passes). */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          padding: 22,
          borderRadius: 18,
          background:
            "linear-gradient(135deg, rgba(236,72,153,0.1), rgba(108,99,255,0.12))",
          border: "1.5px solid rgba(236,72,153,0.3)",
        }}
      >
        <h3 style={{ margin: "0 0 6px", fontFamily: "Outfit", fontWeight: 800 }}>
          Timed Arena · 25 minutes
        </h3>
        <p style={{ margin: 0, color: "var(--text-muted)", fontFamily: "Outfit", fontSize: 13.5 }}>
          Mixed MCQ + coding pack. Score counts challenges you actually pass before the clock ends.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 14,
            alignItems: "center",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "Fira Code",
              fontWeight: 800,
              fontSize: 18,
              color: left < 60 ? "#ec4899" : "var(--text-main)",
            }}
          >
            <Timer size={18} /> {mm}:{ss}
          </span>
          <span style={{ fontFamily: "Outfit", fontSize: 13, color: "var(--text-muted)" }}>
            Best {bestScore}% · Session {progress}%
            {lastPlayedAt
              ? ` · Last ${new Date(lastPlayedAt).toLocaleString()}`
              : ""}
          </span>
          {!running ? (
            <button type="button" onClick={start} style={primaryBtn}>
              <Play size={14} /> Start arena
            </button>
          ) : (
            <button type="button" onClick={stop} style={ghostBtn}>
              <Square size={14} /> Finish early
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
          opacity: running ? 1 : 0.72,
        }}
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

const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg, #ec4899, #6c63ff)",
  color: "#fff",
  fontWeight: 800,
  fontFamily: "Outfit",
  fontSize: 13,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 14px",
  borderRadius: 12,
  border: "1.5px solid var(--border-light)",
  background: "var(--bg-card)",
  color: "var(--text-main)",
  fontWeight: 700,
  fontFamily: "Outfit",
  fontSize: 13,
  cursor: "pointer",
};
