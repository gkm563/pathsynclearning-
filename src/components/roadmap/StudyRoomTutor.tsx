"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { History, Loader2, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { apiSend } from "@/lib/api";
import type { RoadmapNode } from "@/types/roadmap";
import {
  archiveThenNewThread,
  createThreadId,
  emptyStore,
  hasUserTurns,
  loadTutorStore,
  saveTutorStore,
  upsertActiveThread,
  type TutorChatMsg,
  type TutorChatStore,
  type TutorThread,
} from "@/lib/memory/tutor-history";
import { RichStudyText, normalizeStudyText } from "@/components/ai/RichStudyText";
import {
  classifyTutorMessage,
  lessonLexicon,
  localTutorReply,
  scopeRefusal,
} from "@/lib/ai/tutor-scope";
import { EmptyState, IconButton, Input } from "@/components/ui";
import { cn } from "@/lib/cn";

type TutorApiResponse = {
  reply?: string;
  fallback?: boolean;
  refused?: boolean;
};

const PROMPTS = [
  "Explain this simply",
  "Quiz me",
  "Interview questions",
  "Key takeaways",
];

function isoNow() {
  return new Date().toISOString();
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

function greetingMsg(title: string): TutorChatMsg {
  return {
    role: "assistant",
    text: `I tutor **${title}** — ask about the idea, how to implement it, examples, complexity, or interview follow-ups. Related learning that helps this node is fair game. I will not do general chat or unrelated topics.`,
    at: isoNow(),
  };
}

export type TutorChrome = {
  showHistory: boolean;
  toggleHistory: () => void;
  startNewChat: () => void;
  busy: boolean;
};

export default function StudyRoomTutor({
  node,
  videoTitle,
  videoChannel,
  embedded = false,
  onChrome,
}: {
  node: RoadmapNode;
  videoTitle?: string;
  videoChannel?: string;
  embedded?: boolean;
  onChrome?: (api: TutorChrome | null) => void;
}) {
  const [messages, setMessages] = useState<TutorChatMsg[]>(() => [greetingMsg(node.title)]);
  const [store, setStore] = useState<TutorChatStore | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const storeRef = useRef<TutorChatStore | null>(null);
  const messagesRef = useRef<TutorChatMsg[]>(messages);
  const nodeIdRef = useRef(node.id);
  storeRef.current = store;
  messagesRef.current = messages;
  nodeIdRef.current = node.id;

  useEffect(() => {
    const greeting = greetingMsg(node.title);
    const loaded = loadTutorStore(node.id);
    const next = loaded ?? emptyStore(greeting);
    const active = next.threads.find((t) => t.id === next.activeId) || next.threads[0];
    storeRef.current = next;
    messagesRef.current = active?.messages?.length ? active.messages : [greeting];
    setStore(next);
    setMessages(messagesRef.current);
    setInput("");
    setError(null);
    setBusy(false);
    setShowHistory(false);
  }, [node.id, node.title]);

  const persistMessages = (nextMessages: TutorChatMsg[]) => {
    const base = storeRef.current;
    if (!base) {
      setMessages(nextMessages);
      messagesRef.current = nextMessages;
      return;
    }
    const next = upsertActiveThread(base, nextMessages);
    storeRef.current = next;
    messagesRef.current = nextMessages;
    setStore(next);
    setMessages(nextMessages);
    saveTutorStore(nodeIdRef.current, next);
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el || showHistory) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, busy, showHistory]);

  const persistStore = useCallback((next: TutorChatStore, nextMessages?: TutorChatMsg[]) => {
    storeRef.current = next;
    setStore(next);
    if (nextMessages) {
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
    }
    saveTutorStore(nodeIdRef.current, nextMessages ? upsertActiveThread(next, nextMessages) : next);
  }, []);

  const startNewChat = useCallback(() => {
    if (busy) return;
    const greeting = greetingMsg(node.title);
    const id = createThreadId();
    const prev = storeRef.current ?? emptyStore(greeting);
    const next = archiveThenNewThread(prev, messagesRef.current, greeting, id);
    persistStore(next, [greeting]);
    setShowHistory(false);
    setError(null);
  }, [busy, node.title, persistStore]);

  const toggleHistory = useCallback(() => {
    setShowHistory((v) => !v);
  }, []);

  useEffect(() => {
    onChrome?.({ showHistory, toggleHistory, startNewChat, busy });
  }, [onChrome, showHistory, toggleHistory, startNewChat, busy]);

  useEffect(() => {
    return () => onChrome?.(null);
  }, [onChrome]);

  const openThread = (thread: TutorThread) => {
    if (busy) return;
    const greeting = greetingMsg(node.title);
    const prev = storeRef.current ?? emptyStore(greeting);
    const snapped = upsertActiveThread(prev, messagesRef.current);
    persistStore({ ...snapped, activeId: thread.id }, thread.messages);
    setShowHistory(false);
    setError(null);
  };

  const deleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    const greeting = greetingMsg(node.title);
    const prev = upsertActiveThread(
      storeRef.current ?? emptyStore(greeting),
      messagesRef.current,
    );
    const remaining = prev.threads.filter((t) => t.id !== threadId);
    if (!remaining.length) {
      const fresh = emptyStore(greeting);
      persistStore(fresh, fresh.threads[0].messages);
      return;
    }
    const activeId = prev.activeId === threadId ? remaining[0].id : prev.activeId;
    const next = { activeId, threads: remaining };
    const active = remaining.find((t) => t.id === activeId) || remaining[0];
    persistStore(next, active.messages);
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    setShowHistory(false);
    setError(null);
    setInput("");
    const userMsg: TutorChatMsg = { role: "user", text, at: isoNow() };
    persistMessages([...messagesRef.current, userMsg]);

    const scope = classifyTutorMessage(text, lessonLexicon(node));
    if (!scope.ok) {
      persistMessages([
        ...messagesRef.current,
        {
          role: "assistant",
          text: normalizeStudyText(scopeRefusal(node.title, scope.reason)),
          at: isoNow(),
        },
      ]);
      return;
    }

    setBusy(true);

    try {
      const history = messagesRef.current
        .filter((m) => m.text.trim())
        .slice(-16)
        .map((m) => ({ role: m.role, content: m.text }));

      const data = await apiSend<TutorApiResponse>("/api/ai/tutor", "POST", {
        message: text,
        history,
        node: {
          id: node.id,
          title: node.title,
          type: node.type,
          description: node.description,
          whyLearn: node.whyLearn,
          interviewFocus: node.interviewFocus,
          skills: node.skills?.slice(0, 12),
          topics: node.topics?.slice(0, 12),
          learningOutcomes: node.learningOutcomes?.slice(0, 8),
        },
        video:
          videoTitle || videoChannel
            ? { title: videoTitle, channel: videoChannel }
            : undefined,
      });

      const reply =
        typeof data.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : localTutorReply(text, node.title, node.description);
      persistMessages([
        ...messagesRef.current,
        { role: "assistant", text: normalizeStudyText(reply), at: isoNow() },
      ]);
    } catch {
      persistMessages([
        ...messagesRef.current,
        {
          role: "assistant",
          text: normalizeStudyText(localTutorReply(text, node.title, node.description)),
          at: isoNow(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const historyThreads = (store ? upsertActiveThread(store, messages).threads : [])
    .filter((t) => hasUserTurns(t.messages))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const chatStarted = hasUserTurns(messages);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {embedded ? null : (
        <div className="shrink-0 border-b border-line bg-[linear-gradient(135deg,var(--primary-soft),var(--success-soft))] px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <div className="min-w-0 flex-1">
              <div className="type-label text-ink">AI Tutor</div>
              <div className="type-caption truncate text-muted">
                {showHistory
                  ? `${historyThreads.length} saved chat${historyThreads.length === 1 ? "" : "s"}`
                  : videoTitle
                    ? `This lesson · ${videoTitle}`
                    : `This node · ${node.title}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistory ? (
        <div className="tutor-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3 [overflow-anchor:none] [overscroll-behavior:contain]">
          {historyThreads.length === 0 ? (
            <EmptyState
              compact
              title="No saved chats"
              description="Ask a question and it will show up here."
            />
          ) : (
            historyThreads.map((thread) => {
              const active = thread.id === store?.activeId;
              const preview =
                [...thread.messages].reverse().find((m) => m.role === "assistant")?.text ||
                thread.title;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => openThread(thread)}
                  className={cn(
                    "flex items-start gap-2 rounded-[var(--radius-md)] p-3 text-left",
                    active
                      ? "border-[1.5px] border-primary bg-primary-soft"
                      : "border border-line bg-sunken",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="type-label truncate text-ink">{thread.title}</div>
                    <div className="type-caption mt-0.5 line-clamp-2 text-muted">
                      {preview.replace(/\*\*|==/g, "")}
                    </div>
                    <div className="type-caption mt-1.5 text-muted">
                      {thread.messages.filter((m) => m.role === "user").length} questions ·{" "}
                      {formatDay(thread.updatedAt)}
                    </div>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    title="Delete chat"
                    aria-label="Delete chat"
                    onClick={(e) => deleteThread(thread.id, e)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        deleteThread(thread.id, e as unknown as React.MouseEvent);
                    }}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-sm)] text-muted"
                  >
                    <Trash2 size={14} />
                  </span>
                </button>
              );
            })
          )}
        </div>
      ) : (
        <div
          ref={listRef}
          className="tutor-scroll flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-3 [overflow-anchor:none] [overscroll-behavior:contain]"
        >
          {messages.map((msg, i) => (
            <div
              key={`${msg.role}-${msg.at}-${i}`}
              className={cn(
                "max-w-[92%]",
                msg.role === "user" ? "self-end" : "self-start",
              )}
            >
              <div
                className={cn(
                  "type-caption mb-1 text-muted",
                  msg.role === "user" ? "text-right" : "text-left",
                )}
              >
                {msg.role === "user" ? "You" : "PathED Tutor"}
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
            </div>
          ))}
          {busy ? (
            <div className="inline-flex items-center gap-2 type-caption text-muted">
              <Loader2 size={14} className="animate-spin" />
              Thinking…
            </div>
          ) : null}
          {error ? <div className="type-caption text-danger">{error}</div> : null}
        </div>
      )}

      {!showHistory && !chatStarted ? (
        <div className="hide-scrollbar flex shrink-0 gap-1.5 overflow-x-auto px-3 pt-2 pb-1">
          {PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              disabled={busy}
              onClick={() => void send(p)}
              className="type-caption shrink-0 rounded-full border border-line bg-sunken px-2.5 py-1 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              {p}
            </button>
          ))}
        </div>
      ) : null}

      {showHistory ? (
        embedded ? null : (
          <div className="flex shrink-0 items-center gap-1.5 border-t border-line p-3">
            <IconButton
              type="button"
              label="Back to chat"
              variant="secondary"
              onClick={toggleHistory}
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
            <p className="type-caption m-0 min-w-0 flex-1 text-muted">
              {historyThreads.length} saved chat{historyThreads.length === 1 ? "" : "s"}
            </p>
          </div>
        )
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex shrink-0 items-center gap-1.5 border-t border-line p-3"
        >
          {embedded ? null : (
            <>
              <IconButton
                type="button"
                label="Chat history"
                variant="ghost"
                onClick={toggleHistory}
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
            </>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy}
            placeholder="Ask about this lesson only…"
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
      )}
    </div>
  );
}
