"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { MEMORY_TYPE_META } from "@/lib/memory/constants";
import { noteIdFromTimelineItem } from "@/lib/memory/note-id";
import type { TimelineItem } from "@/lib/memory/types";
import { Button, DescriptionList, Dialog, Skeleton } from "@/components/ui";
import { RichStudyText } from "@/components/ai/RichStudyText";
import { NoteEditor } from "@/components/memory-lane/AddNoteButton";
import { apiGet } from "@/lib/api";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function unwrapNoteContent(raw: unknown): string | null {
  const rec = asRecord(raw);
  if (!rec) return null;
  const candidates = [rec, asRecord(rec.note), asRecord(rec.memory), asRecord(rec.data)];
  for (const obj of candidates) {
    if (!obj) continue;
    if (typeof obj.content === "string" && obj.content.trim()) return obj.content;
    const nestedNote = asRecord(obj.note);
    if (nestedNote && typeof nestedNote.content === "string" && nestedNote.content.trim()) {
      return nestedNote.content;
    }
  }
  return null;
}

export function MemoryDetail({
  item,
  onClose,
  onDeleteNote,
  onNoteSaved,
}: {
  item: TimelineItem & { note?: { id: string; content: string; updatedAt?: string } | null };
  onClose: () => void;
  onDeleteNote?: () => void;
  onNoteSaved?: (note: { title: string; content: string; visibility?: string }) => void;
}) {
  const router = useRouter();
  const meta = MEMORY_TYPE_META[item.type] || {
    label: item.type,
    emoji: "",
    color: "var(--primary)",
  };
  const m = item.metadata || {};
  const isNote = item.kind === "note" || item.type === "PERSONAL_NOTE";
  const [editing, setEditing] = useState(false);
  const [fullNote, setFullNote] = useState<string | null>(item.note?.content || null);
  const [title, setTitle] = useState(item.title);
  const [loadingNote, setLoadingNote] = useState(isNote && !item.note?.content);

  useEffect(() => {
    setEditing(false);
    setTitle(item.title);
  }, [item.id, item.title]);

  useEffect(() => {
    if (!isNote) {
      setFullNote(null);
      setLoadingNote(false);
      return;
    }
    if (item.note?.content) {
      setFullNote(item.note.content);
      setLoadingNote(false);
      return;
    }
    let cancelled = false;
    setLoadingNote(true);
    void (async () => {
      const noteId = noteIdFromTimelineItem(item);
      let content: string | null = null;
      try {
        const res = await apiGet<unknown>(
          `/api/me/memory-lane?id=${encodeURIComponent(item.id)}`,
        );
        content = unwrapNoteContent(res);
      } catch {
        /* try notes API */
      }
      if (!content && noteId) {
        try {
          const res = await apiGet<unknown>(
            `/api/me/notes/${encodeURIComponent(noteId)}`,
          );
          content = unwrapNoteContent(res);
        } catch {
          try {
            const res = await apiGet<unknown>(
              `/api/me/notes?id=${encodeURIComponent(noteId)}`,
            );
            content = unwrapNoteContent(res);
          } catch {
            content = null;
          }
        }
      }
      if (!cancelled) {
        setFullNote(content || item.description);
        setLoadingNote(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [item, isNote]);

  const body = isNote ? fullNote || item.description : item.description;

  const rows: Array<{ label: string; value: string }> = [];
  if (typeof m.score === "number") rows.push({ label: "Score", value: `${m.score}%` });
  if (typeof m.difficulty === "string") rows.push({ label: "Difficulty", value: String(m.difficulty) });
  if (typeof m.previousBest === "number") rows.push({ label: "Previous Best", value: `${m.previousBest}%` });
  if (typeof m.checklistPct === "number") rows.push({ label: "Checklist", value: `${m.checklistPct}%` });
  if (typeof m.assessmentType === "string") rows.push({ label: "Assessment", value: String(m.assessmentType) });
  if (typeof m.category === "string") rows.push({ label: "Category", value: String(m.category) });
  if (typeof m.repository === "string") rows.push({ label: "Repository", value: String(m.repository) });
  if (typeof m.previousGoal === "string") rows.push({ label: "Previous Goal", value: String(m.previousGoal) });
  if (typeof m.newGoal === "string") rows.push({ label: "New Goal", value: String(m.newGoal) });
  if (Array.isArray(m.topics) && m.topics.length) rows.push({ label: "Topics", value: m.topics.join(", ") });
  if (Array.isArray(m.skills) && m.skills.length) rows.push({ label: "Skills", value: m.skills.join(", ") });
  if (m.personalBestLabel) rows.push({ label: "Highlight", value: String(m.personalBestLabel) });

  const noteId = noteIdFromTimelineItem(item);
  const canEdit = isNote && Boolean(noteId);

  return (
    <Dialog
      open
      onClose={onClose}
      title={isNote ? (editing ? "Editing note" : "Full note") : meta.label}
      description={new Date(item.occurredAt).toLocaleString()}
      size={isNote ? "lg" : "md"}
      dismissible={!editing}
      footer={
        editing ? undefined : (
          <>
            {canEdit ? (
              <Button onClick={() => setEditing(true)} disabled={loadingNote}>
                Edit
              </Button>
            ) : null}
            {isNote && onDeleteNote ? (
              <Button variant="danger" onClick={onDeleteNote}>
                Delete
              </Button>
            ) : null}
            {!isNote && item.href ? (
              <Button
                onClick={() => {
                  router.push(item.href!);
                  onClose();
                }}
              >
                Open Related Activity <ExternalLink size={14} aria-hidden />
              </Button>
            ) : null}
            {isNote && item.href ? (
              <Button
                variant="secondary"
                onClick={() => {
                  router.push(item.href!);
                  onClose();
                }}
              >
                Open linked lesson <ExternalLink size={14} aria-hidden />
              </Button>
            ) : null}
          </>
        )
      }
    >
      {editing && canEdit ? (
        <NoteEditor
          sourceType={
            (typeof item.metadata?.sourceType === "string" && item.metadata.sourceType) ||
            item.sourceType ||
            "career"
          }
          sourceId={
            (typeof item.metadata?.sourceId === "string" && item.metadata.sourceId) ||
            item.sourceId ||
            "personal"
          }
          noteId={noteId || undefined}
          initialTitle={title}
          initialContent={body || ""}
          initialVisibility={item.visibility === "public" ? "public" : "private"}
          bare
          onClose={() => setEditing(false)}
          onSaved={(note) => {
            setTitle(note.title);
            setFullNote(note.content);
            setEditing(false);
            onNoteSaved?.(note);
          }}
        />
      ) : (
        <>
          <p className="type-h3 mt-0 mb-3 text-ink">{title}</p>

          {loadingNote && isNote ? (
            <div className="flex flex-col gap-2" aria-hidden>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : body ? (
            <div className="type-body text-ink">
              <RichStudyText text={body} />
            </div>
          ) : (
            <p className="type-small m-0 text-muted">This note has no saved content.</p>
          )}

          {rows.length ? (
            <DescriptionList items={rows} className="mt-5" />
          ) : null}

          <p className="type-caption mt-4 mb-0 text-muted">
            Visibility: {item.visibility === "public" ? "Public" : "Private"}
          </p>
        </>
      )}
    </Dialog>
  );
}
