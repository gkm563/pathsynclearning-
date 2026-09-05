const PREFIX = "pathed:tutor-chat:";
const MAX_THREADS = 24;
const MAX_MESSAGES = 80;

export type TutorChatMsg = {
  role: "user" | "assistant";
  text: string;
  at: string;
};

export type TutorThread = {
  id: string;
  title: string;
  updatedAt: string;
  messages: TutorChatMsg[];
};

export type TutorChatStore = {
  activeId: string;
  threads: TutorThread[];
};

function storageKey(nodeId: string) {
  return `${PREFIX}${nodeId}`;
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function threadTitleFromMessages(messages: TutorChatMsg[]): string {
  const firstUser = messages.find((m) => m.role === "user" && m.text.trim());
  if (!firstUser) return "New chat";
  const t = firstUser.text.replace(/\s+/g, " ").trim();
  return t.length > 48 ? `${t.slice(0, 46)}…` : t;
}

export function hasUserTurns(messages: TutorChatMsg[]): boolean {
  return messages.some((m) => m.role === "user" && m.text.trim());
}

export function createThreadId() {
  return newId();
}

export function emptyStore(greeting: TutorChatMsg): TutorChatStore {
  const id = newId();
  return {
    activeId: id,
    threads: [
      {
        id,
        title: "New chat",
        updatedAt: greeting.at,
        messages: [greeting],
      },
    ],
  };
}

export function loadTutorStore(nodeId: string): TutorChatStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(nodeId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TutorChatStore;
    if (!parsed?.activeId || !Array.isArray(parsed.threads)) return null;
    const threads = parsed.threads
      .filter((t) => t && typeof t.id === "string" && Array.isArray(t.messages))
      .map((t) => ({
        ...t,
        messages: t.messages
          .filter(
            (m) =>
              m &&
              (m.role === "user" || m.role === "assistant") &&
              typeof m.text === "string",
          )
          .map((m) => ({
            role: m.role,
            text: m.text,
            at: typeof m.at === "string" ? m.at : new Date().toISOString(),
          }))
          .slice(-MAX_MESSAGES),
      }));
    if (!threads.length) return null;
    const activeId = threads.some((t) => t.id === parsed.activeId)
      ? parsed.activeId
      : threads[0].id;
    return { activeId, threads };
  } catch {
    return null;
  }
}

export function saveTutorStore(nodeId: string, store: TutorChatStore) {
  if (typeof window === "undefined") return;
  try {
    const threads = store.threads
      .slice()
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .slice(0, MAX_THREADS)
      .map((t) => ({ ...t, messages: t.messages.slice(-MAX_MESSAGES) }));
    const activeId = threads.some((t) => t.id === store.activeId)
      ? store.activeId
      : threads[0]?.id || store.activeId;
    localStorage.setItem(
      storageKey(nodeId),
      JSON.stringify({ activeId, threads } satisfies TutorChatStore),
    );
  } catch {
    /* quota / private mode */
  }
}

export function archiveThenNewThread(
  store: TutorChatStore,
  currentMessages: TutorChatMsg[],
  greeting: TutorChatMsg,
  newId: string,
): TutorChatStore {
  const snapped = upsertActiveThread(store, currentMessages);
  const kept = snapped.threads.filter((t) => hasUserTurns(t.messages));
  const thread: TutorThread = {
    id: newId,
    title: "New chat",
    updatedAt: greeting.at,
    messages: [greeting],
  };
  return { activeId: newId, threads: [thread, ...kept] };
}

export function upsertActiveThread(
  store: TutorChatStore,
  messages: TutorChatMsg[],
): TutorChatStore {
  const now = new Date().toISOString();
  const existing = store.threads.find((t) => t.id === store.activeId);
  const thread: TutorThread = {
    id: store.activeId,
    title: threadTitleFromMessages(messages),
    updatedAt: now,
    messages,
  };
  const threads = existing
    ? store.threads.map((t) => (t.id === store.activeId ? thread : t))
    : [thread, ...store.threads];
  return { ...store, threads };
}
