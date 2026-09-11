"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Sparkles } from "lucide-react";
import { IconButton } from "@/components/ui";

type CopilotContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CopilotContext = createContext<CopilotContextValue | null>(null);

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "j") {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }
      event.preventDefault();
      setOpen((v) => !v);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) {
    throw new Error("useCopilot must be used within CopilotProvider");
  }
  return ctx;
}

export function CopilotLaunchButton({ size = "sm" }: { size?: "sm" | "md" }) {
  const { toggle } = useCopilot();
  return (
    <IconButton label="PathED Copilot" variant="ghost" size={size} onClick={toggle}>
      <Sparkles size={18} aria-hidden />
    </IconButton>
  );
}
