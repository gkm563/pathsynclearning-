"use client";

import React from "react";
import { Award, AlertTriangle, MapPin, TrendingUp } from "lucide-react";
import type {
  MilestoneInfo,
  WeaknessCoach,
  ChallengeSummary,
  ChallengeGamification,
} from "@/lib/challenges/types";
import { xpProgress } from "@/lib/challenges/progress";
import { routes } from "@/lib/routes";
import ChallengeCard from "./ChallengeCard";

export default function ProgressExtrasPanel({
  milestones,
  weakness,
  drills,
  gamification,
  onOpen,
  onReview,
  onOpenRecords,
}: {
  milestones: MilestoneInfo[];
  weakness: WeaknessCoach | null;
  drills: ChallengeSummary[];
  gamification: ChallengeGamification;
  onOpen: (item: ChallengeSummary) => void;
  onReview: (item: ChallengeSummary) => void;
  onOpenRecords: () => void;
}) {
  const bar = xpProgress(gamification.xp);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900 }}>
      <div
        style={{
          padding: 22,
          borderRadius: 18,
          background:
            "linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,201,167,0.1))",
          border: "1.5px solid rgba(108,99,255,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "Outfit",
            fontWeight: 800,
            marginBottom: 10,
          }}
        >
          <TrendingUp size={16} color="#6c63ff" />
          Level {bar.level}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Fira Code",
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 8,
            color: "var(--text-main)",
          }}
        >
          <span>{bar.xp} XP total</span>
          <span>
            {bar.intoLevel}/{bar.span} to Lv {bar.level + 1}
          </span>
        </div>
        <div
          style={{
            height: 10,
            borderRadius: 999,
            background: "rgba(15,23,42,0.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${bar.pct}%`,
              height: "100%",
              background: "linear-gradient(90deg, #6c63ff, #00c9a7)",
            }}
          />
        </div>
        <p
          style={{
            margin: "12px 0 0",
            fontFamily: "Outfit",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          XP and level are stored on your profile. First pass of a challenge awards XP
          once — retries keep score history without double rewards.
        </p>
      </div>

      {weakness && (
        <div
          style={{
            padding: 22,
            borderRadius: 18,
            background: "rgba(239,68,68,0.06)",
            border: "1.5px solid rgba(239,68,68,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "Outfit",
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            <AlertTriangle size={16} color="#ef4444" />
            Weakness coach · {weakness.topic}
          </div>
          <p style={{ margin: "0 0 12px", fontFamily: "Outfit", fontSize: 13.5, color: "var(--text-muted)" }}>
            {weakness.fails} recent fails on this topic. Drill these three, then revisit the
            linked roadmap node.
          </p>
          {weakness.suggestedNodeTitle && weakness.suggestedNodeId && (
            <a
              href={`/dashboard/roadmap?node=${encodeURIComponent(weakness.suggestedNodeId)}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                color: "#6c63ff",
                fontFamily: "Outfit",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                marginBottom: 12,
              }}
            >
              <MapPin size={13} /> {weakness.suggestedNodeTitle}
            </a>
          )}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {drills.map((d) => (
              <ChallengeCard
                key={d.id}
                item={d}
                onOpen={() => onOpen(d)}
                onReview={() => onReview(d)}
              />
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          padding: 22,
          borderRadius: 18,
          background: "var(--bg-card)",
          border: "1.5px solid var(--border-light)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "Outfit",
              fontWeight: 800,
            }}
          >
            <Award size={16} color="#6c63ff" />
            Certificate milestones
          </div>
          <button
            type="button"
            onClick={onOpenRecords}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1.5px solid #6c63ff",
              background: "rgba(108,99,255,0.08)",
              color: "#6c63ff",
              fontWeight: 800,
              fontFamily: "Outfit",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Records & Certs
          </button>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {milestones.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                background: m.unlocked
                  ? "rgba(0,201,167,0.1)"
                  : "var(--bg-alt)",
                border: m.unlocked
                  ? "1px solid rgba(0,201,167,0.35)"
                  : "1px solid var(--border-light)",
              }}
            >
              <div>
                <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: 14 }}>
                  {m.title}
                </div>
                <div style={{ fontFamily: "Outfit", fontSize: 12.5, color: "var(--text-muted)" }}>
                  {m.description}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "Fira Code",
                  fontSize: 12,
                  fontWeight: 800,
                  color: m.unlocked ? "#00c9a7" : "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {m.unlocked ? "Unlocked" : `Need ${m.requirement}`}
              </div>
            </div>
          ))}
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--text-muted)", fontFamily: "Outfit" }}>
          Unlocks also appear under{" "}
          <a href={routes.app.recordsCerts} style={{ color: "#6c63ff" }}>
            Records & Certs
          </a>
          .
        </p>
      </div>
    </div>
  );
}
