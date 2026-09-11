"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  History,
  Loader2,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { RichStudyText, normalizeStudyText } from "@/components/ai/RichStudyText";
import {
  Button,
  Drawer,
  EmptyState,
  IconButton,
  Input,
  useToast,
} from "@/components/ui";
import { apiGet, apiSend } from "@/lib/api";
import { copilotChipsForPath } from "@/lib/ai/copilot-chips";
import type {
  CopilotChatMsg,
  CopilotChatResponse,
  CopilotProposedWrite,
  CopilotThreadSummary,
} from "@/lib/ai/copilot-types";
import { cn } from "@/lib/cn";
import { useCopilot } from "./CopilotProvider";

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

function greeting(): CopilotChatMsg {
  return {
    id: newId(),
    role: "assistant",
    text: "I’m **PathED Copilot**. I know your CRI, roadmap, and challenges. I can open the right page, save a note, or bookmark news.\n\n==Ask what you should do next.==",
    at: isoNow(),
  };
}

function hasUserTurns(messages: CopilotChatMsg[]) {
  return messages.some((m) => m.role === "user" && m.text.trim());
}

export function CopilotDrawer() {
  const { open, setOpen } = useCopilot();
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();
  const toast = useToast();
  const listRef = useRef<HTMLDivElement>(null);
  const [side, setSide] = useState<"right" | "bottom">("right");
  const [threadId, setThreadId] = useState<string | null>(null);
  const threadIdRef = useRef(threadId);
  threadIdRef.current = threadId;
  const [messages, setMessages] = useState<CopilotChatMsg[]>(() => [greeting()]);
  const [threads, setThreads] = useState<CopilotThreadSummary[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const apply = () => setSide(mq.matches ? "right" : "bottom");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const root = listRef.current?.closest("[data-overlay-scroll]");
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
    if (open) void loadThreads();
  }, [open, loadThreads]);

  const startNewChat = useCallback(() => {
    setThreadId(null);
    setMessages([greeting()]);
    setShowHistory(false);
    setError(null);
  }, []);

  const openThread = async (id: string) => {
    try {
      const data = await apiGet<{
        thread: CopilotThreadSummary;
        messages: CopilotChatMsg[];
      }>(`/api/ai/copilot/threads/${id}`);
      setThreadId(data.thread.id);
      setMessages(data.messages.length ? data.messages : [greeting()]);
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

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
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
    } finally {
      setBusy(false);
    }
  };

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

  const chips = copilotChipsForPath(pathname);
  const chatStarted = hasUserTurns(messages);

  return (
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      title="PathED Copilot"
      description="Your portal assistant"
      side={side}
      className={side === "right" ? "w-[min(26rem,100vw)]" : undefined}
      footer={
        showHistory ? (
          <div className="flex items-center gap-1.5">
            <IconButton
              type="button"
              label="Back to chat"
              variant="secondary"
              onClick={() => setShowHistory(false)}
            >
              <History size={16} />
            </IconButton>
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
              label="Chat history"
              variant="ghost"
              onClick={() => {
                setShowHistory(true);
                void loadThreads();
              }}
            >
              <History size={16} />
            </IconButton>
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
              placeholder="Ask PathED Copilot…"
              maxLength={2000}
              className="min-h-10 min-w-0 flex-1 bg-sunken py-2"
            />
            <IconButton
              type="submit"
              label="Send"
              variant="primary"
              disabled={busy || !input.trim()}
            >
              <Send size={15} />
            </IconButton>
          </form>
        )
      }
    >
      {showHistory ? (
        <div className="flex flex-col gap-2">
          {threads.length === 0 ? (
            <EmptyState
              compact
              title="No saved chats"
              description="Ask a question and it will show up here."
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
                    "flex items-start gap-2 rounded-[var(--radius-md)] p-3 text-left",
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
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-sm)] text-muted hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : (
        <div ref={listRef} className="flex flex-col gap-2.5">
          {messages.map((msg, i) => (
            <div
              key={msg.id || `${msg.role}-${msg.at}-${i}`}
              className={cn("max-w-[92%]", msg.role === "user" ? "self-end" : "self-start")}
            >
              <div
                className={cn(
                  "type-caption mb-1 text-muted",
                  msg.role === "user" ? "text-right" : "text-left",
                )}
              >
                {msg.role === "user" ? "You" : "PathED Copilot"}
                {msg.at ? ` · ${formatAt(msg.at)}` : ""}
              </div>
              <div
                className={cn(
                  "tutor-bubble overflow-wrap-anywhere rounded-[var(--radius-md)] px-3 py-2.5 text-left type-small leading-relaxed",
                  msg.role === "user"
                    ? "tutor-bubble-user bg-primary text-[var(--text-on-primary)]"
                    : "border border-line bg-sunken text-ink",
                )}
              >
                <RichStudyText text={msg.text} invert={msg.role === "user"} />
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
                      className="rounded-[var(--radius-md)] border border-line bg-surface p-3"
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
          ))}
          {busy ? (
            <div className="inline-flex items-center gap-2 type-caption text-muted">
              <Loader2 size={14} className="animate-spin" />
              Thinking…
            </div>
          ) : null}
          {error ? <div className="type-caption text-danger">{error}</div> : null}
          {!chatStarted && !busy ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  disabled={busy}
                  onClick={() => void send(chip.prompt)}
                  className="type-caption shrink-0 rounded-full border border-line bg-sunken px-2.5 py-1 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </Drawer>
  );
}

