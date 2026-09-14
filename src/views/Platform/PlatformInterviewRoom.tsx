"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Camera,
  CameraOff,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Maximize,
  Mic,
  MicOff,
  Minimize2,
  Monitor,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import CodeEditor from "@/components/roadmap/assessment/CodeEditor";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  ErrorState,
  Field,
  FieldGroup,
  PageSpinner,
  Select,
  Switch,
  useToast,
} from "@/components/ui";
import { apiGet, apiSend } from "@/lib/api";
import {
  codingEditorShouldStayOpen,
  interviewerAskedToWriteAgain,
  interviewerInvitedCode,
  studentAskedToCheckCode,
} from "@/lib/ai/interview-code";
import { interviewReportPath, routes } from "@/lib/routes";
import type {
  InterviewIntegrityEvent,
  InterviewSessionPublic,
  InterviewTurnPublic,
} from "@/lib/ai/interview-types";
import {
  applyAudioOutput,
  attachLevelMonitor,
  createInterviewRecognition,
  isSpeechRecognitionSupported,
  listMediaDevices,
  loadInterviewMediaPrefs,
  openInterviewMedia,
  saveInterviewMediaPrefs,
  speakInterviewReply,
  stopMediaStream,
  type InterviewMediaPrefs,
  type InterviewRecognition,
  type LevelMonitor,
  type MediaDeviceOption,
} from "@/lib/ai/interview-voice";
import { cn } from "@/lib/cn";
import {
  isProctoringEnabled,
  MAX_PROCTOR_VIOLATIONS,
  PROCTOR_DEDUP_MS,
  PROCTOR_GRACE_MS,
} from "@/lib/proctoring";

const PROCTORING_ENABLED = isProctoringEnabled();

