"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  History,
  Mic,
  Plus,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { RichStudyText, normalizeStudyText } from "@/components/ai/RichStudyText";
import {
  Button,
  EmptyState,
  IconButton,
  Input,
  useToast,
} from "@/components/ui";
import { apiGet, apiSend } from "@/lib/api";
import { copilotChipsForPath } from "@/lib/ai/copilot-chips";
import {
  DEFAULT_COPILOT_NAME,
  firstNameFrom,
  resolveCopilotName,
} from "@/lib/ai/copilot-identity";
import { copilotPresence } from "@/lib/ai/copilot-presence";
import type {
  CopilotChatMsg,
  CopilotChatResponse,
  CopilotProposedWrite,
  CopilotThreadSummary,
} from "@/lib/ai/copilot-types";
import { cn } from "@/lib/cn";
import { useDismiss, useFocusTrap } from "@/hooks/useOverlay";
import { useStudent } from "@/components/dashboard/StudentContext";
import { CompanionAvatar } from "./CompanionAvatar";
import { enqueueCompanionJob } from "./CompanionDirector";
import { inferCompanionIntent, scanCompanionTargets } from "./companion-targets";
import { useCopilot } from "./CopilotProvider";
import {
  defaultChatSize,
  defaultFabPos,
  initCompanionPos,
  placeChat,
  setCompanionPos,
  useCompanionPos,
  type ChatSize,
} from "./copilot-layout";

