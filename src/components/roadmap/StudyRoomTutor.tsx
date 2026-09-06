"use client";

import React, { useEffect, useRef, useState } from "react";
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
    text: `I tutor this lesson only: **${title}**. Ask me to ==explain it==, quiz you, or prep interview questions. I will not answer general chat or topics outside this node and your roadmap.`,
    at: isoNow(),
  };
}

function iconBtn(active?: boolean): React.CSSProperties {
  return {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid var(--border-light)",
    background: active ? "rgba(108,99,255,0.12)" : "var(--bg-card)",
    color: active ? "#6c63ff" : "var(--text-main)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    flexShrink: 0,
  };
}

export default function StudyRoomTutor({
  node,
  videoTitle,
  videoChannel,
}: {
  node: RoadmapNode;
  videoTitle?: string;
  videoChannel?: string;
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

  const persistStore = (next: TutorChatStore, nextMessages?: TutorChatMsg[]) => {
    storeRef.current = next;
    setStore(next);
    if (nextMessages) {
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
    }
    saveTutorStore(node.id, nextMessages ? upsertActiveThread(next, nextMessages) : next);
  };

  const startNewChat = () => {
    if (busy) return;
    const greeting = greetingMsg(node.title);
    const id = createThreadId();
    const prev = storeRef.current ?? emptyStore(greeting);
    const next = archiveThenNewThread(prev, messagesRef.current, greeting, id);
    persistStore(next, [greeting]);
    setShowHistory(false);
    setError(null);
  };

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

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid var(--border-light)",
          background:
            "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,201,167,0.06))",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={16} color="#6c63ff" />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontFamily: "Outfit",
                fontWeight: 800,
                fontSize: 13,
                color: "var(--text-main)",
              }}
            >
              AI Tutor
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "Inter",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {showHistory
                ? `${historyThreads.length} saved chat${historyThreads.length === 1 ? "" : "s"}`
                : videoTitle
                  ? `This lesson · ${videoTitle}`
                  : `This node · ${node.title}`}
            </div>
          </div>
          <button
            type="button"
            title="Chat history"
            aria-label="Chat history"
            onClick={() => setShowHistory((v) => !v)}
            style={iconBtn(showHistory)}
          >
            <History size={15} />
          </button>
          <button
            type="button"
            title="New chat"
            aria-label="New chat"
            onClick={startNewChat}
            disabled={busy}
            style={{ ...iconBtn(), opacity: busy ? 0.5 : 1 }}
          >
            <Plus size={15} />
          </button>
        </div>
        {!showHistory ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                disabled={busy}
                onClick={() => void send(p)}
                style={{
                  border: "1px solid var(--border-light)",
                  background: "var(--bg-card)",
                  color: "var(--text-main)",
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontFamily: "Outfit",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.6 : 1,
                }}
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {showHistory ? (
        <div
          className="tutor-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {historyThreads.length === 0 ? (
            <p
              style={{
                margin: 0,
                padding: 8,
                color: "var(--text-muted)",
                fontFamily: "Inter",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              No saved chats for this lesson yet. Ask a question and it will show up here.
            </p>
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
                  style={{
                    textAlign: "left",
                    border: active ? "1.5px solid #6c63ff" : "1px solid var(--border-light)",
                    background: active ? "rgba(108,99,255,0.08)" : "var(--bg-alt)",
                    borderRadius: 12,
                    padding: "10px 12px",
                    cursor: "pointer",
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "Outfit",
                        fontWeight: 800,
                        fontSize: 13,
                        color: "var(--text-main)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {thread.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        fontFamily: "Inter",
                        marginTop: 3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {preview.replace(/\*\*|==/g, "")}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--text-muted)",
                        fontFamily: "Inter",
                        marginTop: 6,
                      }}
                    >
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
                      if (e.key === "Enter" || e.key === " ") deleteThread(thread.id, e as unknown as React.MouseEvent);
                    }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      display: "grid",
                      placeItems: "center",
                      color: "var(--text-muted)",
                      flexShrink: 0,
                    }}
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
          className="tutor-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overscrollBehavior: "contain",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={`${msg.role}-${msg.at}-${i}`}
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "92%",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "var(--text-muted)",
                  fontFamily: "Inter",
                  marginBottom: 4,
                  textAlign: msg.role === "user" ? "right" : "left",
                }}
              >
                {msg.role === "user" ? "You" : "PathED Tutor"}
                {msg.at ? ` · ${formatAt(msg.at)}` : ""}
              </div>
              <div
                className={msg.role === "user" ? "tutor-bubble tutor-bubble-user" : "tutor-bubble"}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  overflowWrap: "break-word",
                  wordBreak: "normal",
                  textAlign: "left",
                  fontFamily: "Inter",
                  fontSize: 13,
                  lineHeight: 1.65,
                  background:
                    msg.role === "user"
                      ? "linear-gradient(135deg, #6c63ff, #00c9a7)"
                      : "var(--bg-alt)",
                  color: msg.role === "user" ? "#fff" : "var(--text-main)",
                  border: msg.role === "user" ? "none" : "1px solid var(--border-light)",
                }}
              >
                <RichStudyText text={msg.text} invert={msg.role === "user"} />
              </div>
            </div>
          ))}
          {busy ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "var(--text-muted)",
                fontSize: 12,
                fontFamily: "Inter",
              }}
            >
              <Loader2 size={14} className="spin-tutor" />
              Thinking…
            </div>
          ) : null}
          {error ? (
            <div style={{ fontSize: 12, color: "#ec4899", fontFamily: "Inter" }}>{error}</div>
          ) : null}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        style={{
          display: "flex",
          gap: 8,
          padding: 12,
          borderTop: "1px solid var(--border-light)",
          flexShrink: 0,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder="Ask about this lesson only…"
          maxLength={2000}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1.5px solid var(--border-light)",
            background: "var(--bg-alt)",
            color: "var(--text-main)",
            outline: "none",
            fontFamily: "Outfit",
            fontSize: 13,
          }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            cursor: busy || !input.trim() ? "not-allowed" : "pointer",
            opacity: busy || !input.trim() ? 0.55 : 1,
          }}
        >
          <Send size={15} />
        </button>
      </form>
      <style>{`
        .tutor-scroll { overflow-anchor: none; }
        .spin-tutor { animation: spin-tutor 0.9s linear infinite; }
        @keyframes spin-tutor { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
