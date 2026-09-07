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
import { Badge, Button, Dialog } from "@/components/ui";
import { cn } from "@/lib/cn";

type Status = "idle" | "answered" | "marked" | "marked_answered";

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
    return <div className="p-6 type-body text-muted">No MCQ questions in this assessment.</div>;
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
    <div className="flex h-full min-h-0 flex-1 flex-col bg-canvas">
      <div className="flex flex-wrap gap-2.5 border-b border-line bg-surface/85 px-[18px] py-2.5">
        <Badge>
          Answered {answeredCount}/{questions.length}
        </Badge>
        {markedCount > 0 && <Badge tone="warning">Marked {markedCount}</Badge>}
        <Badge>Pass mark {assessment.passScore}%</Badge>
        <Badge tone={secondsLeft !== undefined && secondsLeft <= 60 ? "error" : "neutral"}>
          One question at a time · use the map to jump
        </Badge>
      </div>

      <div
        className="grid min-h-0 flex-1"
        style={{
          gridTemplateColumns: narrow ? "1fr" : "minmax(200px, 240px) 1fr",
          gridTemplateRows: narrow ? "auto 1fr" : undefined,
        }}
      >
        <aside
          className={cn(
            "overflow-auto bg-surface/80 p-4",
            narrow ? "max-h-[180px] border-b border-line" : "border-r border-line",
          )}
        >
          <div className="type-label mb-2.5 text-ink">Question map</div>
          <div className="grid grid-cols-5 gap-2">
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
                  className={cn(
                    "type-numeric h-9 rounded-[var(--radius-md)] text-xs font-extrabold",
                    active && "border-2 border-primary",
                    !active && isMarked && "border-[1.5px] border-warning bg-warning-soft text-warning",
                    !active && !isMarked && isAnswered && "border border-primary bg-primary-soft text-primary",
                    !active && !isMarked && !isAnswered && "border border-line bg-sunken text-muted",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="type-caption mt-4 grid gap-2 text-muted">
            <Legend className="bg-primary-soft border-primary" label="Answered" />
            <Legend className="bg-warning-soft border-warning" label="Marked for review" />
            <Legend className="bg-sunken border-line" label="Not visited / blank" />
          </div>
          <Button className="mt-[18px] w-full" onClick={() => setConfirmSubmit(true)}>
            <Flag size={14} /> Submit paper
          </Button>
        </aside>

        <main className="flex min-w-0 flex-col overflow-auto px-7 py-[22px] pb-[18px]">
          <div className="mb-3.5 flex justify-between gap-3">
            <div className="type-caption type-numeric font-bold text-muted">
              Question {index + 1} of {questions.length}
            </div>
            {marked[current.id] && (
              <div className="type-caption inline-flex items-center gap-1.5 font-bold text-warning">
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
              <h2 className="type-h3 mb-[22px] text-ink">{current.prompt}</h2>

              <div className="flex flex-col gap-2.5">
                {current.options.map((opt, oi) => {
                  const selected = answers[current.id] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => selectOption(oi)}
                      className={cn(
                        "flex items-start gap-3.5 rounded-[var(--radius-lg)] px-4 py-3.5 text-left type-body text-ink",
                        selected
                          ? "border-[1.5px] border-primary bg-primary-soft"
                          : "border border-line bg-surface shadow-[var(--shadow-xs)]",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-[9px] type-caption font-extrabold",
                          selected
                            ? "bg-primary text-on-primary"
                            : "bg-sunken text-muted",
                        )}
                      >
                        {letters[oi] || oi + 1}
                      </span>
                      <span className="pt-0.5">{opt}</span>
                      {selected && (
                        <CheckCircle2 size={16} className="mt-1 ml-auto text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-auto flex flex-wrap justify-between gap-3 border-t border-line pt-5">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={clearAnswer}>
                <Eraser size={14} /> Clear
              </Button>
              <Button variant="secondary" size="sm" onClick={toggleMark}>
                <Bookmark size={14} /> {marked[current.id] ? "Unmark" : "Mark"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={goPrev} disabled={index === 0}>
                <ChevronLeft size={16} /> Prev
              </Button>
              <Button size="sm" onClick={goNext}>
                {index === questions.length - 1 ? (
                  <>
                    Review & submit <Flag size={14} />
                  </>
                ) : (
                  <>
                    Save & next <ChevronRight size={16} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>

      <Dialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        title="Submit this paper?"
        description={`Answered ${answeredCount} of ${questions.length}${
          questions.length - answeredCount > 0
            ? ` · ${questions.length - answeredCount} still blank`
            : " · all answered"
        }${markedCount > 0 ? ` · ${markedCount} marked for review` : ""}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmSubmit(false)}>
              Keep attempting
            </Button>
            <Button loading={submitting} onClick={submitNow}>
              {submitting ? "Submitting…" : "Submit now"}
            </Button>
          </>
        }
      />
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-3.5 w-3.5 rounded border", className)} />
      {label}
    </div>
  );
}