function formatClock(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function LevelMeter({ level, active }: { level: number; active: boolean }) {
  const bars = [0.08, 0.18, 0.32, 0.5, 0.7];
  return (
    <span className="inline-flex h-4 items-end gap-0.5" aria-hidden>
      {bars.map((threshold, i) => (
        <span
          key={threshold}
          className={cn(
            "w-1 rounded-sm transition-colors",
            active && level >= threshold
              ? "bg-[var(--primary)]"
              : "bg-[var(--border-light)]",
          )}
          style={{ height: `${8 + i * 3}px` }}
        />
      ))}
    </span>
  );
}

export default function PlatformInterviewRoom() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const toast = useToast();
  const [session, setSession] = useState<InterviewSessionPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [wrappingUp, setWrappingUp] = useState(false);
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [codeUnlocked, setCodeUnlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [agentLive, setAgentLive] = useState(false);
  const [listening, setListening] = useState(false);
  const [heardFinal, setHeardFinal] = useState("");
  const [heardInterim, setHeardInterim] = useState("");
  const [pendingSpeech, setPendingSpeech] = useState("");
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [micReady, setMicReady] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [speechOk, setSpeechOk] = useState(true);
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [prefs, setPrefs] = useState<InterviewMediaPrefs>(defaultPrefsSafe);
  const [audioInputs, setAudioInputs] = useState<MediaDeviceOption[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceOption[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceOption[]>([]);
  const [now, setNow] = useState(Date.now());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const roomRef = useRef<{
    disconnect: () => Promise<void>;
    switchActiveDevice?: (kind: "audioinput" | "videoinput" | "audiooutput", deviceId: string) => Promise<unknown>;
    localParticipant: {
      setMicrophoneEnabled: (v: boolean) => Promise<unknown>;
      setCameraEnabled: (v: boolean) => Promise<unknown>;
    };
  } | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<InterviewRecognition | null>(null);
  const stopLevelRef = useRef<LevelMonitor | null>(null);
  const listenFailsRef = useRef(0);
  const audioCaptureRecoveredRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const sendTextRef = useRef<(text: string, source?: "text" | "voice") => Promise<void>>(
    async () => undefined,
  );
  const committingRef = useRef(false);
  const openedRef = useRef(false);
  const keepCodeOpenRef = useRef(false);
  const [holdListen, setHoldListen] = useState(true);
  const [proctorPhase, setProctorPhase] = useState<"guidelines" | "starting" | "ready">(
    () => (PROCTORING_ENABLED ? "guidelines" : "ready"),
  );
  const [proctorAck, setProctorAck] = useState(!PROCTORING_ENABLED);
  const [fsReady, setFsReady] = useState(false);
  const [fsError, setFsError] = useState("");
  const [violations, setViolations] = useState<Array<{ kind: string; at: string }>>([]);
  const [countdown, setCountdown] = useState(3);
  const shellRef = useRef<HTMLDivElement>(null);
  const failedRef = useRef(false);
  const violationsRef = useRef<Array<{ kind: string; at: string }>>([]);
  const armedRef = useRef(false);
  const graceUntilRef = useRef(0);
  const finishRef = useRef<(opts?: { proctorFailed?: boolean }) => Promise<void>>(
    async () => undefined,
  );

  const load = useCallback(async () => {
    const res = await apiGet<{ session: InterviewSessionPublic }>(
      `/api/ai/interview/sessions/${id}`,
    );
    setSession(res.session);
    if (res.session.codeSnapshot) setCode(res.session.codeSnapshot);
    return res.session;
  }, [id]);

  useEffect(() => {
    setPrefs(loadInterviewMediaPrefs());
    setSpeechOk(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  useEffect(() => {
    load().catch((err: Error) => setError(err.message));
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (session?.status === "completed" && !wrappingUp && !ending) {
      router.replace(interviewReportPath(id));
    }
    if (session?.status === "aborted" && !wrappingUp && !ending) {
      router.replace(routes.app.interview);
    }
  }, [ending, id, router, session?.status, wrappingUp]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [session?.turns.length, heardInterim, pendingSpeech, sending, opening, listening, interviewerSpeaking]);

  useEffect(() => {
    if (!session || session.status !== "live" || openedRef.current) return;
    if (PROCTORING_ENABLED && proctorPhase !== "ready") return;
    if (session.turns.some((turn) => turn.role === "interviewer")) {
      openedRef.current = true;
      setHoldListen(false);
      return;
    }
    openedRef.current = true;
    setOpening(true);
    setHoldListen(true);
    setInterviewerSpeaking(true);
    const unlockListen = () => {
      window.setTimeout(() => {
        setInterviewerSpeaking(false);
        setOpening(false);
        setHoldListen(false);
      }, 500);
    };
    void apiSend<{ session: InterviewSessionPublic; reply: string }>(
      `/api/ai/interview/sessions/${id}/open`,
      "POST",
    )
      .then((res) => {
        setSession(res.session);
        if (res.session.codeSnapshot) setCode(res.session.codeSnapshot);
        if (res.session.mode === "voice" && prefsRef.current.speakReplies && res.reply) {
          speakInterviewReply(res.reply, {
            onStart: () => setInterviewerSpeaking(true),
            onEnd: unlockListen,
          });
          return;
        }
        unlockListen();
      })
      .catch((err: Error) => {
        openedRef.current = false;
        setInterviewerSpeaking(false);
        setOpening(false);
        setHoldListen(false);
        toast.error(err.message || "Could not start the interviewer.");
      });
  }, [id, session, toast, proctorPhase]);

  const elapsed = useMemo(() => {
    if (!session) return 0;
    return Math.max(0, Math.floor((now - new Date(session.startedAt).getTime()) / 1000));
  }, [now, session]);

  const remaining = session
    ? Math.max(0, session.durationMinutes * 60 - elapsed)
    : 0;

  useEffect(() => {
    if (!session?.plan.coding) return;
    const stayOpen =
      keepCodeOpenRef.current ||
      codingEditorShouldStayOpen(session.turns, session.plan.coding.title);
    setCodeUnlocked(stayOpen);
    if (!stayOpen) setShowCode(false);
  }, [session]);

  useEffect(() => {
    if (!session || session.status !== "live") return;
    if (proctorPhase !== "ready") return;

    if (!PROCTORING_ENABLED) {
      const onVis = () => {
        void apiSend(`/api/ai/interview/sessions/${id}/integrity`, "POST", {
          type: document.hidden ? "tab_hidden" : "tab_visible",
        }).catch(() => {});
      };
      const onPaste = () => {
        void apiSend(`/api/ai/interview/sessions/${id}/integrity`, "POST", {
          type: "paste",
        }).catch(() => {});
      };
      document.addEventListener("visibilitychange", onVis);
      window.addEventListener("paste", onPaste);
      return () => {
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("paste", onPaste);
      };
    }

    armedRef.current = true;
    graceUntilRef.current = Date.now() + PROCTOR_GRACE_MS;

    const post = (type: InterviewIntegrityEvent["type"]) => {
      void apiSend<{ failed?: boolean }>(
        `/api/ai/interview/sessions/${id}/integrity`,
        "POST",
        { type },
      )
        .then((res) => {
          if (res.failed && !failedRef.current) {
            failedRef.current = true;
            armedRef.current = false;
            void finishRef.current({ proctorFailed: true });
          }
        })
        .catch(() => {});
    };

    const pushViolation = (kind: InterviewIntegrityEvent["type"]) => {
      if (failedRef.current || !armedRef.current) return;
      if (Date.now() < graceUntilRef.current) return;
      const last = violationsRef.current[violationsRef.current.length - 1];
      if (
        last &&
        last.kind === kind &&
        Date.now() - new Date(last.at).getTime() < PROCTOR_DEDUP_MS
      ) {
        return;
      }
      const next = [
        ...violationsRef.current,
        { kind, at: new Date().toISOString() },
      ];
      violationsRef.current = next;
      setViolations(next);
      post(kind);
      if (next.length >= MAX_PROCTOR_VIOLATIONS) {
        failedRef.current = true;
        armedRef.current = false;
        void finishRef.current({ proctorFailed: true });
      }
    };

    const blockClipboard = (e: Event) => {
      e.preventDefault();
      pushViolation("clipboard_blocked");
    };
    const onVis = () => {
      if (document.hidden) pushViolation("tab_hidden");
    };
    const onBlur = () => {
      const active = document.activeElement;
      if (shellRef.current?.contains(active)) return;
      pushViolation("window_blur");
    };
    const onFs = () => {
      setFsReady(Boolean(document.fullscreenElement));
      if (!document.fullscreenElement) pushViolation("fullscreen_exit");
    };

    document.addEventListener("copy", blockClipboard);
    document.addEventListener("cut", blockClipboard);
    document.addEventListener("paste", blockClipboard);
    document.addEventListener("contextmenu", blockClipboard);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);
    document.addEventListener("fullscreenchange", onFs);

    return () => {
      armedRef.current = false;
      document.removeEventListener("copy", blockClipboard);
      document.removeEventListener("cut", blockClipboard);
      document.removeEventListener("paste", blockClipboard);
      document.removeEventListener("contextmenu", blockClipboard);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("fullscreenchange", onFs);
    };
  }, [id, session, proctorPhase]);

  const refreshDevices = useCallback(async () => {
    const next = await listMediaDevices();
    setAudioInputs(next.audioInputs);
    setVideoInputs(next.videoInputs);
    setAudioOutputs(next.audioOutputs);
  }, []);

  const startMedia = useCallback(
    async (nextPrefs: InterviewMediaPrefs, video: boolean) => {
      stopLevelRef.current?.stop();
      stopLevelRef.current = null;
      stopMediaStream(mediaRef.current);
      mediaRef.current = null;
      try {
        const stream = await openInterviewMedia(nextPrefs, { video });
        mediaRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stopLevelRef.current = attachLevelMonitor(stream, (level) => {
          setVoiceLevel(level);
          recognitionRef.current?.hearEnergy(level);
        });
        setMicReady(true);
        setMicError(null);
        await refreshDevices();
        await applyAudioOutput(remoteAudioRef.current, nextPrefs.audioOutputId);
        return stream;
      } catch {
        setMicReady(false);
        setMicError("Microphone or camera is blocked. Allow access, then open Settings.");
        throw new Error("media-denied");
      }
    },
    [refreshDevices],
  );

  useEffect(() => {
    if (!session || session.mode !== "voice" || session.status !== "live") return;
    if (PROCTORING_ENABLED && proctorPhase !== "ready") return;
    let cancelled = false;
    (async () => {
      try {
        await startMedia(prefsRef.current, camOn);
      } catch {
        if (!cancelled) toast.error("Microphone permission is required for voice interviews.");
      }
      if (cancelled || !session.livekitConfigured || !session.livekitRoom) return;
      try {
        const tokenRes = await apiSend<{
          token: string | null;
          url: string | null;
        }>(`/api/ai/interview/sessions/${id}/token`, "POST");
        if (!tokenRes.token || !tokenRes.url || cancelled) return;
        const { Room, RoomEvent, Track } = await import("livekit-client");
        const room = new Room();
        room.on(RoomEvent.ParticipantConnected, (p) => {
          const identity = p.identity || "";
          if (/agent|interview/i.test(identity)) setAgentLive(true);
        });
        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === "audio" && remoteAudioRef.current) {
            track.attach(remoteAudioRef.current);
            setAgentLive(true);
          }
        });
        room.on(RoomEvent.LocalTrackPublished, (pub) => {
          if (pub.source === Track.Source.Microphone) {
            void room.localParticipant.setMicrophoneEnabled(false);
          }
        });
        await room.connect(tokenRes.url, tokenRes.token);
        await room.localParticipant.setMicrophoneEnabled(false);
        await room.localParticipant.setCameraEnabled(camOn);
        roomRef.current = room;
        if (cancelled) await room.disconnect();
      } catch (err) {
        console.warn("[interview] LiveKit connect failed", err);
      }
    })();
    const onDeviceChange = () => void refreshDevices();
    navigator.mediaDevices?.addEventListener?.("devicechange", onDeviceChange);
    return () => {
      cancelled = true;
      navigator.mediaDevices?.removeEventListener?.("devicechange", onDeviceChange);
      void roomRef.current?.disconnect();
      roomRef.current = null;
      recognitionRef.current?.abort();
      stopLevelRef.current?.stop();
      stopLevelRef.current = null;
      stopMediaStream(mediaRef.current);
      mediaRef.current = null;
      window.speechSynthesis?.cancel();
    };
    // Media device switches are applied via updatePrefs, not by restarting this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, session?.id, session?.mode, session?.status, session?.livekitConfigured, session?.livekitRoom, toast, startMedia, refreshDevices, proctorPhase]);

  const updatePrefs = async (patch: Partial<InterviewMediaPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveInterviewMediaPrefs(next);
    const devicesChanged =
      patch.audioInputId !== undefined ||
      patch.videoInputId !== undefined ||
      patch.echoCancellation !== undefined ||
      patch.noiseSuppression !== undefined ||
      patch.autoGainControl !== undefined;
    if (session?.mode === "voice" && devicesChanged) {
      try {
        await startMedia(next, camOn);
        if (next.audioInputId) {
          await roomRef.current?.switchActiveDevice?.("audioinput", next.audioInputId);
        }
        if (next.videoInputId) {
          await roomRef.current?.switchActiveDevice?.("videoinput", next.videoInputId);
        }
      } catch {
        toast.error("Could not switch that device. Pick another in Settings.");
      }
    }
    if (patch.audioOutputId !== undefined) {
      await applyAudioOutput(remoteAudioRef.current, next.audioOutputId);
      if (next.audioOutputId) {
        await roomRef.current?.switchActiveDevice?.("audiooutput", next.audioOutputId);
      }
    }
  };

  const sendText = async (text: string, source: "text" | "voice" = "text") => {
    const message = text.trim();
    if (!message || sending || ending || checking) return;
    recognitionRef.current?.abort();
    setListening(false);
    const reviewing = studentAskedToCheckCode(message);
    if (reviewing) setChecking(true);
    setPendingSpeech(message);
    setSending(true);
    setHeardFinal("");
    setHeardInterim("");
    try {
      const res = await apiSend<{
        reply: string;
        showCode?: boolean;
        endInterview?: boolean;
        aborted?: boolean;
        coding?: InterviewSessionPublic["plan"]["coding"];
        turn: InterviewTurnPublic;
      }>(`/api/ai/interview/sessions/${id}/turn`, "POST", {
        message,
        source,
        code: code || undefined,
      });
      if (res.coding) {
        const prevSlug = session?.plan.coding?.slug;
        setSession((prev) =>
          prev ? { ...prev, plan: { ...prev.plan, coding: res.coding! } } : prev,
        );
        if (res.coding.slug !== prevSlug) {
          setCode(res.coding.starterCode || "");
        }
      }
      const writeAgain = interviewerAskedToWriteAgain(res.reply);
      const invited =
        !reviewing &&
        (res.showCode ||
          interviewerInvitedCode(res.reply, res.coding?.title || session?.plan.coding?.title));
      if (reviewing && !writeAgain) {
        keepCodeOpenRef.current = false;
        setShowCode(false);
        setCodeUnlocked(false);
      } else if (invited || (reviewing && writeAgain)) {
        keepCodeOpenRef.current = true;
        setCodeUnlocked(true);
        setShowCode(true);
      }
      const shouldSpeak =
        session?.mode === "voice" && prefs.speakReplies && Boolean(res.reply);
      if (res.endInterview) {
        setWrappingUp(true);
        setHoldListen(true);
      }
      if (shouldSpeak) {
        setInterviewerSpeaking(true);
        setHoldListen(true);
        speakInterviewReply(res.reply, {
          onStart: () => setInterviewerSpeaking(true),
          onEnd: () => {
            if (res.endInterview) {
              window.setTimeout(() => {
                setEnding(true);
                router.push(res.aborted ? routes.app.interview : interviewReportPath(id));
              }, 600);
              return;
            }
            window.setTimeout(() => {
              setInterviewerSpeaking(false);
              setHoldListen(false);
            }, 400);
          },
        });
      }
      await load();
      setPendingSpeech("");
      if (res.endInterview && !shouldSpeak) {
        setEnding(true);
        router.push(res.aborted ? routes.app.interview : interviewReportPath(id));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send");
    } finally {
      setSending(false);
      setChecking(false);
    }
  };
  sendTextRef.current = sendText;

  const ensureRecognition = useCallback(() => {
    if (recognitionRef.current) return recognitionRef.current;
    const rec = createInterviewRecognition({
      onTranscript: (finalText, interimText) => {
        setHeardFinal(finalText);
        setHeardInterim(interimText);
      },
      onCommit: (text) => {
        setPendingSpeech(text);
        setHeardFinal("");
        setHeardInterim("");
        if (committingRef.current) return;
        committingRef.current = true;
        recognitionRef.current?.abort();
        setListening(false);
        void sendTextRef.current(text, "voice").finally(() => {
          committingRef.current = false;
        });
      },
      onError: (message) => {
        if (/busy or unavailable/i.test(message) && !audioCaptureRecoveredRef.current) {
          audioCaptureRecoveredRef.current = true;
          mediaRef.current?.getAudioTracks().forEach((track) => track.stop());
          stopLevelRef.current?.stop();
          stopLevelRef.current = null;
          setVoiceLevel(0);
          setListening(false);
          setMicError(null);
          return;
        }
        setListening(false);
        setMicError(message);
        toast.error(message);
      },
    });
    recognitionRef.current = rec;
    return rec;
  }, [toast]);

  const startListening = useCallback(async () => {
    if (!speechOk) return;
    if (!micReady) {
      try {
        await startMedia(prefsRef.current, camOn);
      } catch {
        return;
      }
    }
    const rec = ensureRecognition();
    if (!rec) {
      setSpeechOk(false);
      return;
    }
    setMicError(null);
    stopLevelRef.current?.resume();
    const started = rec.start();
    setListening(started);
    if (started) {
      listenFailsRef.current = 0;
      return;
    }
    listenFailsRef.current += 1;
    if (listenFailsRef.current >= 8) {
      setMicError("Could not start the microphone. Click the mic button, then allow access.");
    }
  }, [camOn, ensureRecognition, micReady, speechOk, startMedia]);

  const toggleMic = async () => {
    const next = !micOn;
    setMicOn(next);
    if (next) {
      listenFailsRef.current = 0;
      setMicError(null);
      await roomRef.current?.localParticipant.setMicrophoneEnabled(false);
      void startListening();
      return;
    }
    recognitionRef.current?.abort();
    setListening(false);
    await roomRef.current?.localParticipant.setMicrophoneEnabled(false);
  };

  useEffect(() => {
    if (!session || session.mode !== "voice" || session.status !== "live") return;
    const shouldListen =
      prefs.autoListen &&
      micOn &&
      micReady &&
      speechOk &&
      !micError &&
      !sending &&
      !checking &&
      !ending &&
      !wrappingUp &&
      !interviewerSpeaking &&
      !holdListen &&
      !settingsOpen &&
      !opening;
    if (!shouldListen) {
      if (sending || checking || ending || wrappingUp || interviewerSpeaking || holdListen || opening || !micOn) {
        recognitionRef.current?.abort();
        setListening(false);
      }
      return;
    }
    if (listening) return;
    const retry = window.setTimeout(() => {
      void startListening();
    }, 280);
    return () => window.clearTimeout(retry);
  }, [
    interviewerSpeaking,
    holdListen,
    listening,
    micError,
    micOn,
    micReady,
    prefs.autoListen,
    sending,
    checking,
    ending,
    wrappingUp,
    opening,
    session,
    settingsOpen,
    speechOk,
    startListening,
  ]);

  const finish = async (opts?: { proctorFailed?: boolean }) => {
    if (ending) return;
    setEnding(true);
    recognitionRef.current?.abort();
    setListening(false);
    window.speechSynthesis?.cancel();
    try {
      if (code.trim() && !opts?.proctorFailed) {
        await apiSend(`/api/ai/interview/sessions/${id}/code`, "POST", { code });
      }
      const q = opts?.proctorFailed ? "?proctor=1" : "";
      await apiSend(`/api/ai/interview/sessions/${id}/finish${q}`, "POST");
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
      router.push(interviewReportPath(id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not finish");
      setEnding(false);
    }
  };
  finishRef.current = finish;

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

  useEffect(() => {
    if (proctorPhase !== "starting") return;
    setCountdown(3);
    const timer = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(timer);
          setProctorPhase("ready");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [proctorPhase]);

  if (error) {
    return <ErrorState title="Interview unavailable" description={error} />;
  }
  if (!session) return <PageSpinner label="Joining interview" />;

  if (session.status === "completed" && !wrappingUp && !ending) {
    return <PageSpinner label="Opening report" />;
  }

  const liveHeard = [heardFinal, heardInterim].filter(Boolean).join(" ");
  const userSpeaking =
    micOn && listening && (voiceLevel > 0.045 || heardInterim.length > 0);
  const awaitingStart =
    session.plan.phase === "briefing" ||
    (session.plan.phase !== "live" &&
      !session.turns.some((turn) => turn.role === "student"));
  const chatStatus = ending
    ? "Ending interview…"
    : wrappingUp
      ? "Interviewer is wrapping up…"
    : checking
      ? "Checking your code…"
    : opening && session.turns.length === 0
      ? "Interviewer is joining…"
      : interviewerSpeaking
        ? "Interviewer speaking…"
        : sending
          ? "Thinking…"
          : userSpeaking
            ? "Hearing you…"
            : listening
              ? "Listening…"
              : session.plan.awaitingEndConfirm
                ? "Say yes to end, or no to continue"
              : awaitingStart
                ? 'Say "start interview" when you are ready'
              : micError
                ? micError
                : !speechOk && session.mode === "voice"
                  ? "Voice unavailable — check microphone permissions."
                  : !micOn && session.mode === "voice"
                    ? "Mic muted"
                    : "";
  const showChatDots =
    opening || sending || checking || interviewerSpeaking || listening || userSpeaking || ending || wrappingUp;

  return (
    <div
      ref={shellRef}
      className="interview-stage fixed inset-0 flex flex-col overflow-hidden"
      style={{
        zIndex: "var(--z-fullscreen)",
        userSelect:
          PROCTORING_ENABLED && proctorPhase === "ready" ? "none" : "auto",
        ["--iv-level" as string]: userSpeaking
          ? String(Math.min(1, voiceLevel * 1.35))
          : "0",
      }}
      data-speaking={userSpeaking ? "true" : "false"}
      data-ai={interviewerSpeaking ? "true" : "false"}
    >
      <audio ref={remoteAudioRef} autoPlay className="sr-only" />
      {ending ? <InterviewEndLoader /> : null}

      {PROCTORING_ENABLED && proctorPhase !== "ready" ? (
        <div className="relative z-20 flex flex-1 items-center justify-center overflow-auto p-6">
          {proctorPhase === "starting" ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="type-numeric text-[72px] font-extrabold text-[var(--primary)]">
                {countdown || "Go"}
              </div>
              <p className="type-body text-[var(--iv-muted)]">
                Proctoring begins now — stay in fullscreen
              </p>
            </div>
          ) : (
            <Card className="w-full max-w-[560px]">
              <div className="mb-4 flex items-center gap-2.5">
                <Monitor size={22} className="text-primary" />
                <h2 className="type-h3 m-0">Before you start</h2>
              </div>
              <p className="type-small mt-0 text-muted">
                This is a proctored {session.plan.purpose === "roadmap_final" ? "certification" : "practice"}{" "}
                interview ({session.durationMinutes} min). Proctoring starts only after you
                confirm the environment is ready.
              </p>
              <ul className="type-body mb-5 list-disc pl-[18px] text-ink">
                <li>Stay in fullscreen for the whole interview</li>
                <li>Do not switch tabs or leave this window</li>
                <li>Copy, paste, and right-click are disabled</li>
                <li>{MAX_PROCTOR_VIOLATIONS} proctoring violations = automatic fail</li>
                <li>Close extra apps/notifications that may steal focus</li>
              </ul>
              <Button
                type="button"
                variant={fsReady ? "secondary" : "outline"}
                className="mb-3 w-full"
                onClick={() => void enterFullscreen()}
              >
                {fsReady ? <CheckCircle2 size={18} /> : <Maximize size={18} />}
                {fsReady ? "Fullscreen ready" : "Enter fullscreen"}
              </Button>
              {fsError ? <p className="type-small m-0 text-danger">{fsError}</p> : null}
              <Checkbox
                checked={proctorAck}
                onChange={setProctorAck}
                label="I have read the guidelines and my environment is ready (fullscreen on, no other tabs needed)."
                className="mb-4"
              />
              <Button
                type="button"
                disabled={!proctorAck || !fsReady}
                className="w-full"
                onClick={() => {
                  if (!document.fullscreenElement) {
                    void enterFullscreen().then(() => {
                      if (document.fullscreenElement) setProctorPhase("starting");
                    });
                    return;
                  }
                  setProctorPhase("starting");
                }}
              >
                Start interview
              </Button>
            </Card>
          )}
        </div>
      ) : (
        <>
      <header className="relative z-10 flex shrink-0 items-center justify-between px-5 pt-5 sm:px-8">
        <div className="inline-flex items-center gap-2 text-sm text-[var(--iv-muted)]">
          <Clock
            size={15}
            className={
              remaining <= 0
                ? "text-[var(--iv-muted)]"
                : remaining < 60
                  ? "text-[var(--error)]"
                  : "text-[var(--success)]"
            }
          />
          <span className="tabular-nums">{formatClock(elapsed)}</span>
          {PROCTORING_ENABLED ? (
            <Badge tone="error" className="ml-2">
              Proctored
            </Badge>
          ) : null}
          {PROCTORING_ENABLED ? (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-sm",
                violations.length ? "text-[var(--error)]" : "",
              )}
            >
              <ShieldAlert size={15} />
              {violations.length}/{MAX_PROCTOR_VIOLATIONS}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void sendText("I'd like to end the interview", "text")}
          disabled={sending || ending}
          className="rounded-full border border-[var(--iv-line)] px-4 py-1.5 text-sm text-[var(--iv-ink)] transition-colors hover:border-[var(--error)] hover:text-[var(--error)] disabled:opacity-60"
        >
          {ending ? "Ending…" : "End interview"}
        </button>
      </header>

      {PROCTORING_ENABLED && violations.length > 0 ? (
        <div className="relative z-10 mx-5 mt-3 sm:mx-8">
          <Alert tone="error" title="Proctoring alert">
            {violations[violations.length - 1]?.kind.replace(/_/g, " ")}.{" "}
            {Math.max(0, MAX_PROCTOR_VIOLATIONS - violations.length)} warning(s)
            left before auto-fail.
          </Alert>
        </div>
      ) : null}

      <div className="relative z-10 mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_auto] items-stretch gap-6 overflow-hidden px-5 py-6 sm:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] lg:grid-rows-1 lg:gap-8">
        <div
          ref={logRef}
          className="interview-chat min-h-0 space-y-6 overflow-y-auto overscroll-contain pr-2"
        >
          {session.turns.map((turn) =>
            turn.role === "student" ? (
              <div key={turn.id} className="flex justify-end">
                <p className="m-0 max-w-[80%] rounded-2xl bg-[var(--iv-bubble)] px-4 py-2 text-[15px] leading-relaxed">
                  {turn.content}
                </p>
              </div>
            ) : (
              <p key={turn.id} className="m-0 max-w-xl text-[15px] leading-relaxed text-[var(--iv-muted)]">
                {turn.content}
              </p>
            ),
          )}
          {pendingSpeech &&
          session.turns.every(
            (turn) => turn.role !== "student" || turn.content !== pendingSpeech,
          ) ? (
            <div className="flex justify-end">
              <p className="m-0 max-w-[80%] rounded-2xl bg-[var(--iv-bubble)] px-4 py-2 text-[15px] leading-relaxed">
                {pendingSpeech}
              </p>
            </div>
          ) : null}
          {listening && liveHeard && liveHeard !== pendingSpeech ? (
            <div className="flex justify-end">
              <p className="m-0 max-w-[80%] rounded-2xl border border-dashed border-[var(--primary-border)] px-4 py-2 text-[15px] leading-relaxed text-[var(--iv-muted)]">
                {liveHeard}
              </p>
            </div>
          ) : null}
          {chatStatus ? (
            <p className="interview-chat-status" role="status" aria-live="polite">
              {showChatDots ? (
                <span className="interview-chat-dots" aria-hidden>
                  <span />
                  <span />
                  <span />
                </span>
              ) : null}
              {chatStatus}
            </p>
          ) : null}
        </div>

        <div className="relative mx-auto w-full max-w-md self-center">
          <div
            className="interview-orb relative aspect-[16/10] overflow-hidden rounded-[28px]"
            style={{
              background:
                "linear-gradient(180deg, var(--iv-card) 0%, var(--iv-card-deep) 100%)",
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/brand/pathed-logo.png" alt="" className="h-24 w-24 object-contain opacity-95" />
            </div>
            <div className="absolute inset-x-0 bottom-5 flex justify-center text-white/80">
              <CameraOff size={22} />
            </div>
            <video
              ref={localVideoRef}
              muted
              autoPlay
              playsInline
              className={cn(
                "absolute right-3 bottom-3 h-16 w-24 rounded-xl bg-black object-cover shadow-[var(--shadow-md)]",
                camOn ? "opacity-100" : "hidden",
              )}
            />
            <div className="absolute top-4 right-4">
              <LevelMeter level={voiceLevel} active={micReady && (listening || interviewerSpeaking)} />
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] overflow-hidden">
        <div className="interview-horizon absolute inset-0" />
      </div>

      <div className="relative z-10 flex shrink-0 flex-col items-center pb-6">
        <div className="interview-dock">
          {!micOn ? (
            <span className="pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-[2] -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--iv-bubble)] px-3 py-1 text-xs font-medium shadow-[var(--shadow-sm)]">
              Enable microphone
            </span>
          ) : null}
          <span className="interview-dock-halo" aria-hidden />
          <span className="interview-dock-glow" aria-hidden />
          <span className="interview-dock-sheen" aria-hidden />
          <span className="interview-dock-ring interview-dock-ring--a" aria-hidden />
          <span className="interview-dock-ring interview-dock-ring--b" aria-hidden />
          <span className="interview-dock-ring interview-dock-ring--c" aria-hidden />
          <span className="interview-dock-ring interview-dock-ring--d" aria-hidden />
          <div className="interview-dock-bar">
          <button
            type="button"
            aria-label={micOn ? "Mute microphone" : "Enable microphone"}
            onClick={() => void toggleMic()}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
              micOn ? "text-[var(--iv-ink)] hover:bg-[var(--bg-alt)]" : "text-[var(--error)]",
            )}
          >
            {micOn ? <Mic size={16} /> : <MicOff size={16} />}
          </button>
          <button
            type="button"
            aria-label="Interview settings"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--iv-ink)] hover:bg-[var(--bg-alt)]"
          >
            <SlidersHorizontal size={16} />
          </button>
          {codeUnlocked && session.plan.coding ? (
            <button
              type="button"
              aria-label={showCode ? "Minimize editor" : "Open editor"}
              onClick={() => setShowCode((open) => !open)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--bg-alt)]",
                showCode ? "text-[var(--primary)]" : "text-[var(--iv-ink)]",
              )}
            >
              <Code2 size={16} />
            </button>
          ) : null}
          <button
            type="button"
            aria-label={camOn ? "Camera off" : "Camera on"}
            onClick={async () => {
              const next = !camOn;
              setCamOn(next);
              await roomRef.current?.localParticipant.setCameraEnabled(next);
              const videoTracks = mediaRef.current?.getVideoTracks() ?? [];
              if (videoTracks.length) {
                videoTracks.forEach((t) => {
                  t.enabled = next;
                });
                return;
              }
              if (next && session.mode === "voice") {
                try {
                  await startMedia(prefs, true);
                } catch {
                  toast.error("Could not start the camera.");
                }
              }
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--iv-ink)] hover:bg-[var(--bg-alt)]"
          >
            {camOn ? <Camera size={16} /> : <CameraOff size={16} />}
          </button>
          </div>
        </div>
      </div>

      {showCode && session.plan.coding ? (
        <div className="absolute inset-x-4 top-16 bottom-28 z-20 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--iv-line)] bg-[var(--bg-card)] shadow-[var(--shadow-xl)] sm:inset-x-10">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--border-light)] px-4 py-3">
            <div className="min-w-0">
              <p className="type-caption m-0 text-[var(--primary)]">Coding round</p>
              <h2 className="m-0 text-base font-semibold">{session.plan.coding.title}</h2>
              {session.plan.coding.prompt ? (
                <p className="type-caption m-0 mt-1 line-clamp-3 text-[var(--iv-muted)]">
                  {session.plan.coding.prompt}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label="Check code"
                disabled={checking || sending || ending}
                onClick={() => void sendText("Please check the code in the editor.", "text")}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-[var(--iv-ink)] hover:bg-[var(--bg-alt)] disabled:opacity-50"
              >
                <Check size={16} />
                {checking ? "Checking…" : "Check"}
              </button>
              <button
                type="button"
                aria-label="Minimize editor"
                onClick={() => setShowCode(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--iv-ink)] hover:bg-[var(--bg-alt)]"
              >
                <Minimize2 size={16} />
              </button>
            </div>
          </div>
          <div className="relative h-[calc(100%-4.5rem)]">
            {checking ? (
              <div className="absolute inset-0 z-10 grid place-items-center bg-[color-mix(in_srgb,var(--bg-card)_78%,transparent)] backdrop-blur-[2px]">
                <p className="m-0 text-sm font-medium text-[var(--iv-muted)]">Checking your code…</p>
              </div>
            ) : null}
            <CodeEditor
              value={code || session.plan.coding.starterCode || ""}
              language="javascript"
              onChange={setCode}
              readOnly={checking}
              minHeight={280}
              variant="leetcode"
            />
          </div>
        </div>
      ) : null}

      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Interview devices"
        description="Pick the mic and camera this mock should use. Bars in the room show whether the mic is picking you up."
        size="md"
      >
        <div className="flex flex-col gap-6">
          <FieldGroup legend="Inputs" description="These apply immediately and are remembered on this browser.">
            <Field label="Microphone" htmlFor="interview-mic">
              <Select
                id="interview-mic"
                value={prefs.audioInputId}
                onChange={(e) => void updatePrefs({ audioInputId: e.target.value })}
              >
                <option value="">System default</option>
                {audioInputs.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Camera" htmlFor="interview-cam">
              <Select
                id="interview-cam"
                value={prefs.videoInputId}
                onChange={(e) => void updatePrefs({ videoInputId: e.target.value })}
              >
                <option value="">System default</option>
                {videoInputs.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.label}
                  </option>
                ))}
              </Select>
            </Field>
            {audioOutputs.length > 0 ? (
              <Field
                label="Speaker"
                htmlFor="interview-speaker"
                hint="Used for interviewer audio when the browser supports it."
              >
                <Select
                  id="interview-speaker"
                  value={prefs.audioOutputId}
                  onChange={(e) => void updatePrefs({ audioOutputId: e.target.value })}
                >
                  <option value="">System default</option>
                  {audioOutputs.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.label}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}
            <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-light)] px-3 py-2">
              <div>
                <p className="m-0 text-sm font-medium">Mic check</p>
                <p className="type-caption m-0 text-muted">
                  {micReady
                    ? voiceLevel > 0.08
                      ? "Hearing you — keep talking."
                      : "Mic is open. Talk and watch the bars."
                    : "Mic is not connected yet."}
                </p>
              </div>
              <LevelMeter level={voiceLevel} active={micReady} />
            </div>
          </FieldGroup>

          <FieldGroup legend="Voice features">
            <Switch
              checked={prefs.autoListen}
              onChange={(next) => void updatePrefs({ autoListen: next })}
              label="Auto listen"
              description="Mic stays on and sends your answer after you pause. Mute to pause it."
            />
            <Switch
              checked={prefs.speakReplies}
              onChange={(next) => void updatePrefs({ speakReplies: next })}
              label="Speak interviewer replies"
              description="Read answers aloud in this tab after each turn."
            />
            <Switch
              checked={prefs.echoCancellation}
              onChange={(next) => void updatePrefs({ echoCancellation: next })}
              label="Echo cancellation"
              description="Cuts the interviewer voice looping back into your mic."
            />
            <Switch
              checked={prefs.noiseSuppression}
              onChange={(next) => void updatePrefs({ noiseSuppression: next })}
              label="Noise suppression"
              description="Reduces keyboard and room noise."
            />
            <Switch
              checked={prefs.autoGainControl}
              onChange={(next) => void updatePrefs({ autoGainControl: next })}
              label="Auto gain"
              description="Boosts a quiet microphone automatically."
            />
          </FieldGroup>
        </div>
      </Dialog>
        </>
      )}
    </div>
  );
}

const END_LOADER_STEPS = [
  "Saving your session…",
  "Scoring your answers…",
  "Building your report…",
];

function InterviewEndLoader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const tick = window.setInterval(() => {
      setStep((current) => (current + 1) % END_LOADER_STEPS.length);
    }, 2200);
    return () => window.clearInterval(tick);
  }, []);

  return (
    <div className="interview-end-loader" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="interview-end-mark">
          <span className="interview-end-ring" aria-hidden />
          <span className="interview-end-ring interview-end-ring--soft" aria-hidden />
          <img src="/brand/pathed-logo.png" alt="" className="h-12 w-12 object-contain" />
        </div>
        <div>
          <p className="m-0 text-base font-semibold text-[var(--iv-ink)]">Ending interview</p>
          <p className="type-caption m-0 mt-1 text-[var(--iv-muted)]">{END_LOADER_STEPS[step]}</p>
        </div>
      </div>
    </div>
  );
}

function defaultPrefsSafe(): InterviewMediaPrefs {
  return {
    audioInputId: "",
    videoInputId: "",
    audioOutputId: "",
    speakReplies: true,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    autoListen: true,
  };
}
