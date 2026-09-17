"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui";
import {
  createCopilotRecognition,
  isSpeechRecognitionSupported,
  type InterviewRecognition,
} from "@/lib/ai/interview-voice";
import {
  isSleepPhrase,
  isWakePhrase,
  speakCopilotReply,
  spokenCopilotText,
  stripWakePhrase,
} from "@/lib/ai/copilot-voice";
import { resolveCopilotName } from "@/lib/ai/copilot-identity";
import { useStudent } from "@/components/dashboard/StudentContext";
import { useCopilot } from "./CopilotProvider";

async function primeMicrophone() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
}

/** How long to stay green/listening for a follow-up after Nova finishes talking. */
const FOLLOW_UP_MS = 10000;

export function CompanionVoice() {
  const student = useStudent();
  const name = resolveCopilotName(student.preferences.copilotName);
  const toast = useToast();
  const {
    voiceActive,
    voiceAlwaysOn,
    voicePhase,
    voiceBlocked,
    startVoice,
    stopVoice,
    setVoiceAlwaysOn,
    setVoicePhase,
    setHeard,
    sendVoice,
  } = useCopilot();
  const [supported, setSupported] = useState(true);
  const recRef = useRef<InterviewRecognition | null>(null);
  const nameRef = useRef(name);
  const activeRef = useRef(voiceActive);
  const alwaysOnRef = useRef(voiceAlwaysOn);
  const phaseRef = useRef(voicePhase);
  const busyRef = useRef(false);
  const mutedRef = useRef(false);
  const followUpTimer = useRef<number | undefined>(undefined);
  const startVoiceRef = useRef(startVoice);
  const stopVoiceRef = useRef(stopVoice);
  const sendVoiceRef = useRef(sendVoice);
  const listening = !voiceBlocked && (voiceAlwaysOn || voiceActive);
  nameRef.current = name;
  activeRef.current = voiceActive;
  alwaysOnRef.current = voiceAlwaysOn;
  phaseRef.current = voicePhase;
  startVoiceRef.current = startVoice;
  stopVoiceRef.current = stopVoice;
  sendVoiceRef.current = sendVoice;

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    if (!supported || !listening) {
      window.clearTimeout(followUpTimer.current);
      recRef.current?.abort();
      recRef.current = null;
      busyRef.current = false;
      mutedRef.current = false;
      window.speechSynthesis?.cancel();
      return;
    }

    let cancelled = false;

    const clearFollowUp = () => {
      window.clearTimeout(followUpTimer.current);
      followUpTimer.current = undefined;
    };

    const armFollowUp = () => {
      clearFollowUp();
      followUpTimer.current = window.setTimeout(() => {
        if (cancelled || busyRef.current) return;
        if (!activeRef.current) return;
        stopVoiceRef.current();
      }, FOLLOW_UP_MS);
    };

    const resumeListening = () => {
      if (cancelled) return;
      busyRef.current = false;
      window.setTimeout(() => {
        mutedRef.current = false;
        if (!cancelled) rec?.start();
      }, 650);
    };

    const rec = createCopilotRecognition({
      onSpeech: (text) => {
        if (mutedRef.current || busyRef.current || phaseRef.current === "speaking") return;
        if (!activeRef.current) return;
        clearFollowUp();
        setHeard(text);
      },
      onCommit: (text) => {
        const spoken = text.trim();
        if (!spoken || mutedRef.current || busyRef.current || cancelled) return;
        if (phaseRef.current === "speaking" || phaseRef.current === "thinking") return;

        if (isSleepPhrase(spoken, nameRef.current)) {
          clearFollowUp();
          stopVoiceRef.current();
          return;
        }

        if (!activeRef.current) {
          if (!alwaysOnRef.current) return;
          if (!isWakePhrase(spoken, nameRef.current)) return;
          clearFollowUp();
          const rest = stripWakePhrase(spoken, nameRef.current);
          activeRef.current = true;
          startVoiceRef.current();
          if (rest.length >= 2) {
            void handleUtterance(rest);
          } else {
            setHeard("");
            setVoicePhase("listening");
            armFollowUp();
          }
          return;
        }

        clearFollowUp();
        const rest = stripWakePhrase(spoken, nameRef.current) || spoken;
        void handleUtterance(rest.length >= 2 ? rest : spoken);
      },
      onError: (message) => {
        toast.error(message);
        setVoiceAlwaysOn(false);
        stopVoiceRef.current();
      },
    });
    recRef.current = rec;

    async function handleUtterance(text: string) {
      const asked = text.trim();
      if (!asked || busyRef.current) return;
      clearFollowUp();
      busyRef.current = true;
      mutedRef.current = true;
      rec?.pause();
      setHeard(asked);
      setVoicePhase("thinking");
      const reply = await sendVoiceRef.current(asked);
      if (cancelled || !activeRef.current) {
        busyRef.current = false;
        mutedRef.current = false;
        if (!cancelled && alwaysOnRef.current) rec?.start();
        return;
      }
      const spoken = spokenCopilotText(reply || "I couldn’t catch that. Try once more.");
      setVoicePhase("speaking");
      speakCopilotReply(spoken, {
        onStart: () => {
          mutedRef.current = true;
          rec?.pause();
        },
        onEnd: () => {
          if (cancelled) return;
          if (!activeRef.current) {
            resumeListening();
            return;
          }
          setVoicePhase("listening");
          setHeard("");
          resumeListening();
          armFollowUp();
        },
      });
    }

    async function boot() {
      try {
        await primeMicrophone();
      } catch {
        if (cancelled) return;
        toast.error("Microphone permission is needed for always-on voice. You can turn it back on anytime.");
        setVoiceAlwaysOn(false);
        stopVoiceRef.current();
        return;
      }
      if (cancelled) return;
      rec?.start();
    }

    void boot();
    const retry = () => {
      if (cancelled || mutedRef.current || document.visibilityState === "hidden") return;
      rec?.start();
    };
    document.addEventListener("visibilitychange", retry);
    window.addEventListener("focus", retry);
    window.addEventListener("pointerdown", retry, { once: true });

    return () => {
      cancelled = true;
      clearFollowUp();
      document.removeEventListener("visibilitychange", retry);
      window.removeEventListener("focus", retry);
      window.removeEventListener("pointerdown", retry);
      rec?.abort();
      recRef.current = null;
      busyRef.current = false;
    };
  }, [listening, setHeard, setVoiceAlwaysOn, setVoicePhase, stopVoice, supported, toast]);

  return null;
}
