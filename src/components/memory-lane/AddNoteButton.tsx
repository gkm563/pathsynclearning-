"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Lock, StickyNote, X } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import { Button } from "@/components/ui/primitives";

export type NoteSourceProps = {
  sourceType: string;
  sourceId: string;
  defaultTitle?: string;
  contextLabel?: string;
  links?: Array<{ entityType: string; entityId: string }>;
  compact?: boolean;
  /** Dark IDE toolbar style (icon + label matching coding chrome). */
  variant?: "default" | "ide";
  titleAttr?: string;
  className?: string;
  style?: React.CSSProperties;
};

type NoteRow = {
  id: string;
  title: string;
  content: string;
  visibility: string;
  createdAt: string;
};

export function AddNoteButton({
  sourceType,
  sourceId,
  defaultTitle = "",
  contextLabel,
  links,
  compact = false,
  variant = "default",
  titleAttr = "Notes",
  style,
}: NoteSourceProps) {
  const [open, setOpen] = useState(false);
  const isIde = variant === "ide";

  return (
    <>
      <button
        type="button"
        title={titleAttr}
        aria-label={titleAttr}
        onClick={() => setOpen(true)}
        style={
          isIde
            ? {
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                height: 32,
                padding: "0 10px",
                borderRadius: 6,
                border: "1px solid #3e3e3e",
                background: "#373737",
                color: "#eff1f6",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
                ...style,
              }
            : {
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: compact ? 8 : 10,
                border: "1.5px solid var(--border-light)",
                background: "var(--bg-card)",
                color: "var(--text-main)",
                padding: compact ? "6px 10px" : "8px 12px",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                fontSize: compact ? 12 : 13,
                cursor: "pointer",
                ...style,
              }
        }
      >
        <StickyNote size={isIde || compact ? 14 : 15} />
        {isIde ? "Notes" : compact ? "Note" : "Add Note"}
      </button>
      {open ? (
        <NoteEditor
          sourceType={sourceType}
          sourceId={sourceId}
          defaultTitle={defaultTitle}
          contextLabel={contextLabel}
          links={links}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

export function NoteEditor({
  sourceType,
  sourceId,
  defaultTitle = "",
  contextLabel,
  links,
  noteId,
  initialTitle,
  initialContent,
  initialVisibility = "private",
  onClose,
  onSaved,
}: NoteSourceProps & {
  noteId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialVisibility?: "private" | "public";
  onClose: () => void;
  onSaved?: (note: NoteRow) => void;
}) {
  const [title, setTitle] = useState(initialTitle ?? defaultTitle);
  const [content, setContent] = useState(initialContent ?? "");
  const [visibility, setVisibility] = useState<"private" | "public">(
    initialVisibility,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and note content are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (noteId) {
        const res = await apiSend<{ note: NoteRow }>(
          `/api/me/notes/${noteId}`,
          "PATCH",
          { title, content, visibility },
        );
        onSaved?.(res.note);
      } else {
        const res = await apiSend<{ note: NoteRow }>("/api/me/notes", "POST", {
          title,
          content,
          visibility,
          sourceType,
          sourceId,
          links,
        });
        onSaved?.(res.note);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Add note"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1400,
        background: "rgba(15,23,42,0.45)",
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(480px, 100%)",
          background: "var(--bg-card)",
          borderRadius: 18,
          border: "1.5px solid var(--border-light)",
          boxShadow: "0 24px 60px rgba(15,23,42,0.25)",
          padding: 20,
          fontFamily: "Outfit, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>
            📝 {noteId ? "Edit Note" : "Add Note"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--text-muted)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
          Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Understanding Recursion"
          style={{
            width: "100%",
            marginTop: 6,
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1.5px solid var(--border-light)",
            background: "var(--bg-alt)",
            color: "var(--text-main)",
            fontFamily: "Outfit, sans-serif",
            fontSize: 14,
          }}
        />

        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
          Note
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="I finally understood how recursion works..."
          rows={5}
          style={{
            width: "100%",
            marginTop: 6,
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1.5px solid var(--border-light)",
            background: "var(--bg-alt)",
            color: "var(--text-main)",
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            resize: "vertical",
          }}
        />

        {contextLabel ? (
          <div
            style={{
              marginBottom: 12,
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            🔗 {contextLabel}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          <Lock size={14} />
          <select
            value={visibility}
            onChange={(e) =>
              setVisibility(e.target.value as "private" | "public")
            }
            style={{
              border: "1.5px solid var(--border-light)",
              borderRadius: 8,
              padding: "6px 10px",
              background: "var(--bg-card)",
              color: "var(--text-main)",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 600,
            }}
          >
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </div>

        {error ? (
          <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10 }}>{error}</p>
        ) : null}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save Note"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: {
    id: string;
    title: string;
    content: string;
    visibility: string;
    createdAt: string | Date;
    sourceType?: string | null;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const date = new Date(note.createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article
      style={{
        borderRadius: 16,
        border: "1.5px dashed rgba(100,116,139,0.35)",
        background: "rgba(100,116,139,0.06)",
        padding: 16,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
        📝 Personal Note
      </div>
      <h4 style={{ margin: 0, fontFamily: "Outfit, sans-serif", fontSize: 16, fontWeight: 800 }}>
        {note.title}
      </h4>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.5,
          fontStyle: "italic",
        }}
      >
        “{note.content.slice(0, 220)}
        {note.content.length > 220 ? "…" : ""}”
      </p>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          fontSize: 12,
          color: "var(--text-light)",
        }}
      >
        <span>{date}</span>
        <span>{note.visibility === "public" ? "🌐 Public" : "🔒 Private"}</span>
        {onEdit ? (
          <button type="button" onClick={onEdit} style={{ border: "none", background: "none", color: "var(--purple)", cursor: "pointer", fontWeight: 700 }}>
            Edit
          </button>
        ) : null}
        {onDelete ? (
          <button type="button" onClick={onDelete} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontWeight: 700 }}>
            Delete
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function NotesForSource({
  sourceType,
  sourceId,
  contextLabel,
}: {
  sourceType: string;
  sourceId: string;
  contextLabel?: string;
}) {
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [editing, setEditing] = useState<NoteRow | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiGet<{ notes: NoteRow[] }>(
        `/api/me/notes?sourceType=${encodeURIComponent(sourceType)}&sourceId=${encodeURIComponent(sourceId)}`,
      );
      setNotes(res.notes || []);
    } catch {
      setNotes([]);
    }
  }, [sourceType, sourceId]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: string) => {
    await fetch(`/api/me/notes/${id}`, { method: "DELETE", credentials: "include" });
    void load();
  };

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontFamily: "Outfit, sans-serif" }}>Notes</strong>
        <AddNoteButton
          sourceType={sourceType}
          sourceId={sourceId}
          contextLabel={contextLabel}
          compact
        />
      </div>
      {notes.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          onEdit={() => setEditing(n)}
          onDelete={() => void remove(n.id)}
        />
      ))}
      {editing ? (
        <NoteEditor
          sourceType={sourceType}
          sourceId={sourceId}
          noteId={editing.id}
          initialTitle={editing.title}
          initialContent={editing.content}
          initialVisibility={editing.visibility === "public" ? "public" : "private"}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      ) : null}
    </div>
  );
}
