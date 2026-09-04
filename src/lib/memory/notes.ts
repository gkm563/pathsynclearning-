import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import { memories, noteLinks, notes } from "@/lib/db/schema";
import { createMemory } from "@/lib/memory/memories";
import type { NoteVisibility } from "@/lib/memory/types";

export type CreateNoteInput = {
  userId: string;
  title: string;
  content: string;
  visibility?: NoteVisibility;
  sourceType?: string | null;
  sourceId?: string | null;
  links?: Array<{ entityType: string; entityId: string }>;
};

export type UpdateNoteInput = {
  title?: string;
  content?: string;
  visibility?: NoteVisibility;
};

async function ensureOwnNote(userId: string, noteId: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1);
  if (!row) throw AppError.notFound("Note not found");
  return row;
}

export async function createNote(input: CreateNoteInput) {
  const db = getDb();
  const visibility = input.visibility ?? "private";

  const [note] = await db
    .insert(notes)
    .values({
      userId: input.userId,
      title: input.title.trim(),
      content: input.content.trim(),
      visibility,
      sourceType: input.sourceType ?? null,
      sourceId: input.sourceId ?? null,
    })
    .returning();

  if (input.links?.length) {
    await db.insert(noteLinks).values(
      input.links.map((l) => ({
        noteId: note.id,
        entityType: l.entityType,
        entityId: l.entityId,
      })),
    );
  }

  await createMemory({
    userId: input.userId,
    type: "PERSONAL_NOTE",
    title: note.title,
    description: note.content.slice(0, 280),
    occurredAt: note.createdAt,
    sourceType: "note",
    sourceId: note.id,
    visibility: visibility === "public" ? "public" : "private",
    metadata: {
      noteId: note.id,
      sourceType: note.sourceType,
      sourceId: note.sourceId,
      excerpt: note.content.slice(0, 160),
    },
  });

  return note;
}

export async function getNoteById(userId: string, noteId: string) {
  const note = await ensureOwnNote(userId, noteId);
  const db = getDb();
  const links = await db
    .select()
    .from(noteLinks)
    .where(eq(noteLinks.noteId, note.id));
  return { ...note, links };
}

export async function getNotes(
  userId: string,
  opts?: {
    sourceType?: string;
    sourceId?: string;
    limit?: number;
    publicOnly?: boolean;
  },
) {
  const db = getDb();
  const conditions = [eq(notes.userId, userId)];
  if (opts?.sourceType) conditions.push(eq(notes.sourceType, opts.sourceType));
  if (opts?.sourceId) conditions.push(eq(notes.sourceId, opts.sourceId));
  if (opts?.publicOnly) conditions.push(eq(notes.visibility, "public"));

  return db
    .select()
    .from(notes)
    .where(and(...conditions))
    .orderBy(desc(notes.createdAt))
    .limit(opts?.limit ?? 100);
}

export async function updateNote(
  userId: string,
  noteId: string,
  input: UpdateNoteInput,
) {
  await ensureOwnNote(userId, noteId);
  const db = getDb();
  const patch: {
    updatedAt: Date;
    title?: string;
    content?: string;
    visibility?: string;
  } = { updatedAt: new Date() };
  if (input.title !== undefined) patch.title = input.title.trim();
  if (input.content !== undefined) patch.content = input.content.trim();
  if (input.visibility !== undefined) patch.visibility = input.visibility;

  const [updated] = await db
    .update(notes)
    .set(patch)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning();

  const [memory] = await db
    .select()
    .from(memories)
    .where(
      and(
        eq(memories.userId, userId),
        eq(memories.sourceType, "note"),
        eq(memories.sourceId, noteId),
      ),
    )
    .limit(1);

  if (memory) {
    await db
      .update(memories)
      .set({
        title: updated.title,
        description: updated.content.slice(0, 280),
        visibility: updated.visibility === "public" ? "public" : "private",
        metadata: {
          ...(memory.metadata || {}),
          noteId: updated.id,
          sourceType: updated.sourceType,
          sourceId: updated.sourceId,
          excerpt: updated.content.slice(0, 160),
        },
        updatedAt: new Date(),
      })
      .where(eq(memories.id, memory.id));
  }

  return updated;
}

export async function deleteNote(userId: string, noteId: string) {
  await ensureOwnNote(userId, noteId);
  const db = getDb();

  await db
    .delete(memories)
    .where(
      and(
        eq(memories.userId, userId),
        eq(memories.sourceType, "note"),
        eq(memories.sourceId, noteId),
      ),
    );

  const [deleted] = await db
    .delete(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning({ id: notes.id });

  return deleted ?? null;
}

export async function linkNoteToEntity(
  userId: string,
  noteId: string,
  entityType: string,
  entityId: string,
) {
  await ensureOwnNote(userId, noteId);
  const db = getDb();
  await db
    .insert(noteLinks)
    .values({ noteId, entityType, entityId })
    .onConflictDoNothing();
  return getNoteById(userId, noteId);
}

export async function getPublicNotes(userId: string, limit = 50) {
  return getNotes(userId, { publicOnly: true, limit });
}

export async function searchNotes(userId: string, query: string, limit = 40) {
  const db = getDb();
  const q = `%${query.trim()}%`;
  return db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        or(ilike(notes.title, q), ilike(notes.content, q)),
      ),
    )
    .orderBy(desc(notes.createdAt))
    .limit(limit);
}

export async function countNotes(userId: string) {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notes)
    .where(eq(notes.userId, userId));
  return Number(row?.count) || 0;
}
