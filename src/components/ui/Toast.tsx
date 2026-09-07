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
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastTone = "success" | "error" | "warning" | "info";

type Toast = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  /** 0 keeps the toast until dismissed — use for errors the user must read. */
  duration: number;
  action?: { label: string; onClick: () => void };
};

type ToastInput = Omit<Partial<Toast>, "id" | "tone"> & { title: string };

type ToastApi = {
  success: (input: string | ToastInput) => string;
  error: (input: string | ToastInput) => string;
  warning: (input: string | ToastInput) => string;
  info: (input: string | ToastInput) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const toneMeta: Record<
  ToastTone,
  { icon: LucideIcon; accent: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    accent: "var(--success)",
    iconClass: "text-success",
  },
  error: { icon: XCircle, accent: "var(--error)", iconClass: "text-danger" },
  warning: {
    icon: AlertTriangle,
    accent: "var(--warning)",
    iconClass: "text-warning",
  },
  info: { icon: Info, accent: "var(--info)", iconClass: "text-info" },
};

/** Errors stay put by default; confirmations get out of the way on their own. */
const DEFAULT_DURATION: Record<ToastTone, number> = {
  success: 4000,
  info: 4500,
  warning: 6000,
  error: 0,
};

/**
 * Global toast host. Mounted once in the root layout.
 *
 * The viewport is an `aria-live` region so screen readers announce results of
 * actions without moving focus, which would interrupt whatever the user is
 * doing. Errors are `assertive`; everything else is polite.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const reduceMotion = useReducedMotion();

  useEffect(() => setTarget(document.body), []);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, input: string | ToastInput) => {
      const base: ToastInput =
        typeof input === "string" ? { title: input } : input;
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const duration = base.duration ?? DEFAULT_DURATION[tone];

      setToasts((list) => {
        // Cap the stack so a retry loop can't bury the page in toasts.
        const next = [...list, { ...base, id, tone, duration }];
        return next.slice(-4);
      });

      if (duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        );
      }
      return id;
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      timers.current.clear();
    },
    [],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (input) => push("success", input),
      error: (input) => push("error", input),
      warning: (input) => push("warning", input),
      info: (input) => push("info", input),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {target
        ? createPortal(
            <div
              className="pointer-events-none fixed inset-x-0 bottom-0 flex flex-col items-center gap-2 px-3 pb-[calc(var(--mobile-tabbar-height)+0.75rem+env(safe-area-inset-bottom,0px))] sm:inset-x-auto sm:right-0 sm:items-end sm:px-4 lg:pb-4"
              style={{ zIndex: "var(--z-toast)" }}
            >
              <div
                role="region"
                aria-label="Notifications"
                className="flex w-full flex-col items-center gap-2 sm:w-auto sm:items-end"
              >
                <AnimatePresence initial={false}>
                  {toasts.map((toast) => {
                    const meta = toneMeta[toast.tone];
                    const Icon = meta.icon;
                    return (
                      <motion.div
                        key={toast.id}
                        layout={!reduceMotion}
                        role="status"
                        aria-live={
                          toast.tone === "error" ? "assertive" : "polite"
                        }
                        initial={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, y: 12, scale: 0.97 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={
                          reduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, y: 8, scale: 0.98 }
                        }
                        transition={{
                          duration: reduceMotion ? 0 : 0.2,
                          ease: [0.05, 0.7, 0.1, 1],
                        }}
                        className="pointer-events-auto flex w-full max-w-[26rem] gap-3 overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface p-3.5 pl-3 shadow-[var(--shadow-lg)] sm:w-[26rem]"
                        style={{
                          borderInlineStartWidth: 3,
                          borderInlineStartColor: meta.accent,
                        }}
                      >
                        <Icon
                          size={18}
                          aria-hidden
                          className={cn("mt-px shrink-0", meta.iconClass)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="type-label m-0 text-ink">
                            {toast.title}
                          </p>
                          {toast.description ? (
                            <p className="type-small mt-0.5 mb-0 text-muted">
                              {toast.description}
                            </p>
                          ) : null}
                          {toast.action ? (
                            <button
                              type="button"
                              onClick={() => {
                                toast.action?.onClick();
                                dismiss(toast.id);
                              }}
                              className="type-label mt-2 text-primary underline underline-offset-4 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            >
                              {toast.action.label}
                            </button>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => dismiss(toast.id)}
                          aria-label="Dismiss notification"
                          className="-mt-0.5 -mr-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-faint transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        >
                          <X size={14} aria-hidden />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>,
            target,
          )
        : null}
    </ToastContext.Provider>
  );
}

/**
 * Announces the result of an action.
 *
 * Falls back to a no-op outside the provider so a component can be rendered in
 * isolation (or in a non-portal context) without throwing.
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  return (
    ctx ?? {
      success: () => "",
      error: () => "",
      warning: () => "",
      info: () => "",
      dismiss: () => {},
    }
  );
}
