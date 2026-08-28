"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  MapPin,
  Lightbulb,
  FileText,
  Building2,
  ClipboardList,
  RotateCcw,
} from "lucide-react";
import type { ChallengeSummary } from "@/lib/challenges/types";
import { CAT_COLORS, DIFF_STYLES } from "@/lib/challenges/catalog";
import { HINT_COST } from "@/lib/challenges/progress";
import ChallengeIcon from "./ChallengeIcon";

export default function ChallengeCard({
  item,
  featured,
  boss,
  onOpen,
  onReview,
  onUnlockHint,
  hintBusy,
}: {
  item: ChallengeSummary;
  featured?: boolean;
  boss?: boolean;
  onOpen: () => void;
  onReview?: () => void;
  onUnlockHint?: () => void;
  hintBusy?: boolean;
}) {
  const [showSolution, setShowSolution] = useState(false);
  const ds = DIFF_STYLES[item.difficulty];
  const catColor = CAT_COLORS[item.category] || "#6c63ff";
  const done = item.status === "solved";
  const attempted = item.status === "attempted" || done;
  const visibleHints = item.hints.slice(0, item.hintsUnlocked);
  const canReview = Boolean(onReview) && (attempted || Boolean(item.lastAttempt));
  // Solution / answer key only after a real pass
  const canShowSolution =
    done && (Boolean(item.solution) || Boolean(item.questions?.length));

  return (
    <motion.div
      whileHover={{ y: -3 }}
      style={{
        background: featured || boss
          ? "linear-gradient(145deg, rgba(108,99,255,0.14), rgba(0,201,167,0.08))"
          : done
            ? "rgba(0, 201, 167, 0.06)"
            : "var(--bg-card)",
        border: featured || boss
          ? "1.5px solid rgba(108,99,255,0.45)"
          : `1.5px solid ${done ? "#00c9a7" : "var(--border-light)"}`,
        borderRadius: 20,
        padding: featured ? 26 : 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: featured
          ? "0 12px 36px rgba(108,99,255,0.16)"
          : "0 8px 24px rgba(0,0,0,0.04)",
        position: "relative",
      }}
    >
      {(featured || boss) && (
        <span
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            padding: "4px 10px",
            borderRadius: 999,
            background: boss
              ? "linear-gradient(135deg, #f59e0b, #ec4899)"
              : "linear-gradient(135deg, #6c63ff, #00c9a7)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            fontFamily: "Outfit",
          }}
        >
          {boss ? "Weekly Boss" : "Challenge of the Day"}
        </span>
      )}
      {done && !featured && !boss && (
        <span
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            padding: "4px 10px",
            borderRadius: 999,
            background: "#00c9a7",
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          Solved
        </span>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span
          style={{
            width: featured ? 44 : 36,
            height: featured ? 44 : 36,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: `${catColor}18`,
          }}
        >
          <ChallengeIcon name={item.icon} size={featured ? 22 : 18} color={catColor} />
        </span>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 8,
            background: ds.bg,
            border: `1px solid ${ds.bdr}`,
            color: ds.col,
            fontSize: 11,
            fontWeight: 800,
            fontFamily: "Fira Code",
            textTransform: "capitalize",
          }}
        >
          {ds.label}
        </span>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 8,
            background: "rgba(108,99,255,0.1)",
            color: catColor,
            fontSize: 11,
            fontWeight: 800,
            fontFamily: "Fira Code",
          }}
        >
          {item.type.toUpperCase()}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "Fira Code" }}>
          +{item.xp} XP
        </span>
      </div>

      <h3
        style={{
          margin: 0,
          fontFamily: "Outfit",
          fontSize: featured ? 22 : 17,
          fontWeight: 800,
          color: "var(--text-main)",
          lineHeight: 1.3,
          paddingRight: featured || boss ? 120 : 0,
        }}
      >
        {item.title}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: 13.5,
          color: "var(--text-muted)",
          lineHeight: 1.55,
          fontFamily: "Outfit",
        }}
      >
        {item.description}
      </p>

      {item.companyTags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <Building2 size={12} color="#64748b" />
          {item.companyTags.slice(0, 4).map((c) => (
            <span
              key={c}
              style={{
                fontSize: 11,
                fontFamily: "Outfit",
                fontWeight: 700,
                color: "#64748b",
                padding: "2px 8px",
                borderRadius: 999,
                background: "var(--bg-alt)",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {item.linkedNodeTitle && item.linkedNodeId && (
        <a
          href={`/dashboard/roadmap?node=${encodeURIComponent(item.linkedNodeId)}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            color: "#6c63ff",
            fontFamily: "Outfit",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          <MapPin size={13} /> Practice for: {item.linkedNodeTitle}
        </a>
      )}

      {visibleHints.length > 0 && (
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.25)",
          }}
        >
          {visibleHints.map((h, i) => (
            <div
              key={i}
              style={{
                fontSize: 12.5,
                fontFamily: "Outfit",
                color: "var(--text-main)",
                marginBottom: i < visibleHints.length - 1 ? 6 : 0,
              }}
            >
              Hint {i + 1}: {h}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onOpen}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
            color: "#fff",
            fontWeight: 800,
            fontFamily: "Outfit",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {done ? <RotateCcw size={14} /> : <Play size={14} />}{" "}
          {done
            ? "Retry"
            : item.type === "mcq"
              ? "Start MCQ"
              : item.type === "coding"
                ? "Solve in IDE"
                : "Open"}
        </button>
        {canReview && (
          <button type="button" onClick={onReview} style={ghostBtn}>
            <ClipboardList size={14} /> Review
            {typeof item.score === "number" ? ` ${item.score}%` : ""}
          </button>
        )}
        {!done && onUnlockHint && item.hintsUnlocked < item.hints.length && (
          <button
            type="button"
            disabled={hintBusy}
            onClick={onUnlockHint}
            style={ghostBtn}
          >
            <Lightbulb size={14} /> Hint ({HINT_COST}c)
          </button>
        )}
        {canShowSolution && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSolution((v) => !v);
            }}
            style={{
              ...ghostBtn,
              borderColor: showSolution ? "#6c63ff" : "var(--border-light)",
              background: showSolution ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
              color: showSolution ? "#6c63ff" : "var(--text-main)",
            }}
          >
            <FileText size={14} /> {showSolution ? "Hide solution" : "Solution"}
          </button>
        )}
      </div>

      {showSolution && canShowSolution && (
        <div
          style={{
            marginTop: 4,
            padding: 14,
            borderRadius: 12,
            background: "rgba(108,99,255,0.08)",
            border: "1px solid rgba(108,99,255,0.25)",
          }}
        >
          <div style={{ fontFamily: "Outfit", fontWeight: 800, marginBottom: 8 }}>
            {item.type === "mcq" ? "Answer key" : "Solution"}
          </div>

          {item.solution?.editorial && (
            <p style={{ margin: "0 0 10px", fontSize: 13, fontFamily: "Outfit", lineHeight: 1.55 }}>
              {item.solution.editorial}
            </p>
          )}

          {item.type === "mcq" && item.questions && item.questions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {item.questions.map((q, i) => {
                const letter = String.fromCharCode(65 + q.correct);
                const answer = q.opts[q.correct] ?? "—";
                return (
                  <div
                    key={String(q.id)}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "var(--bg-card, #fff)",
                      border: "1px solid rgba(108,99,255,0.18)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Outfit",
                        fontWeight: 700,
                        fontSize: 13,
                        marginBottom: 6,
                        color: "var(--text-main)",
                      }}
                    >
                      {i + 1}. {q.q}
                    </div>
                    <div
                      style={{
                        fontFamily: "Outfit",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#059669",
                      }}
                    >
                      Correct: {letter}. {answer}
                    </div>
                    {q.explanation && (
                      <p
                        style={{
                          margin: "6px 0 0",
                          fontSize: 12.5,
                          fontFamily: "Outfit",
                          color: "var(--text-muted)",
                          lineHeight: 1.5,
                        }}
                      >
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {item.solution?.complexity &&
                item.solution.complexity.toLowerCase() !== "n/a" && (
                  <div style={{ fontSize: 12, fontFamily: "Fira Code", color: "#6c63ff" }}>
                    {item.solution.complexity}
                  </div>
                )}
              {item.solution?.notes && (
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
                  {item.solution.notes}
                </p>
              )}
              {!item.solution?.editorial && (
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", fontFamily: "Outfit" }}>
                  No written solution for this challenge yet.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

const ghostBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 14px",
  borderRadius: 12,
  border: "1.5px solid var(--border-light)",
  background: "var(--bg-alt)",
  color: "var(--text-main)",
  fontWeight: 700,
  fontFamily: "Outfit",
  fontSize: 13,
  cursor: "pointer",
};
