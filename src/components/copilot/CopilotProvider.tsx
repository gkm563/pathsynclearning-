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
import { usePathname } from "next/navigation";
import { loadVoiceWakeEnabled, saveVoiceWakeEnabled } from "@/lib/ai/copilot-voice";
import { isLiveInterviewPath } from "@/lib/routes";

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
  voiceBlocked: boolean;
  setVoicePhase: (phase: CopilotVoicePhase) => void;
  setHeard: (text: string) => void;
  registerVoiceSender: (sender: VoiceSender) => () => void;
  sendVoice: (text: string) => Promise<string | null>;
};

const CopilotContext = createContext<CopilotContextValue | null>(null);

export function CopilotProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const voiceBlocked = isLiveInterviewPath(pathname);
  const [open, setOpenState] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceAlwaysOn, setVoiceAlwaysOnState] = useState(true);
  const [voicePhase, setVoicePhase] = useState<CopilotVoicePhase>("idle");
  const [heard, setHeard] = useState("");
  const senderRef = useRef<VoiceSender | null>(null);
  const alwaysOnHeldRef = useRef(false);
  const alwaysOnRef = useRef(true);
  const blockedRef = useRef(false);
  alwaysOnRef.current = voiceAlwaysOn;
  blockedRef.current = voiceBlocked;
  const endTalk = useCallback(() => {
    setVoiceActive(false);
    setHeard("");
    if (blockedRef.current) {
      alwaysOnHeldRef.current = false;
      setVoicePhase("idle");
      return;
    }
    if (alwaysOnHeldRef.current) {
      alwaysOnHeldRef.current = false;
      setVoiceAlwaysOnState(true);
      setVoicePhase("listening");
      return;
    }
    setVoicePhase("idle");
  }, []);
  const stopVoice = endTalk;
  const closeChat = useCallback(() => {
    endTalk();
    setOpenState(false);
  }, [endTalk]);
  const setOpen = useCallback((next: boolean) => {
    if (!next) endTalk();
    setOpenState(next);
  }, [endTalk]);
  const toggle = useCallback(() => {
    setOpenState((v) => {
      if (v) endTalk();
      return !v;
    });
  }, [endTalk]);
  const startVoice = useCallback(() => {
    if (blockedRef.current) return;
    if (alwaysOnRef.current) {
      alwaysOnHeldRef.current = true;
      setVoiceAlwaysOnState(false);
    }
    setVoiceActive(true);
    setVoicePhase("listening");
    setHeard("");
  }, []);
  const setVoiceAlwaysOn = useCallback((on: boolean) => {
    alwaysOnHeldRef.current = false;
    saveVoiceWakeEnabled(on);
    setVoiceAlwaysOnState(on);
    setVoiceActive(false);
    setHeard("");
    setVoicePhase(on && !blockedRef.current ? "listening" : "idle");
  }, []);

  useEffect(() => {
    setVoiceAlwaysOnState(loadVoiceWakeEnabled());
  }, []);

  useEffect(() => {
    if (!voiceBlocked) return;
    alwaysOnHeldRef.current = false;
    setVoiceActive(false);
    setHeard("");
    setVoicePhase("idle");
    window.speechSynthesis?.cancel();
  }, [voiceBlocked]);
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
      voiceBlocked,
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
      voiceBlocked,
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
