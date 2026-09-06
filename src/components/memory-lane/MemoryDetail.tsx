"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, Maximize2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { MEMORY_TYPE_META } from "@/lib/memory/constants";
import { noteIdFromTimelineItem } from "@/lib/memory/note-id";
import type { TimelineItem } from "@/lib/memory/types";
import { Button } from "@/components/ui/primitives";
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
    emoji: "✦",
    color: "var(--purple)",
  };
  const m = item.metadata || {};
  const isNote = item.kind === "note" || item.type === "PERSONAL_NOTE";
  const [mounted, setMounted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [fullNote, setFullNote] = useState<string | null>(item.note?.content || null);
  const [title, setTitle] = useState(item.title);
  const [loadingNote, setLoadingNote] = useState(isNote && !item.note?.content);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const rows: Array<[string, string]> = [];
  if (typeof m.score === "number") rows.push(["Score", `${m.score}%`]);
  if (typeof m.difficulty === "string") rows.push(["Difficulty", String(m.difficulty)]);
  if (typeof m.previousBest === "number") rows.push(["Previous Best", `${m.previousBest}%`]);
  if (typeof m.checklistPct === "number") rows.push(["Checklist", `${m.checklistPct}%`]);
  if (typeof m.assessmentType === "string") rows.push(["Assessment", String(m.assessmentType)]);
  if (typeof m.category === "string") rows.push(["Category", String(m.category)]);
  if (typeof m.repository === "string") rows.push(["Repository", String(m.repository)]);
  if (typeof m.previousGoal === "string") rows.push(["Previous Goal", String(m.previousGoal)]);
  if (typeof m.newGoal === "string") rows.push(["New Goal", String(m.newGoal)]);
  if (Array.isArray(m.topics) && m.topics.length) rows.push(["Topics", m.topics.join(", ")]);
  if (Array.isArray(m.skills) && m.skills.length) rows.push(["Skills", m.skills.join(", ")]);
  if (m.personalBestLabel) rows.push(["Highlight", String(m.personalBestLabel)]);

  const noteId = noteIdFromTimelineItem(item);
  const canEdit = isNote && Boolean(noteId);

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isNote ? (editing ? "Edit note" : "Full note") : "Memory details"}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2500,
        background: "rgba(15,23,42,0.45)",
        display: "flex",
        justifyContent: isNote ? "center" : "flex-end",
        alignItems: isNote ? "center" : "stretch",
        padding: isNote ? 16 : 0,
      }}
      onClick={editing ? undefined : onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: isNote ? "min(720px, 100%)" : "min(440px, 100%)",
          height: isNote ? "min(88vh, 900px)" : "100%",
          background: "var(--bg-card)",
          borderLeft: isNote ? "none" : "1px solid var(--border-light)",
          borderRadius: isNote ? 18 : 0,
          border: isNote ? "1px solid var(--border-light)" : undefined,
          boxShadow: isNote
            ? "0 24px 60px rgba(15,23,42,0.22)"
            : "-12px 0 40px rgba(15,23,42,0.18)",
          padding: isNote ? "24px 28px" : 24,
          overflowY: "auto",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ color: meta.color, fontWeight: 800, fontSize: 13 }}>
            {isNote ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Maximize2 size={14} /> {editing ? "Editing note" : "Full note"}
              </span>
            ) : (
              <>
                {meta.emoji} {meta.label}
              </>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        {editing && canEdit ? (
          <div style={{ marginTop: 16 }}>
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
          </div>
        ) : (
          <>
            <h2 style={{ margin: "12px 0 0", fontSize: isNote ? 26 : 24, fontWeight: 800, lineHeight: 1.25 }}>
              {title}
            </h2>
            <p style={{ margin: "8px 0 0", color: "var(--text-light)", fontSize: 13 }}>
              {new Date(item.occurredAt).toLocaleString()}
            </p>

            {loadingNote && isNote ? (
              <p style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 13 }}>Loading full note…</p>
            ) : body ? (
              <div
                style={{
                  marginTop: 18,
                  color: "var(--text-main)",
                  fontSize: 15,
                }}
              >
                <RichStudyText text={body} />
              </div>
            ) : (
              <p style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 13 }}>
                This note has no saved content.
              </p>
            )}

            {rows.length ? (
              <dl style={{ marginTop: 20, display: "grid", gap: 10 }}>
                {rows.map(([k, v]) => (
                  <div key={k}>
                    <dt style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase" }}>
                      {k}
                    </dt>
                    <dd style={{ margin: "2px 0 0", fontSize: 14, color: "var(--text-main)" }}>{v}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
              Visibility: {item.visibility === "public" ? "Public" : "Private"}
            </div>

            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
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
                  Open Related Activity <ExternalLink size={14} />
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
                  Open linked lesson <ExternalLink size={14} />
                </Button>
              ) : null}
            </div>
          </>
        )}
      </aside>
    </div>
  );

  if (!mounted) return null;
  return createPortal(dialog, document.body);
}
