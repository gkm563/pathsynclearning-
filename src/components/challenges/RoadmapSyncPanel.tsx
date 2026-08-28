"use client";

import React from "react";
import { Link2, RefreshCw } from "lucide-react";
import type { ChallengeSyncPrefs } from "@/lib/challenges/types";
import { routes } from "@/lib/routes";

export default function RoadmapSyncPanel({
  sync,
  careerGoal,
  roadmapTopics,
  saving,
  onToggle,
  onOpenRoadmap,
}: {
  sync: ChallengeSyncPrefs;
  careerGoal: string | null;
  roadmapTopics: string[];
  saving?: boolean;
  onToggle: (enabled: boolean) => void;
  onOpenRoadmap?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        maxWidth: 720,
      }}
    >
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
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 6px",
                fontFamily: "Outfit",
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              Sync with roadmap
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: "var(--text-muted)",
                lineHeight: 1.5,
                fontFamily: "Outfit",
              }}
            >
              When enabled, Challenge of the Day and All Questions prefer topics from
              your unfinished roadmap nodes
              {careerGoal ? (
                <>
                  {" "}
                  for <b style={{ color: "#6c63ff" }}>{careerGoal}</b>
                </>
              ) : null}
              .
            </p>
          </div>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 14,
              background: sync.enabled
                ? "rgba(0,201,167,0.12)"
                : "var(--bg-alt)",
              border: sync.enabled
                ? "1.5px solid #00c9a7"
                : "1.5px solid var(--border-light)",
              cursor: "pointer",
              fontFamily: "Outfit",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={sync.enabled}
              disabled={saving}
              onChange={(e) => onToggle(e.target.checked)}
            />
            {sync.enabled ? "Synced" : "Off"}
          </label>
        </div>

        {sync.lastSyncedAt && (
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: "var(--text-muted)",
              fontFamily: "Fira Code",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <RefreshCw size={12} />
            Last updated {new Date(sync.lastSyncedAt).toLocaleString()}
          </div>
        )}
      </div>

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
            gap: 8,
            marginBottom: 12,
            fontFamily: "Outfit",
            fontWeight: 800,
          }}
        >
          <Link2 size={16} color="#6c63ff" />
          Active roadmap topics ({roadmapTopics.length})
        </div>
        {roadmapTopics.length === 0 ? (
          <p style={{ margin: 0, color: "var(--text-muted)", fontFamily: "Outfit" }}>
            No unfinished roadmap topics yet.{" "}
            <a href={routes.app.roadmap} style={{ color: "#6c63ff" }}>
              Open roadmap
            </a>
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {roadmapTopics.slice(0, 24).map((t) => (
              <span
                key={t}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(108,99,255,0.1)",
                  border: "1px solid rgba(108,99,255,0.25)",
                  color: "#6c63ff",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "Outfit",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={onOpenRoadmap}
          style={{
            marginTop: 16,
            padding: "10px 16px",
            borderRadius: 12,
            border: "1.5px solid #6c63ff",
            background: "rgba(108,99,255,0.08)",
            color: "#6c63ff",
            fontWeight: 800,
            fontFamily: "Outfit",
            cursor: "pointer",
          }}
        >
          View roadmap →
        </button>
      </div>
    </div>
  );
}
