"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Maximize,
  Monitor,
  ShieldAlert,
  X,
} from "lucide-react";
import AnswerReview, { type AnswerReviewPayload } from "./AnswerReview";
import { Alert, Badge, Button, Card, Checkbox, IconButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useScrollLock } from "@/hooks/useOverlay";

const MAX_VIOLATIONS = 3;
const GRACE_MS = 2500;

/**
 * Proctoring (clipboard block, tab/blur violations, fullscreen required).
 * Disabled for local testing. Set NEXT_PUBLIC_ASSESSMENT_PROCTORING=true to re-enable.
 */
const PROCTORING_ENABLED =
  process.env.NEXT_PUBLIC_ASSESSMENT_PROCTORING === "true";

export type ProctorViolation = { kind: string; at: string };

export type PreviousAttempt = {
  id?: string;
  passed: boolean;
  score: number;
  type?: string;
  assessmentId?: string | null;
  createdAt?: string | Date;
};

type Phase = "guidelines" | "starting" | "active";

export default function AssessmentShell({
  title,
  timeLimitMinutes,
  assessmentType,
  passScore = 70,
  previousAttempts = [],
  answerReview = null,
  onClose,
  onFailProctor,
  children,
}: {
  title: string;
  timeLimitMinutes: number;
  assessmentType: "mcq" | "coding";
  passScore?: number;
  previousAttempts?: PreviousAttempt[];
  answerReview?: AnswerReviewPayload | null;
  onClose: () => void;
  onFailProctor: (violations: ProctorViolation[]) => void;
  children: (ctx: {
    violations: ProctorViolation[];
    secondsLeft: number;
    requestClose: () => void;
  }) => React.ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>("guidelines");
  const [fsReady, setFsReady] = useState(false);
  const [fsError, setFsError] = useState("");
  const [ack, setAck] = useState(false);
  const [violations, setViolations] = useState<ProctorViolation[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes * 60);
  const [countdown, setCountdown] = useState(3);

  const failedRef = useRef(false);
  const violationsRef = useRef<ProctorViolation[]>([]);
  const armedRef = useRef(false);
  const graceUntilRef = useRef(0);
  const shellRef = useRef<HTMLDivElement>(null);

  const pushViolation = useCallback(
    (kind: string) => {
      if (!PROCTORING_ENABLED) return;
      if (failedRef.current || !armedRef.current) return;
      if (Date.now() < graceUntilRef.current) return;

      // Ignore duplicate rapid-fire same kind within 800ms
      const last = violationsRef.current[violationsRef.current.length - 1];
      if (
        last &&
        last.kind === kind &&
        Date.now() - new Date(last.at).getTime() < 800
      ) {
        return;
      }

      const next = [
        ...violationsRef.current,
        { kind, at: new Date().toISOString() },
      ];
      violationsRef.current = next;
      setViolations(next);
      if (next.length >= MAX_VIOLATIONS) {
        failedRef.current = true;
        armedRef.current = false;
        onFailProctor(next);
      }
    },
    [onFailProctor],
  );

  const enterFullscreen = useCallback(async () => {
    setFsError("");
    try {
      const el = shellRef.current || document.documentElement;
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      }
      setFsReady(Boolean(document.fullscreenElement));
    } catch {
      setFsReady(false);
      setFsError(
        "Fullscreen was blocked. Allow fullscreen for this site, then click again.",
      );
    }
  }, []);

  useEffect(() => {
    const onFs = () => setFsReady(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // Proctoring only while active (skipped in testing mode)
  useEffect(() => {
    if (phase !== "active") return;
    if (!PROCTORING_ENABLED) {
      armedRef.current = false;
      const timer = window.setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            window.clearInterval(timer);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      return () => window.clearInterval(timer);
    }

    armedRef.current = true;
    graceUntilRef.current = Date.now() + GRACE_MS;

    const blockClipboard = (e: Event) => {
      e.preventDefault();
      pushViolation("clipboard_blocked");
    };
    const onVis = () => {
      if (document.hidden) pushViolation("tab_switch");
    };
    const onBlur = () => {
      // Ignore blur while focusing inside the shell (e.g. editor)
      const active = document.activeElement;
      if (shellRef.current?.contains(active)) return;
      pushViolation("window_blur");
    };
    const onFs = () => {
      if (!document.fullscreenElement) pushViolation("left_fullscreen");
    };

    document.addEventListener("copy", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    document.addEventListener("paste", blockClipboard);
    document.addEventListener("contextmenu", blockClipboard);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFs);

    const timer = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timer);
          if (!failedRef.current) {
            failedRef.current = true;
            armedRef.current = false;
            onFailProctor([
              ...violationsRef.current,
              { kind: "time_up", at: new Date().toISOString() },
            ]);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      armedRef.current = false;
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
      document.removeEventListener("contextmenu", blockClipboard);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFs);
      window.clearInterval(timer);
    };
  }, [phase, onFailProctor, pushViolation]);

  // 3-2-1 countdown after ready
  useEffect(() => {
    if (phase !== "starting") return;
    setCountdown(3);
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(id);
          setPhase("active");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    onClose();
  };

  const canStart = PROCTORING_ENABLED ? ack && fsReady : ack;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  useScrollLock(true);

  return (
    <div
      ref={shellRef}
      data-app-overlay
      className={cn(
        "nokey fixed inset-0 z-[var(--z-fullscreen)] flex flex-col bg-canvas text-ink",
      )}
      style={{
        userSelect: phase === "active" && PROCTORING_ENABLED ? "none" : "auto",
      }}
    >
      <header
        className={cn(
          "flex h-14 shrink-0 items-center justify-between border-b border-line bg-[var(--overlay-bg)] px-3 backdrop-blur-xl sm:h-16 sm:px-5",
          assessmentType === "coding" && phase === "active" && "hidden min-[900px]:flex",
        )}
      >
        <div className="flex min-w-0 items-center gap-2 pr-2">
          <Badge
            tone={
              phase === "active"
                ? PROCTORING_ENABLED
                  ? "error"
                  : "success"
                : "accent"
            }
            className="shrink-0"
          >
            {phase === "active"
              ? PROCTORING_ENABLED
                ? "Proctored"
                : "Practice"
              : "Setup"}
          </Badge>
          <h1 className="type-h4 m-0 truncate">{title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {phase === "active" && (
            <>
              <div
                className={cn(
                  "type-numeric rounded-full border px-2.5 py-1 text-sm font-bold",
                  secondsLeft < 60
                    ? "border-danger/30 bg-danger-soft text-danger"
                    : "border-line bg-sunken text-ink",
                )}
              >
                {mm}:{ss}
              </div>
              {PROCTORING_ENABLED && (
                <div
                  className={cn(
                    "hidden items-center gap-1.5 type-small sm:flex",
                    violations.length ? "text-danger" : "text-muted",
                  )}
                >
                  <ShieldAlert size={16} />
                  {violations.length}/{MAX_VIOLATIONS}
                </div>
              )}
            </>
          )}
          <IconButton label="Exit" variant="ghost" size="sm" onClick={handleClose}>
            <X size={18} />
          </IconButton>
        </div>
      </header>

      {phase === "active" && violations.length > 0 && (
        <Alert tone="error" title="Proctoring alert">
          {violations[violations.length - 1]?.kind.replace(/_/g, " ")}.{" "}
          {Math.max(0, MAX_VIOLATIONS - violations.length)} warning(s) left before auto-fail.
        </Alert>
      )}

      {phase === "guidelines" && (
        <div className="flex flex-1 items-center justify-center overflow-auto p-6">
          <Card className="w-full max-w-[560px]">
            <div className="mb-4 flex items-center gap-2.5">
              <Monitor size={22} className="text-primary" />
              <h2 className="type-h3 m-0">Before you start</h2>
            </div>
            <p className="type-small mt-0 text-muted">
              This is a {assessmentType === "coding" ? "coding" : "MCQ"} assessment (
              {timeLimitMinutes} min, pass mark {passScore}%). Proctoring starts only after you
              confirm the environment is ready.
            </p>

            {previousAttempts.length > 0 && (
              <div className="mb-[18px] rounded-[var(--radius-md)] border border-line bg-sunken p-3.5">
                <div className="type-label mb-2">Previous scores for this assessment</div>
                {previousAttempts.slice(0, 5).map((a, i) => {
                  const when = a.createdAt
                    ? new Date(a.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : `Attempt ${previousAttempts.length - i}`;
                  return (
                    <div
                      key={a.id || i}
                      className={cn(
                        "flex items-center justify-between py-1.5 type-small text-muted",
                        i ? "border-t border-line" : "",
                      )}
                    >
                      <span>
                        {when}
                        {a.passed ? " · passed" : " · failed"}
                      </span>
                      <strong
                        className={cn(
                          "type-h4",
                          a.passed ? "text-success" : "text-danger",
                        )}
                      >
                        {a.score}%
                      </strong>
                    </div>
                  );
                })}
                <div className="type-caption mt-2 text-muted">
                  Best so far:{" "}
                  <strong className="text-ink">
                    {Math.max(...previousAttempts.map((a) => a.score), 0)}%
                  </strong>
                </div>
              </div>
            )}

            {answerReview && <AnswerReview review={answerReview} />}

            <ul className="type-body mb-5 list-disc pl-[18px] text-ink">
              {PROCTORING_ENABLED ? (
                <>
                  <li>Stay in fullscreen for the whole attempt</li>
                  <li>Do not switch tabs or leave this window</li>
                  <li>Copy, paste, and right-click are disabled during the exam</li>
                  <li>{MAX_VIOLATIONS} proctoring violations = automatic fail</li>
                  <li>Close extra apps/notifications that may steal focus</li>
                </>
              ) : (
                <>
                  <li>
                    <strong>Practice mode</strong> — copy, paste, and right-click are allowed
                  </li>
                  <li>No proctoring violations are recorded</li>
                  <li>Fullscreen is optional</li>
                  <li>Timer still runs for pacing practice</li>
                </>
              )}
            </ul>

            {PROCTORING_ENABLED && (
              <Button
                type="button"
                variant={fsReady ? "secondary" : "outline"}
                className="mb-3 w-full"
                onClick={enterFullscreen}
              >
                {fsReady ? <CheckCircle2 size={18} /> : <Maximize size={18} />}
                {fsReady ? "Fullscreen ready" : "Enter fullscreen"}
              </Button>
            )}

            {PROCTORING_ENABLED && fsError && (
              <p className="type-small m-0 text-danger">{fsError}</p>
            )}

            <Checkbox
              checked={ack}
              onChange={setAck}
              label={
                <>
                  I have read the guidelines and my environment is ready
                  {PROCTORING_ENABLED
                    ? " (fullscreen on, no other tabs needed)."
                    : " (practice mode — copy/paste allowed)."}
                </>
              }
              className="mb-4"
            />

            <Button
              type="button"
              disabled={!canStart}
              className="w-full"
              onClick={() => {
                if (PROCTORING_ENABLED && !document.fullscreenElement) {
                  void enterFullscreen().then(() => {
                    if (document.fullscreenElement) setPhase("starting");
                  });
                  return;
                }
                setPhase("starting");
              }}
            >
              Start assessment
            </Button>
          </Card>
        </div>
      )}

      {phase === "starting" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="type-numeric text-[72px] font-extrabold text-primary">
            {countdown || "Go"}
          </div>
          <p className="type-body text-muted">Proctoring begins now — stay focused</p>
        </div>
      )}

      {phase === "active" && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          {children({ violations, secondsLeft, requestClose: handleClose })}
        </div>
      )}
    </div>
  );
}
