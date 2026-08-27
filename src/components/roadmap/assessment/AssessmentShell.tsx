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

  return (
    <div
      ref={shellRef}
      className="nokey"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background:
          assessmentType === "coding" && phase === "active"
            ? "#1a1a1a"
            : "var(--bg-main)",
        color:
          assessmentType === "coding" && phase === "active"
            ? "#eff1f6"
            : "var(--text-main)",
        display: "flex",
        flexDirection: "column",
        userSelect:
          phase === "active" && PROCTORING_ENABLED ? "none" : "auto",
      }}
    >
      {/* Darker chrome for coding workspace */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border-light)",
          background:
            assessmentType === "coding" && phase === "active"
              ? "#1a1a1a"
              : "var(--bg-card)",
          color:
            assessmentType === "coding" && phase === "active"
              ? "#eff1f6"
              : undefined,
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Fira Code",
              fontSize: 11,
              color: phase === "active"
                ? PROCTORING_ENABLED
                  ? "#ef4444"
                  : "#2cbb5d"
                : "#6c63ff",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {phase === "active"
              ? PROCTORING_ENABLED
                ? "PROCTORED ASSESSMENT"
                : "PRACTICE MODE"
              : "ASSESSMENT SETUP"}
          </div>
          <h1 style={{ margin: 0, fontFamily: "Outfit", fontSize: 18 }}>{title}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {phase === "active" && (
            <>
              <div
                style={{
                  fontFamily: "Fira Code",
                  fontWeight: 700,
                  color: secondsLeft < 60 ? "#ef4444" : "var(--text-main)",
                }}
              >
                {mm}:{ss}
              </div>
              {PROCTORING_ENABLED && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: violations.length ? "#ef4444" : "var(--text-muted)",
                    fontSize: 13,
                    fontFamily: "Outfit",
                  }}
                >
                  <ShieldAlert size={16} />
                  Violations {violations.length}/{MAX_VIOLATIONS}
                </div>
              )}
              {!PROCTORING_ENABLED && (
                <div
                  style={{
                    fontSize: 12,
                    fontFamily: "Outfit",
                    color: "#2cbb5d",
                    fontWeight: 600,
                  }}
                >
                  Copy/paste enabled · no violations
                </div>
              )}
            </>
          )}
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: "var(--bg-alt)",
              border: "1px solid var(--border-light)",
              borderRadius: 8,
              padding: 8,
              cursor: "pointer",
              color: "var(--text-main)",
            }}
            title="Exit"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {phase === "active" && violations.length > 0 && (
        <div
          style={{
            background: "rgba(239,68,68,0.12)",
            color: "#ef4444",
            padding: "8px 20px",
            fontSize: 13,
            fontFamily: "Inter",
          }}
        >
          Proctoring alert: {violations[violations.length - 1]?.kind.replace(/_/g, " ")}.{" "}
          {Math.max(0, MAX_VIOLATIONS - violations.length)} warning(s) left before
          auto-fail.
        </div>
      )}

      {phase === "guidelines" && (
        <div
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)",
              borderRadius: 16,
              padding: 28,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}
            >
              <Monitor size={22} color="#6c63ff" />
              <h2 style={{ margin: 0, fontFamily: "Outfit", fontSize: 22 }}>
                Before you start
              </h2>
            </div>
            <p
              style={{
                color: "var(--text-muted)",
                fontFamily: "Inter",
                fontSize: 14,
                lineHeight: 1.55,
                marginTop: 0,
              }}
            >
              This is a {assessmentType === "coding" ? "coding" : "MCQ"} assessment (
              {timeLimitMinutes} min, pass mark {passScore}%). Proctoring starts only after
              you confirm the environment is ready.
            </p>

            {previousAttempts.length > 0 && (
              <div
                style={{
                  marginBottom: 18,
                  padding: 14,
                  borderRadius: 12,
                  background: "var(--bg-alt)",
                  border: "1px solid var(--border-light)",
                }}
              >
                <div
                  style={{
                    fontFamily: "Outfit",
                    fontWeight: 700,
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Previous scores
                </div>
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
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 13,
                        fontFamily: "Inter",
                        color: "var(--text-muted)",
                        padding: "6px 0",
                        borderTop: i ? "1px solid var(--border-light)" : "none",
                      }}
                    >
                      <span>
                        {when}
                        {a.passed ? " · passed" : " · failed"}
                      </span>
                      <strong
                        style={{
                          fontFamily: "Outfit",
                          fontSize: 16,
                          color: a.passed ? "#059669" : "#ef4444",
                        }}
                      >
                        {a.score}%
                      </strong>
                    </div>
                  );
                })}
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    color: "var(--text-muted)",
                    fontFamily: "Inter",
                  }}
                >
                  Best so far:{" "}
                  <strong style={{ color: "var(--text-main)" }}>
                    {Math.max(...previousAttempts.map((a) => a.score), 0)}%
                  </strong>
                </div>
              </div>
            )}

            {answerReview && <AnswerReview review={answerReview} />}

            <ul
              style={{
                margin: "0 0 20px",
                paddingLeft: 18,
                color: "var(--text-main)",
                fontFamily: "Inter",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
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
              <button
                type="button"
                onClick={enterFullscreen}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: 14,
                  borderRadius: 10,
                  border: fsReady ? "1.5px solid #10b981" : "1.5px solid #6c63ff",
                  background: fsReady ? "rgba(16,185,129,0.12)" : "rgba(108,99,255,0.1)",
                  color: fsReady ? "#059669" : "#6c63ff",
                  fontFamily: "Outfit",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginBottom: 12,
                }}
              >
                {fsReady ? <CheckCircle2 size={18} /> : <Maximize size={18} />}
                {fsReady ? "Fullscreen ready" : "Enter fullscreen"}
              </button>
            )}

            {PROCTORING_ENABLED && fsError && (
              <p style={{ color: "#ef4444", fontSize: 13, marginTop: 0 }}>{fsError}</p>
            )}

            <label
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                fontSize: 13,
                color: "var(--text-muted)",
                fontFamily: "Inter",
                marginBottom: 16,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span>
                I have read the guidelines and my environment is ready
                {PROCTORING_ENABLED
                  ? " (fullscreen on, no other tabs needed)."
                  : " (practice mode — copy/paste allowed)."}
              </span>
            </label>

            <button
              type="button"
              disabled={!canStart}
              onClick={() => {
                if (PROCTORING_ENABLED && !document.fullscreenElement) {
                  void enterFullscreen().then(() => {
                    if (document.fullscreenElement) setPhase("starting");
                  });
                  return;
                }
                setPhase("starting");
              }}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 10,
                border: "none",
                background: canStart ? "#6c63ff" : "var(--bg-alt)",
                color: canStart ? "#fff" : "var(--text-muted)",
                fontFamily: "Outfit",
                fontWeight: 700,
                cursor: canStart ? "pointer" : "not-allowed",
              }}
            >
              Start assessment
            </button>
          </div>
        </div>
      )}

      {phase === "starting" && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: "Outfit",
              fontSize: 72,
              fontWeight: 800,
              color: "#6c63ff",
            }}
          >
            {countdown || "Go"}
          </div>
          <p style={{ color: "var(--text-muted)", fontFamily: "Inter" }}>
            Proctoring begins now — stay focused
          </p>
        </div>
      )}

      {phase === "active" && (
        <div
          style={{
            flex: 1,
            overflow: assessmentType === "coding" ? "hidden" : "auto",
            padding: assessmentType === "coding" ? 0 : 20,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children({ violations, secondsLeft })}
        </div>
      )}
    </div>
  );
}
