"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Network, Clock, Sparkles, Clapperboard, Check, Save, AlertCircle } from "lucide-react";
import {
  GENERATION_STEPS,
  type GenerationStepId,
  type RoadmapGenerationProgress,
} from "@/lib/roadmap/generation-progress";

const ICONS: Record<GenerationStepId, typeof Brain> = {
  profile: Brain,
  hiring: Network,
  graph: Sparkles,
  assessments: Clock,
  resources: Clapperboard,
  save: Save,
  done: Check,
};

const COLORS: Record<GenerationStepId, string> = {
  profile: "#6c63ff",
  hiring: "#00c9a7",
  graph: "#6c63ff",
  assessments: "#f7971e",
  resources: "#38bdf8",
  save: "#a78bfa",
  done: "#00c9a7",
};

export default function RoadmapGenerating({
  isOpen,
  progress,
  error,
  targetCompany,
  targetRole,
}: {
  isOpen: boolean;
  progress: RoadmapGenerationProgress | null;
  error?: string | null;
  targetCompany?: string | null;
  targetRole?: string;
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setElapsed(0);
      return;
    }
    const started = Date.now();
    const t = window.setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 250);
    return () => window.clearInterval(t);
  }, [isOpen]);

  if (!isOpen) return null;

  const step = progress?.step ?? "profile";
  const percent = error ? progress?.percent ?? 0 : progress?.percent ?? 8;
  const CurrentIcon = ICONS[step] || Sparkles;
  const currentColor = error ? "#ef4444" : COLORS[step] || "#6c63ff";
  const stepIndex = GENERATION_STEPS.findIndex((s) => s.id === step);

  const headline = error
    ? "Generation failed"
    : targetCompany && (step === "hiring" || step === "graph")
      ? `Building a ${targetCompany}${targetRole ? ` ${targetRole}` : ""} hiring path`
      : progress?.message || GENERATION_STEPS[Math.max(0, stepIndex)].label;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background:
          "radial-gradient(1200px 600px at 50% 20%, rgba(108,99,255,0.25), transparent 50%), rgba(6, 10, 24, 0.88)",
        backdropFilter: "blur(14px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 24,
      }}
    >
      <motion.div
        key={error ? "err" : step}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}
      >
        <motion.div
          animate={error ? {} : { rotate: 360 }}
          transition={error ? undefined : { repeat: Infinity, duration: 8, ease: "linear" }}
          style={{
            padding: 22,
            borderRadius: "50%",
            border: `2px solid ${currentColor}`,
            boxShadow: `0 0 32px ${currentColor}55`,
            background: "rgba(15,23,42,0.7)",
          }}
        >
          {error ? <AlertCircle size={40} color={currentColor} /> : <CurrentIcon size={40} color={currentColor} />}
        </motion.div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            fontFamily: "Outfit",
            color: "#fff",
            textAlign: "center",
            maxWidth: 520,
            lineHeight: 1.35,
          }}
        >
          {headline}
        </div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Inter", fontSize: 14 }}>
          {error ? error : `${percent}% · ${elapsed}s elapsed`}
        </div>
      </motion.div>

      <div style={{ width: 360, maxWidth: "92vw", marginTop: 28 }}>
        <div
          style={{
            height: 8,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 99,
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${Math.max(4, percent)}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ height: "100%", background: currentColor, borderRadius: 99 }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18 }}>
          {GENERATION_STEPS.filter((s) => s.id !== "done").map((s, i) => {
            const done = stepIndex > i || step === "done";
            const active = s.id === step && !error;
            return (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: done || active ? "#fff" : "rgba(255,255,255,0.4)",
                  fontFamily: "Outfit",
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 99,
                    display: "grid",
                    placeItems: "center",
                    background: done ? "#00c9a7" : active ? COLORS[s.id] : "transparent",
                    border: `1px solid ${done ? "#00c9a7" : active ? COLORS[s.id] : "rgba(255,255,255,0.25)"}`,
                  }}
                >
                  {done ? <Check size={11} color="#041016" /> : null}
                </span>
                {s.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
