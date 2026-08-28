"use client";

import React from "react";
import { Clock, Share2, Shield } from "lucide-react";
import type { ChallengeSummary, ChallengesApiResponse } from "@/lib/challenges/types";
import ChallengeCard from "./ChallengeCard";

function formatCountdown(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}h : ${String(m).padStart(2, "0")}m : ${String(s).padStart(2, "0")}s`;
}

export default function ChallengeOfDayPanel({
  featured,
  side,
  weekly,
  refreshInSeconds,
  careerGoal,
  cleared,
  duelCode,
  shields,
  onOpen,
  onReview,
  onUnlockHint,
  onShareDuel,
  onBuyShield,
  hintBusy,
}: {
  featured: ChallengeSummary | null;
  side: ChallengeSummary[];
  weekly: ChallengesApiResponse["weekly"];
  refreshInSeconds: number;
  careerGoal: string | null;
  cleared: boolean;
  duelCode: string;
  shields: number;
  onOpen: (item: ChallengeSummary) => void;
  onReview: (item: ChallengeSummary) => void;
  onUnlockHint: (item: ChallengeSummary) => void;
  onShareDuel: () => void;
  onBuyShield: () => void;
  hintBusy?: boolean;
}) {
  const sideDone = side.filter((s) => s.status === "solved").length;
  const featuredDone = featured?.status === "solved";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          padding: "16px 20px",
          borderRadius: 18,
          background:
            "linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,201,167,0.12))",
          border: "1.5px solid rgba(0,201,167,0.3)",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Outfit",
              fontWeight: 800,
              fontSize: 16,
              color: "var(--text-main)",
            }}
          >
            Today&apos;s pack
            {careerGoal ? (
              <span style={{ color: "#6c63ff" }}> · {careerGoal}</span>
            ) : null}
            {cleared ? (
              <span style={{ color: "#00c9a7", marginLeft: 8 }}>Cleared</span>
            ) : null}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 4,
              fontFamily: "Fira Code",
              fontSize: 12,
              color: "#00c9a7",
              fontWeight: 700,
            }}
          >
            <Clock size={13} />
            Refresh in {formatCountdown(refreshInSeconds)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={onShareDuel} style={chipBtn}>
            <Share2 size={13} /> Share CotD ({duelCode.slice(-6)})
          </button>
          <button type="button" onClick={onBuyShield} style={chipBtn}>
            <Shield size={13} /> Shields {shields}
          </button>
          <div style={{ fontFamily: "Outfit", fontSize: 13, color: "var(--text-muted)", alignSelf: "center" }}>
            Featured {featuredDone ? "done" : "open"} · Side {sideDone}/{side.length}
          </div>
        </div>
      </div>

      {featured ? (
        <ChallengeCard
          item={featured}
          featured
          onOpen={() => onOpen(featured)}
          onReview={() => onReview(featured)}
          onUnlockHint={() => onUnlockHint(featured)}
          hintBusy={hintBusy}
        />
      ) : (
        <div
          style={{
            padding: 28,
            borderRadius: 18,
            background: "var(--bg-card)",
            border: "1px dashed var(--border-light)",
            color: "var(--text-muted)",
            fontFamily: "Outfit",
          }}
        >
          No featured challenge available. Complete roadmap personalization to unlock
          goal-aligned packs.
        </div>
      )}

      <div>
        <h3 style={sectionTitle}>Side questions</h3>
        <div style={grid}>
          {side.map((item) => (
            <ChallengeCard
              key={item.id}
              item={item}
              onOpen={() => onOpen(item)}
              onReview={() => onReview(item)}
              onUnlockHint={() => onUnlockHint(item)}
              hintBusy={hintBusy}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 style={sectionTitle}>
          Weekly boss · {weekly.weekKey} · {weekly.progress}%
        </h3>
        <div style={grid}>
          {weekly.boss && (
            <ChallengeCard
              item={weekly.boss}
              boss
              onOpen={() => onOpen(weekly.boss!)}
              onReview={() => onReview(weekly.boss!)}
              onUnlockHint={() => onUnlockHint(weekly.boss!)}
              hintBusy={hintBusy}
            />
          )}
          {weekly.parts.map((item) => (
            <ChallengeCard
              key={item.id}
              item={item}
              onOpen={() => onOpen(item)}
              onReview={() => onReview(item)}
              onUnlockHint={() => onUnlockHint(item)}
              hintBusy={hintBusy}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  margin: "0 0 12px",
  fontFamily: "Outfit",
  fontSize: 15,
  fontWeight: 800,
  color: "var(--text-main)",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: 16,
};

const chipBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  borderRadius: 12,
  border: "1.5px solid var(--border-light)",
  background: "var(--bg-card)",
  color: "var(--text-main)",
  fontFamily: "Outfit",
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
};
