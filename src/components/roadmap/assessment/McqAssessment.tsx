"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eraser,
  Flag,
} from "lucide-react";
import type { NodeAssessment } from "@/types/roadmap";

type Status = "idle" | "answered" | "marked" | "marked_answered";

const C = {
  bg: "#f4f7fb",
  panel: "#ffffff",
  panelSoft: "#f1f5f9",
  line: "rgba(15,23,42,0.1)",
  text: "#0f172a",
  muted: "#64748b",
  teal: "#0d9488",
  tealDim: "rgba(13,148,136,0.12)",
  amber: "#d97706",
  amberDim: "rgba(217,119,6,0.14)",
  rose: "#e11d48",
};

/**
 * One-question-at-a-time MCQ exam UI (roadmap + challenges).
 * Parent AssessmentShell provides guidelines / countdown / timer.
 */
export default function McqAssessment({
  assessment,
  onSubmit,
  submitting,
  secondsLeft,
}: {
  assessment: NodeAssessment;
  onSubmit: (answers: Record<string, number>) => void;
  submitting: boolean;
  /** From AssessmentShell — auto-submit at 0 */
  secondsLeft?: number;
}) {
  const questions = assessment.mcq?.questions || [];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [marked, setMarked] = useState<Record<string, boolean>>({});
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const autoDone = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    const sync = () => setNarrow(window.innerWidth < 860);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    if (secondsLeft !== 0 || autoDone.current || !questions.length) return;
    autoDone.current = true;
    onSubmit(answersRef.current);
  }, [secondsLeft, onSubmit, questions.length]);

  if (!questions.length) {
    return (
      <div style={{ padding: 24, fontFamily: "Outfit", color: C.muted }}>
        No MCQ questions in this assessment.
      </div>
    );
  }

  const current = questions[index];
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined).length;
  const markedCount = questions.filter((q) => marked[q.id]).length;
  const letters = ["A", "B", "C", "D", "E", "F"];

  const statusOf = (id: string): Status => {
    const has = answers[id] !== undefined;
    const m = Boolean(marked[id]);
    if (m && has) return "marked_answered";
    if (m) return "marked";
    if (has) return "answered";
    return "idle";
  };

  const selectOption = (oi: number) => {
    setAnswers((a) => ({ ...a, [current.id]: oi }));
  };

  const clearAnswer = () => {
    setAnswers((a) => {
      const next = { ...a };
      delete next[current.id];
      return next;
    });
  };

  const toggleMark = () => {
    setMarked((m) => ({ ...m, [current.id]: !m[current.id] }));
  };

  const goNext = () => {
    if (index < questions.length - 1) setIndex(index + 1);
    else setConfirmSubmit(true);
  };

  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const submitNow = () => {
    setConfirmSubmit(false);
    onSubmit(answers);
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: `radial-gradient(900px 420px at 0% 0%, rgba(13,148,136,0.08), transparent 50%), ${C.bg}`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          padding: "10px 18px",
          borderBottom: `1px solid ${C.line}`,
          background: "rgba(255,255,255,0.85)",
        }}
      >
        <Chip>Answered {answeredCount}/{questions.length}</Chip>
        {markedCount > 0 && <Chip tone="amber">Marked {markedCount}</Chip>}
        <Chip>Pass mark {assessment.passScore}%</Chip>
        <Chip tone={secondsLeft !== undefined && secondsLeft <= 60 ? "rose" : "default"}>
          One question at a time · use the map to jump
        </Chip>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: narrow ? "1fr" : "minmax(200px, 240px) 1fr",
          gridTemplateRows: narrow ? "auto 1fr" : undefined,
        }}
      >
        <aside
          style={{
            padding: 16,
            borderRight: narrow ? "none" : `1px solid ${C.line}`,
            borderBottom: narrow ? `1px solid ${C.line}` : "none",
            background: "rgba(255,255,255,0.8)",
            overflow: "auto",
            maxHeight: narrow ? 180 : undefined,
          }}
        >
          <div
            style={{
              fontFamily: "Outfit",
              fontWeight: 800,
              fontSize: 13,
              marginBottom: 10,
              color: C.text,
            }}
          >
            Question map
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {questions.map((q, i) => {
              const st = statusOf(q.id);
              const active = i === index;
              const isMarked = st === "marked" || st === "marked_answered";
              const isAnswered = st === "answered" || st === "marked_answered";
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  title={
                    isMarked
                      ? isAnswered
                        ? "Marked · answered"
                        : "Marked for review"
                      : isAnswered
                        ? "Answered"
                        : "Not answered"
                  }
                  style={{
                    height: 36,
                    borderRadius: 10,
                    border: active
                      ? `2px solid ${C.teal}`
                      : isMarked
                        ? `1.5px solid ${C.amber}`
                        : isAnswered
                          ? `1px solid ${C.teal}`
                          : `1px solid ${C.line}`,
                    background: isMarked
                      ? C.amberDim
                      : isAnswered
                        ? C.tealDim
                        : C.panelSoft,
                    color: isMarked ? C.amber : isAnswered ? C.teal : C.muted,
                    fontFamily: "Fira Code",
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 16,
              display: "grid",
              gap: 8,
              fontSize: 11.5,
              fontFamily: "Outfit",
              color: C.muted,
            }}
          >
            <Legend color={C.tealDim} border={C.teal} label="Answered" />
            <Legend color={C.amberDim} border={C.amber} label="Marked for review" />
            <Legend color={C.panelSoft} border={C.line} label="Not visited / blank" />
          </div>
          <button
            type="button"
            onClick={() => setConfirmSubmit(true)}
            style={{ ...primaryBtn, width: "100%", marginTop: 18, justify: "center" }}
          >
            <Flag size={14} /> Submit paper
          </button>
        </aside>

        <main
          style={{
            padding: "22px 28px 18px",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                fontFamily: "Fira Code",
                fontSize: 12,
                color: C.muted,
                fontWeight: 700,
              }}
            >
              Question {index + 1} of {questions.length}
            </div>
            {marked[current.id] && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: C.amber,
                  fontFamily: "Outfit",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <Bookmark size={13} /> Marked for review
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22 }}
            >
              <h2
                style={{
                  margin: "0 0 22px",
                  fontFamily: "Outfit",
                  fontSize: "clamp(18px, 2.4vw, 24px)",
                  fontWeight: 800,
                  lineHeight: 1.4,
                  color: C.text,
                }}
              >
                {current.prompt}
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {current.options.map((opt, oi) => {
                  const selected = answers[current.id] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => selectOption(oi)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        textAlign: "left",
                        padding: "14px 16px",
                        borderRadius: 14,
                        border: selected
                          ? `1.5px solid ${C.teal}`
                          : `1px solid ${C.line}`,
                        background: selected ? C.tealDim : C.panel,
                        color: C.text,
                        cursor: "pointer",
                        fontFamily: "Outfit",
                        fontSize: 15,
                        lineHeight: 1.45,
                        boxShadow: selected
                          ? "none"
                          : "0 1px 2px rgba(15,23,42,0.04)",
                      }}
                    >
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 9,
                          flexShrink: 0,
                          display: "grid",
                          placeItems: "center",
                          background: selected ? C.teal : "rgba(15,23,42,0.06)",
                          color: selected ? "#ffffff" : C.muted,
                          fontFamily: "Fira Code",
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {letters[oi] || oi + 1}
                      </span>
                      <span style={{ paddingTop: 3 }}>{opt}</span>
                      {selected && (
                        <CheckCircle2
                          size={16}
                          color={C.teal}
                          style={{ marginLeft: "auto", marginTop: 4 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div
            style={{
              marginTop: "auto",
              paddingTop: 20,
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              borderTop: `1px solid ${C.line}`,
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={clearAnswer} style={ghostBtn}>
                <Eraser size={14} /> Clear
              </button>
              <button type="button" onClick={toggleMark} style={ghostBtn}>
                <Bookmark size={14} /> {marked[current.id] ? "Unmark" : "Mark"}
              </button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={goPrev}
                disabled={index === 0}
                style={{ ...ghostBtn, opacity: index === 0 ? 0.45 : 1 }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button type="button" onClick={goNext} style={primaryBtn}>
                {index === questions.length - 1 ? (
                  <>
                    Review & submit <Flag size={14} />
                  </>
                ) : (
                  <>
                    Save & next <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>

      <AnimatePresence>
        {confirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={modalBackdrop}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              style={modalCard}
            >
              <h3
                style={{
                  margin: "0 0 8px",
                  fontFamily: "Outfit",
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.text,
                }}
              >
                Submit this paper?
              </h3>
              <p
                style={{
                  margin: "0 0 16px",
                  color: C.muted,
                  fontFamily: "Outfit",
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                Answered {answeredCount} of {questions.length}
                {questions.length - answeredCount > 0
                  ? ` · ${questions.length - answeredCount} still blank`
                  : " · all answered"}
                {markedCount > 0 ? ` · ${markedCount} marked for review` : ""}.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setConfirmSubmit(false)}
                  style={ghostBtn}
                >
                  Keep attempting
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={submitNow}
                  style={primaryBtn}
                >
                  {submitting ? "Submitting…" : "Submit now"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "amber" | "rose";
}) {
  const bg =
    tone === "amber"
      ? C.amberDim
      : tone === "rose"
        ? "rgba(225,29,72,0.1)"
        : C.panelSoft;
  const color =
    tone === "amber" ? C.amber : tone === "rose" ? C.rose : C.text;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 11px",
        borderRadius: 999,
        background: bg,
        border: `1px solid ${C.line}`,
        fontFamily: "Outfit",
        fontSize: 12,
        fontWeight: 700,
        color,
      }}
    >
      {children}
    </span>
  );
}

function Legend({
  color,
  border,
  label,
}: {
  color: string;
  border: string;
  label: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 4,
          background: color,
          border: `1px solid ${border}`,
        }}
      />
      {label}
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 14px",
  borderRadius: 12,
  border: `1px solid ${C.line}`,
  background: C.panel,
  color: C.text,
  fontFamily: "Outfit",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};

const primaryBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "10px 16px",
  borderRadius: 12,
  border: "none",
  background: `linear-gradient(135deg, ${C.teal}, #0284c7)`,
  color: "#ffffff",
  fontFamily: "Outfit",
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer",
};

const modalBackdrop: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.35)",
  display: "grid",
  placeItems: "center",
  zIndex: 1300,
  padding: 16,
};

const modalCard: React.CSSProperties = {
  width: "min(420px, 100%)",
  padding: 22,
  borderRadius: 18,
  background: C.panel,
  border: `1px solid ${C.line}`,
  boxShadow: "0 20px 50px rgba(15,23,42,0.12)",
};
