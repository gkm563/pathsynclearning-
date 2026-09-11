import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import { copilotMessages, copilotThreads } from "@/lib/db/schema";
import type {
  CopilotChatMsg,
  CopilotNavigate,
  CopilotProposedWrite,
  CopilotThreadSummary,
} from "./copilot-types";

const MAX_THREADS = 40;
const MAX_MESSAGES = 80;

function titleFromText(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "New chat";
  return t.length > 48 ? `${t.slice(0, 46)}…` : t;
}

export async function listCopilotThreads(
  userId: string,
): Promise<CopilotThreadSummary[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: copilotThreads.id,
      title: copilotThreads.title,
      updatedAt: copilotThreads.updatedAt,
    })
    .from(copilotThreads)
    .where(eq(copilotThreads.userId, userId))
    .orderBy(desc(copilotThreads.updatedAt))
    .limit(MAX_THREADS);

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function createCopilotThread(
  userId: string,
  title = "New chat",
): Promise<CopilotThreadSummary> {
  const db = getDb();
  const [row] = await db
    .insert(copilotThreads)
    .values({ userId, title })
    .returning();
  return {
    id: row.id,
    title: row.title,
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureOwnThread(userId: string, threadId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(copilotThreads)
    .where(and(eq(copilotThreads.id, threadId), eq(copilotThreads.userId, userId)))
    .limit(1);
  if (!row) throw AppError.notFound("Chat not found");
  return row;
}

export async function getCopilotThread(userId: string, threadId: string) {
  const thread = await ensureOwnThread(userId, threadId);
  const db = getDb();
  const rows = await db
    .select()
    .from(copilotMessages)
    .where(eq(copilotMessages.threadId, threadId))
    .orderBy(copilotMessages.createdAt)
    .limit(MAX_MESSAGES);

  const messages: CopilotChatMsg[] = rows
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      const meta = m.meta || {};
      return {
        id: m.id,
        role: m.role as "user" | "assistant",
        text: m.content,
        at: m.createdAt.toISOString(),
        navigate: Array.isArray(meta.navigate)
          ? (meta.navigate as CopilotNavigate[])
          : undefined,
        proposedWrites: Array.isArray(meta.proposedWrites)
          ? (meta.proposedWrites as CopilotProposedWrite[])
          : undefined,
        writeStatus:
          meta.writeStatus === "done" ||
          meta.writeStatus === "cancelled" ||
          meta.writeStatus === "pending"
            ? meta.writeStatus
            : undefined,
      };
    });

  return {
    thread: {
      id: thread.id,
      title: thread.title,
      updatedAt: thread.updatedAt.toISOString(),
    },
    messages,
  };
}

export async function deleteCopilotThread(userId: string, threadId: string) {
  await ensureOwnThread(userId, threadId);
  const db = getDb();
  await db.delete(copilotThreads).where(eq(copilotThreads.id, threadId));
}

export async function appendCopilotTurn(input: {
  userId: string;
  threadId?: string | null;
  userText: string;
  assistantText: string;
  navigate?: CopilotNavigate[];
  proposedWrites?: CopilotProposedWrite[];
}): Promise<{ threadId: string; assistantMessageId: string }> {
  const db = getDb();
  let threadId = input.threadId || "";

  if (threadId) {
    await ensureOwnThread(input.userId, threadId);
  } else {
    const created = await createCopilotThread(
      input.userId,
      titleFromText(input.userText),
    );
    threadId = created.id;
  }

  const now = new Date();
  const inserted = await db
    .insert(copilotMessages)
    .values([
      {
        threadId,
        role: "user",
        content: input.userText,
        meta: {},
        createdAt: now,
      },
      {
        threadId,
        role: "assistant",
        content: input.assistantText,
        meta: {
          navigate: input.navigate || [],
          proposedWrites: input.proposedWrites || [],
          writeStatus: input.proposedWrites?.length ? "pending" : undefined,
        },
        createdAt: new Date(now.getTime() + 1),
      },
    ])
    .returning({ id: copilotMessages.id, role: copilotMessages.role });

  const assistantMessageId =
    inserted.find((row) => row.role === "assistant")?.id ||
    inserted[inserted.length - 1]?.id;
  if (!assistantMessageId) {
    throw AppError.badRequest("Failed to save Copilot reply");
  }

  const titlePatch: { updatedAt: Date; title?: string } = { updatedAt: new Date() };
  const [existing] = await db
    .select({ title: copilotThreads.title })
    .from(copilotThreads)
    .where(eq(copilotThreads.id, threadId))
    .limit(1);
  if (existing?.title === "New chat") {
    titlePatch.title = titleFromText(input.userText);
  }

  await db
    .update(copilotThreads)
    .set(titlePatch)
    .where(eq(copilotThreads.id, threadId));

  return { threadId, assistantMessageId };
}

export async function markCopilotWriteStatus(
  userId: string,
  threadId: string,
  messageId: string,
  writeStatus: "done" | "cancelled",
) {
  await ensureOwnThread(userId, threadId);
  const db = getDb();
  const [row] = await db
    .select()
    .from(copilotMessages)
    .where(
      and(eq(copilotMessages.id, messageId), eq(copilotMessages.threadId, threadId)),
    )
    .limit(1);
  if (!row) throw AppError.notFound("Message not found");
  await db
    .update(copilotMessages)
    .set({
      meta: { ...(row.meta || {}), writeStatus },
    })
    .where(eq(copilotMessages.id, messageId));
}
