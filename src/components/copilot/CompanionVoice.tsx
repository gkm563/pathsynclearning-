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

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function CompanionVoice() {
  const student = useStudent();
  const name = resolveCopilotName(student.preferences.copilotName);
  const toast = useToast();
  const {
    voiceActive,
    voiceAlwaysOn,
    voicePhase,
    voiceBlocked,
    open,
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
  const openRef = useRef(open);
  const phaseRef = useRef(voicePhase);
  const busyRef = useRef(false);
  const mutedRef = useRef(false);
  const startVoiceRef = useRef(startVoice);
  const stopVoiceRef = useRef(stopVoice);
  const sendVoiceRef = useRef(sendVoice);
  const listening = !voiceBlocked && (voiceAlwaysOn || voiceActive);
  nameRef.current = name;
  activeRef.current = voiceActive;
  alwaysOnRef.current = voiceAlwaysOn;
  openRef.current = open;
  phaseRef.current = voicePhase;
  startVoiceRef.current = startVoice;
  stopVoiceRef.current = stopVoice;
  sendVoiceRef.current = sendVoice;

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    if (!voiceBlocked && voiceAlwaysOn && !voiceActive && voicePhase === "idle") {
      setVoicePhase("listening");
    }
  }, [setVoicePhase, voiceActive, voiceAlwaysOn, voiceBlocked, voicePhase]);

  useEffect(() => {
    if (!supported || !listening) {
      recRef.current?.abort();
      recRef.current = null;
      busyRef.current = false;
      window.speechSynthesis?.cancel();
      return;
    }

    let cancelled = false;
    const rec = createCopilotRecognition({
      onSpeech: (text) => {
        if (mutedRef.current || busyRef.current || phaseRef.current === "speaking") return;
        if (activeRef.current || alwaysOnRef.current) setHeard(text);
      },
      onCommit: (text) => {
        const spoken = text.trim();
        if (!spoken || mutedRef.current || busyRef.current || cancelled) return;
        if (phaseRef.current === "speaking" || phaseRef.current === "thinking") return;
        if (isSleepPhrase(spoken, nameRef.current)) {
          stopVoiceRef.current();
          return;
        }
        const named = isWakePhrase(spoken, nameRef.current);
        const rest = stripWakePhrase(spoken, nameRef.current) || spoken;
        if (!activeRef.current) {
          if (!alwaysOnRef.current) return;
          if (!named && wordCount(spoken) < 2) return;
          activeRef.current = true;
          startVoiceRef.current();
          if (rest.length >= 2) void handleUtterance(rest);
          return;
        }
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
            busyRef.current = false;
            window.setTimeout(() => {
              mutedRef.current = false;
              if (!cancelled && alwaysOnRef.current) rec?.start();
            }, 650);
            return;
          }
          if (alwaysOnRef.current && !openRef.current) {
            stopVoiceRef.current();
            busyRef.current = false;
            window.setTimeout(() => {
              mutedRef.current = false;
              if (!cancelled && alwaysOnRef.current) rec?.start();
            }, 650);
            return;
          }
          setVoicePhase("listening");
          setHeard("");
          busyRef.current = false;
          window.setTimeout(() => {
            mutedRef.current = false;
            if (!cancelled) rec?.start();
          }, 650);
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
