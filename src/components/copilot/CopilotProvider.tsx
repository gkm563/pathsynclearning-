"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { loadVoiceWakeEnabled, saveVoiceWakeEnabled } from "@/lib/ai/copilot-voice";

export type CopilotVoicePhase = "idle" | "listening" | "thinking" | "speaking";

type VoiceSender = (text: string) => Promise<string | null>;

type CopilotContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  closeChat: () => void;
  toggle: () => void;
  voiceActive: boolean;
  voiceAlwaysOn: boolean;
  setVoiceAlwaysOn: (on: boolean) => void;
  voicePhase: CopilotVoicePhase;
  heard: string;
  startVoice: () => void;
  stopVoice: () => void;
  setVoicePhase: (phase: CopilotVoicePhase) => void;
  setHeard: (text: string) => void;
  registerVoiceSender: (sender: VoiceSender) => () => void;
  sendVoice: (text: string) => Promise<string | null>;
};

const CopilotContext = createContext<CopilotContextValue | null>(null);

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [open, setOpenState] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceAlwaysOn, setVoiceAlwaysOnState] = useState(true);
  const [voicePhase, setVoicePhase] = useState<CopilotVoicePhase>("idle");
  const [heard, setHeard] = useState("");
  const senderRef = useRef<VoiceSender | null>(null);
  const stopVoice = useCallback(() => {
    setVoiceActive(false);
    setVoicePhase("idle");
    setHeard("");
  }, []);
  const closeChat = useCallback(() => {
    setVoiceActive(false);
    setVoicePhase("idle");
    setHeard("");
    setOpenState(false);
  }, []);
  const setOpen = useCallback((next: boolean) => {
    if (!next) {
      setVoiceActive(false);
      setVoicePhase("idle");
      setHeard("");
    }
    setOpenState(next);
  }, []);
  const toggle = useCallback(() => {
    setOpenState((v) => {
      if (v) {
        setVoiceActive(false);
        setVoicePhase("idle");
        setHeard("");
      }
      return !v;
    });
  }, []);
  const startVoice = useCallback(() => {
    setVoiceActive(true);
    setVoicePhase("listening");
    setHeard("");
  }, []);
  const setVoiceAlwaysOn = useCallback((on: boolean) => {
    saveVoiceWakeEnabled(on);
    setVoiceAlwaysOnState(on);
    if (!on) {
      setVoiceActive(false);
      setVoicePhase("idle");
      setHeard("");
    }
  }, []);

  useEffect(() => {
    setVoiceAlwaysOnState(loadVoiceWakeEnabled());
  }, []);
  const registerVoiceSender = useCallback((sender: VoiceSender) => {
    senderRef.current = sender;
    return () => {
      if (senderRef.current === sender) senderRef.current = null;
    };
  }, []);
  const sendVoice = useCallback(async (text: string) => {
    if (!senderRef.current) return null;
    return senderRef.current(text);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && voiceActive) {
        event.preventDefault();
        stopVoice();
        return;
      }
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "j") {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      event.preventDefault();
      toggle();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stopVoice, toggle, voiceActive]);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      closeChat,
      toggle,
      voiceActive,
      voiceAlwaysOn,
      setVoiceAlwaysOn,
      voicePhase,
      heard,
      startVoice,
      stopVoice,
      setVoicePhase,
      setHeard,
      registerVoiceSender,
      sendVoice,
    }),
    [
      open,
      setOpen,
      closeChat,
      toggle,
      voiceActive,
      voiceAlwaysOn,
      setVoiceAlwaysOn,
      voicePhase,
      heard,
      startVoice,
      stopVoice,
      registerVoiceSender,
      sendVoice,
    ],
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) {
    throw new Error("useCopilot must be used within CopilotProvider");
  }
  return ctx;
}
