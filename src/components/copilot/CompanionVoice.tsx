"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui";
import {
  createInterviewRecognition,
  isSpeechRecognitionSupported,
  speakInterviewReply,
  type InterviewRecognition,
} from "@/lib/ai/interview-voice";
import {
  isSleepPhrase,
  isWakePhrase,
  spokenCopilotText,
  stripWakePhrase,
} from "@/lib/ai/copilot-voice";
import { resolveCopilotName } from "@/lib/ai/copilot-identity";
import { useStudent } from "@/components/dashboard/StudentContext";
import { useCopilot } from "./CopilotProvider";

export function CompanionVoice() {
  const student = useStudent();
  const name = resolveCopilotName(student.preferences.copilotName);
  const toast = useToast();
  const {
    voiceActive,
    voiceAlwaysOn,
    voicePhase,
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
  const modeRef = useRef<"off" | "wake" | "talk">("off");
  const nameRef = useRef(name);
  const activeRef = useRef(voiceActive);
  const alwaysOnRef = useRef(voiceAlwaysOn);
  const openRef = useRef(open);
  const busyRef = useRef(false);
  const startVoiceRef = useRef(startVoice);
  const stopVoiceRef = useRef(stopVoice);
  const sendVoiceRef = useRef(sendVoice);
  nameRef.current = name;
  activeRef.current = voiceActive;
  alwaysOnRef.current = voiceAlwaysOn;
  openRef.current = open;
  startVoiceRef.current = startVoice;
  stopVoiceRef.current = stopVoice;
  sendVoiceRef.current = sendVoice;

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    return () => {
      recRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    const rec = createInterviewRecognition({
      silenceMs: 900,
      onTranscript: (finalText, interimText) => {
        const spoken = [finalText, interimText].filter(Boolean).join(" ").trim();
        if (modeRef.current === "wake") {
          if (isWakePhrase(spoken, nameRef.current)) wakeFrom(spoken);
          return;
        }
        if (modeRef.current === "talk") setHeard(spoken);
      },
      onCommit: (text) => {
        const spoken = text.trim();
        if (!spoken || busyRef.current) return;
        if (modeRef.current === "wake") {
          if (!isWakePhrase(spoken, nameRef.current)) return;
          wakeFrom(spoken);
          return;
        }
        if (modeRef.current !== "talk") return;
        if (isSleepPhrase(spoken, nameRef.current)) {
          stopVoiceRef.current();
          return;
        }
        const rest = stripWakePhrase(spoken, nameRef.current) || spoken;
        void handleUtterance(rest);
      },
      onError: (message) => {
        toast.error(message);
        if (alwaysOnRef.current) stopVoiceRef.current();
        else setVoiceAlwaysOn(false);
      },
    });
    recRef.current = rec;

    function wakeFrom(spoken: string) {
      if (busyRef.current) return;
      const rest = stripWakePhrase(spoken, nameRef.current);
      modeRef.current = "talk";
      activeRef.current = true;
      startVoiceRef.current();
      if (rest.length >= 2) void handleUtterance(rest);
    }

    async function handleUtterance(text: string) {
      const asked = text.trim();
      if (!asked || busyRef.current) return;
      busyRef.current = true;
      recRef.current?.abort();
      setHeard(asked);
      setVoicePhase("thinking");
      const reply = await sendVoiceRef.current(asked);
      busyRef.current = false;
      if (!activeRef.current) return;
      const spoken = spokenCopilotText(reply || "I couldn’t catch that. Try once more.");
      setVoicePhase("speaking");
      speakInterviewReply(spoken, {
        onEnd: () => {
          if (!activeRef.current) return;
          if (alwaysOnRef.current && !openRef.current) {
            stopVoiceRef.current();
            return;
          }
          setVoicePhase("listening");
          setHeard("");
          recRef.current?.start();
        },
      });
    }

    return () => {
      rec.abort();
      recRef.current = null;
    };
  }, [setHeard, setVoiceAlwaysOn, setVoicePhase, toast]);

  useEffect(() => {
    if (!supported) return;
    if (!voiceAlwaysOn && !voiceActive) {
      modeRef.current = "off";
      busyRef.current = false;
      recRef.current?.abort();
      window.speechSynthesis?.cancel();
      return;
    }

    if (voiceActive) {
      modeRef.current = "talk";
      if (voicePhase === "listening" && !busyRef.current) recRef.current?.start();
      else if (voicePhase !== "listening") recRef.current?.abort();
      return;
    }

    window.speechSynthesis?.cancel();
    modeRef.current = "wake";
    busyRef.current = false;
    recRef.current?.start();
  }, [supported, voiceActive, voiceAlwaysOn, voicePhase]);

  return null;
}