function isoNow() {
  return new Date().toISOString();
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatAt(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

function formatDay(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function greetingMsg(text: string): CopilotChatMsg {
  return {
    id: newId(),
    role: "assistant",
    text,
    at: isoNow(),
  };
}

function hasUserTurns(messages: CopilotChatMsg[]) {
  return messages.some((m) => m.role === "user" && m.text.trim());
}

const DRAG_THRESHOLD = 8;

export function CopilotDrawer() {
  const { open, closeChat, registerVoiceSender, voiceActive, voiceAlwaysOn, voiceBlocked, voicePhase, startVoice, stopVoice, setVoiceAlwaysOn } = useCopilot();
  const student = useStudent();
  const companionName = resolveCopilotName(student.preferences.copilotName);
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();
  const toast = useToast();
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const threadIdRef = useRef(threadId);
  threadIdRef.current = threadId;
  const presence = copilotPresence({
    seed: student.studentRegistrationId || student.name,
    companionName,
    studentFirstName: firstNameFrom(student.shortName || student.name),
    pathname,
    streak: student.streak,
    cri: student.cri,
    hasRoadmap: Boolean(student.goal.role),
    featuredChallenge: student.dailyChallenges[0]?.title || null,
    hasImportedMemory: Boolean(student.preferences.copilotMemory),
  });
  const [messages, setMessages] = useState<CopilotChatMsg[]>(() => [
    greetingMsg(
      `Hey — I’m **${DEFAULT_COPILOT_NAME}**. I hang out with you on PathED.\n\n==Ask what you should do next.==`,
    ),
  ]);
  const [threads, setThreads] = useState<CopilotThreadSummary[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const sendRef = useRef<(text: string) => Promise<string | null>>(async () => null);

  useEffect(() => setMounted(true), []);

  const companionPos = useCompanionPos();
  const [chatSize, setChatSize] = useState<ChatSize>({ w: 376, h: 576 });
  const sizeRef = useRef<ChatSize>(chatSize);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  useFocusTrap(panelRef, false);
  useDismiss({
    ref: panelRef,
    active: open,
    onDismiss: () => closeChat(),
    closeOnOutside: false,
  });

  useEffect(() => {
    if (open) initCompanionPos();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = panelRef.current;
    if (!el) return;
    const sync = () => {
      const rect = el.getBoundingClientRect();
      const next =
        rect.width > 0 && rect.height > 0
          ? { w: rect.width, h: rect.height }
          : defaultChatSize();
      sizeRef.current = next;
      setChatSize((prev) =>
        Math.abs(prev.w - next.w) < 1 && Math.abs(prev.h - next.h) < 1 ? prev : next,
      );
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [open]);

  const onHeaderPointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement | null)?.closest("button, a, input")) return;
    const current = companionPos ?? defaultFabPos();
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origX: current.x,
      origY: current.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [companionPos]);

  const onHeaderPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const session = drag.current;
    if (!session || event.pointerId !== session.pointerId) return;
    const dx = event.clientX - session.startX;
    const dy = event.clientY - session.startY;
    if (!draggingRef.current && dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
    draggingRef.current = true;
    setDragging(true);
    setCompanionPos({ x: session.origX + dx, y: session.origY + dy });
  }, []);

  const onHeaderPointerUp = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const session = drag.current;
    if (!session || event.pointerId !== session.pointerId) return;
    if (draggingRef.current) {
      setCompanionPos(
        { x: session.origX + (event.clientX - session.startX), y: session.origY + (event.clientY - session.startY) },
        true,
      );
    }
    draggingRef.current = false;
    setDragging(false);
    drag.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // already released
    }
  }, []);

  useEffect(() => {
    const root = listRef.current;
    if (root) root.scrollTop = root.scrollHeight;
  }, [messages, busy, showHistory]);

  const loadThreads = useCallback(async () => {
    try {
      const data = await apiGet<{ threads: CopilotThreadSummary[] }>(
        "/api/ai/copilot/threads",
      );
      setThreads(data.threads || []);
    } catch {
      // history is secondary
    }
  }, []);

  useEffect(() => {
    if (hasUserTurns(messagesRef.current) || threadIdRef.current) return;
    setMessages([greetingMsg(presence.greeting)]);
  }, [presence.greeting]);

  useEffect(() => {
    if (open) void loadThreads();
  }, [open, loadThreads]);

  const startNewChat = useCallback(() => {
    setThreadId(null);
    setMessages([greetingMsg(presence.greeting)]);
    setShowHistory(false);
    setError(null);
  }, [presence.greeting]);

  const openThread = async (id: string) => {
    try {
      const data = await apiGet<{
        thread: CopilotThreadSummary;
        messages: CopilotChatMsg[];
      }>(`/api/ai/copilot/threads/${id}`);
      setThreadId(data.thread.id);
      setMessages(data.messages.length ? data.messages : [greetingMsg(presence.greeting)]);
      setShowHistory(false);
    } catch {
      setError("Could not load that chat.");
    }
  };

  const deleteThread = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await apiSend(`/api/ai/copilot/threads/${id}`, "DELETE");
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (threadId === id) startNewChat();
    } catch {
      setError("Could not delete that chat.");
    }
  };

  const send = async (raw: string): Promise<string | null> => {
    const text = raw.trim();
    if (!text || busy) return null;
    setShowHistory(false);
    setError(null);
    setInput("");
    const userMsg: CopilotChatMsg = { id: newId(), role: "user", text, at: isoNow() };
    setMessages((prev) => [...prev, userMsg]);
    setBusy(true);

    try {
      const history = messagesRef.current
        .filter((m) => m.text.trim() && (m.role === "user" || m.role === "assistant"))
        .slice(-16)
        .map((m) => ({ role: m.role, content: m.text }));

      const data = await apiSend<CopilotChatResponse>("/api/ai/copilot", "POST", {
        message: text,
        threadId,
        history,
        pathname,
        ui: scanCompanionTargets(),
      });

      if (data.threadId) {
        setThreadId(data.threadId);
        threadIdRef.current = data.threadId;
      }
      const reply = normalizeStudyText(data.reply || "I could not answer that just now.");
      setMessages((prev) => [
        ...prev,
        {
          id: data.messageId,
          role: "assistant",
          text: reply,
          at: isoNow(),
          navigate: data.navigate,
          proposedWrites: data.proposedWrites,
          writeStatus: data.proposedWrites?.length ? "pending" : undefined,
        },
      ]);
      void loadThreads();
      const inferred = inferCompanionIntent(text);
      if (inferred || data.interact?.length || data.navigate?.length) {
        enqueueCompanionJob({
          interact: inferred ? [inferred, ...(data.interact || [])] : data.interact || [],
          navigate: data.navigate || [],
        });
      }
      return reply;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Copilot is unavailable.");
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          text: normalizeStudyText(
            "I couldn’t reach the AI just now. Try again, or use the sidebar to open **Roadmap** or **Challenges**.",
          ),
          at: isoNow(),
        },
      ]);
      return null;
    } finally {
      setBusy(false);
    }
  };
  sendRef.current = send;

  useEffect(() => {
    return registerVoiceSender((text) => sendRef.current(text));
  }, [registerVoiceSender]);

  const confirmWrite = async (msg: CopilotChatMsg, write: CopilotProposedWrite) => {
    const activeThreadId = threadIdRef.current;
    if (!activeThreadId || acting) return;
    setActing(true);
    try {
      if (write.type === "create_note") {
        await apiSend("/api/ai/copilot/actions", "POST", {
          type: "create_note",
          title: write.title,
          content: write.content,
          threadId: activeThreadId,
          messageId: msg.id,
        });
        toast.success("Note saved");
      } else {
        await apiSend("/api/ai/copilot/actions", "POST", {
          type: "bookmark_news",
          articleId: write.articleId,
          bookmarked: write.bookmarked,
          threadId: activeThreadId,
          messageId: msg.id,
        });
        toast.success(write.bookmarked === false ? "Bookmark removed" : "Article bookmarked");
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, writeStatus: "done" } : m)),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not complete that action");
    } finally {
      setActing(false);
    }
  };

  const cancelWrite = (msg: CopilotChatMsg) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, writeStatus: "cancelled" } : m)),
    );
  };

  const chips = copilotChipsForPath(pathname, presence.chip);
  const chatStarted = hasUserTurns(messages);
  const you = firstNameFrom(student.shortName || student.name);
  const chatBox = companionPos ? placeChat(companionPos, chatSize) : null;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.aside
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          tabIndex={-1}
          data-companion-ignore
          className={cn(
            "fixed flex flex-col overflow-visible border-0 bg-transparent outline-none",
            "w-[min(23.5rem,calc(100vw-5.5rem))] h-[min(36rem,calc(100dvh-5rem))]",
          )}
          style={{
            zIndex: "var(--z-overlay)",
            ...(chatBox
              ? { left: chatBox.x, top: chatBox.y }
              : {
                  right: 72,
                  bottom:
                    "calc(var(--mobile-tabbar-height) + 1rem + env(safe-area-inset-bottom, 0px))",
                }),
          }}
          initial={reduceMotion || dragging ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          transition={{ duration: reduceMotion || dragging ? 0 : 0.2, ease: [0.05, 0.7, 0.1, 1] }}
        >
          <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[28px] border border-line bg-surface shadow-[var(--shadow-xl)]">
          <header
            className={cn(
              "flex shrink-0 touch-none select-none items-center gap-3 border-b border-line bg-[linear-gradient(180deg,var(--primary-soft),var(--surface))] px-4 py-3 rounded-t-[28px]",
              dragging ? "cursor-grabbing" : "cursor-grab",
            )}
            onPointerDown={onHeaderPointerDown}
            onPointerMove={onHeaderPointerMove}
            onPointerUp={onHeaderPointerUp}
            onPointerCancel={onHeaderPointerUp}
          >
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="type-h4 m-0 truncate text-ink">
                {companionName}
              </h2>
              <p className="type-caption m-0 flex items-center gap-1.5 text-muted">
                <span
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    voiceBlocked ? "bg-[var(--text-muted)]" : "bg-success",
                  )}
                  aria-hidden
                />
                  {voiceBlocked
                    ? "Voice paused during interview"
                    : voiceActive
                    ? voicePhase === "listening"
                      ? "Listening…"
                      : voicePhase === "thinking"
                        ? `${companionName} is thinking…`
                        : voicePhase === "speaking"
                          ? `${companionName} is talking`
                          : `Voice with ${you}`
                    : voiceAlwaysOn
                      ? `Passive — say hello ${companionName}`
                      : busy
                        ? `${companionName} is typing…`
                        : `Here with you, ${you}`}
              </p>
            </div>
            <IconButton
              type="button"
              label={voiceAlwaysOn && !voiceActive ? "Turn off always-on voice" : "Turn on always-on voice"}
              variant={voiceAlwaysOn && !voiceActive && !voiceBlocked ? "primary" : "ghost"}
              size="sm"
              disabled={voiceBlocked}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => {
                if (voiceActive) stopVoice();
                setVoiceAlwaysOn(!(voiceAlwaysOn && !voiceActive));
              }}
            >
              <Mic size={16} />
            </IconButton>
            <IconButton type="button" label="Chat history" variant="ghost" size="sm" onClick={() => {
              setShowHistory((v) => !v);
              void loadThreads();
            }}>
              <History size={16} />
            </IconButton>
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                closeChat();
              }}
              aria-label="Close chat"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <X size={18} aria-hidden />
            </button>
          </header>

            <div
              ref={listRef}
              className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-3 py-4 sm:px-4"
            >
              {showHistory ? (
                <div className="flex flex-col gap-2">
                  {threads.length === 0 ? (
                    <EmptyState
                      compact
                      title="No saved chats"
                      description={`${companionName} will remember a thread once you send a message.`}
                    />
                  ) : (
                    threads.map((thread) => {
                      const active = thread.id === threadId;
                      return (
                        <button
                          key={thread.id}
                          type="button"
                          onClick={() => void openThread(thread.id)}
                          className={cn(
                            "flex items-start gap-2 rounded-2xl p-3 text-left",
                            active
                              ? "border-[1.5px] border-primary bg-primary-soft"
                              : "border border-line bg-sunken",
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="type-label truncate text-ink">{thread.title}</div>
                            <div className="type-caption mt-1 text-muted">
                              {formatDay(thread.updatedAt)}
                            </div>
                          </div>
                          <span
                            role="button"
                            tabIndex={0}
                            title="Delete chat"
                            aria-label="Delete chat"
                            onClick={(e) => void deleteThread(thread.id, e)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                void deleteThread(thread.id, e as unknown as React.MouseEvent);
                              }
                            }}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted hover:text-danger"
                          >
                            <Trash2 size={14} />
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              ) : (
                <div className="flex min-w-0 flex-col gap-3">
                  {messages.map((msg, i) => {
                    const mine = msg.role === "user";
                    return (
                      <div
                        key={msg.id || `${msg.role}-${msg.at}-${i}`}
                        className={cn("flex min-w-0 max-w-full gap-2", mine ? "self-end" : "self-start")}
                      >
                        {!mine ? (
                          <span className="mt-1 shrink-0">
                            <CompanionAvatar name={companionName} size="sm" pose="still" />
                          </span>
                        ) : null}
                        <div className={cn("min-w-0 max-w-[min(100%,20rem)]", mine && "text-right")}>
                          <div className="type-caption mb-1 text-muted">
                            {mine ? "You" : companionName}
                            {msg.at ? ` · ${formatAt(msg.at)}` : ""}
                          </div>
                          <div
                            className={cn(
                              "overflow-hidden break-words px-3.5 py-2.5 text-left type-small leading-relaxed [overflow-wrap:anywhere]",
                              mine
                                ? "rounded-[1.2rem] rounded-br-sm bg-primary text-[var(--text-on-primary)]"
                                : "rounded-[1.2rem] rounded-bl-sm border border-line bg-sunken text-ink",
                            )}
                          >
                            <RichStudyText text={msg.text} invert={mine} />
                          </div>
                          {msg.navigate?.length ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {msg.navigate.map((nav) => (
                                <Button
                                  key={nav.href}
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => router.push(nav.href)}
                                >
                                  {nav.label}
                                </Button>
                              ))}
                            </div>
                          ) : null}
                          {msg.proposedWrites?.length && msg.writeStatus !== "cancelled" ? (
                            <div className="mt-2 space-y-2">
                              {msg.proposedWrites.map((write, idx) => (
                                <div
                                  key={`${write.type}-${idx}`}
                                  className="rounded-2xl border border-line bg-surface p-3 text-left"
                                >
                                  <p className="type-caption m-0 font-semibold text-ink">
                                    {write.summary}
                                  </p>
                                  {msg.writeStatus === "done" ? (
                                    <p className="type-caption mt-1 mb-0 text-muted">Done.</p>
                                  ) : (
                                    <div className="mt-2 flex gap-1.5">
                                      <Button
                                        type="button"
                                        size="sm"
                                        loading={acting}
                                        onClick={() => void confirmWrite(msg, write)}
                                      >
                                        Confirm
                                      </Button>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        disabled={acting}
                                        onClick={() => cancelWrite(msg)}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                  {busy ? (
                    <div className="flex items-end gap-2 self-start">
                      <CompanionAvatar name={companionName} size="sm" pose="idle" />
                      <div className="rounded-[1.2rem] rounded-bl-sm border border-line bg-sunken px-3.5 py-3 text-muted">
                        <span className="companion-chat-dots" aria-label={`${companionName} is typing`}>
                          <span />
                          <span />
                          <span />
                        </span>
                      </div>
                    </div>
                  ) : null}
                  {error ? <div className="type-caption text-danger">{error}</div> : null}
                  {!chatStarted && !busy ? (
                    <div className="mt-1 flex flex-wrap gap-1.5 pl-9">
                      {chips.map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          disabled={busy}
                          onClick={() => void send(chip.prompt)}
                          className="type-caption shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 font-semibold text-ink shadow-[var(--shadow-xs)] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <footer className="shrink-0 rounded-b-[28px] border-t border-line bg-sunken/80 px-3 py-3 sm:px-4">
              {showHistory ? (
                <div className="flex items-center gap-1.5">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowHistory(false)}>
                    Back to {companionName}
                  </Button>
                  <IconButton type="button" label="New chat" variant="ghost" onClick={startNewChat}>
                    <Plus size={16} />
                  </IconButton>
                  <p className="type-caption m-0 min-w-0 flex-1 text-muted">
                    {threads.length} saved chat{threads.length === 1 ? "" : "s"}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send(input);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <IconButton
                    type="button"
                    label="New chat"
                    variant="ghost"
                    onClick={startNewChat}
                    disabled={busy}
                  >
                    <Plus size={16} />
                  </IconButton>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={busy}
                    placeholder={`Talk to ${companionName}…`}
                    maxLength={2000}
                    className="min-h-11 min-w-0 flex-1 rounded-full bg-surface px-4 py-2"
                  />
                  <IconButton
                    type="button"
                    label={
                      voiceBlocked
                        ? "Voice paused during interview"
                        : voiceActive
                          ? "End voice"
                          : `Talk to ${companionName}`
                    }
                    variant={voiceActive ? "primary" : "ghost"}
                    disabled={voiceBlocked}
                    onClick={() => (voiceActive ? stopVoice() : startVoice())}
                    className="rounded-full"
                  >
                    <Mic size={16} />
                  </IconButton>
                  <IconButton
                    type="submit"
                    label="Send"
                    variant="primary"
                    disabled={busy || !input.trim()}
                    className="rounded-full"
                  >
                    <Send size={15} />
                  </IconButton>
                </form>
              )}
            </footer>
          </div>
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute bottom-7 h-3.5 w-3.5 rotate-45 border-line bg-surface shadow-[var(--shadow-sm)]",
              chatBox?.side === "right"
                ? "-left-1.5 border-b border-l"
                : "-right-1.5 border-r border-t",
            )}
          />
        </motion.aside>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

