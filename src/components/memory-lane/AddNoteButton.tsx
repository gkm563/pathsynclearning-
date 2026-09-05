"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Lock, Sparkles, StickyNote, Undo2, X, Loader2 } from "lucide-react";
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
  onSaved,
}: NoteSourceProps & { onSaved?: (note: NoteRow) => void }) {
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
          onSaved={onSaved}
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
  inline = false,
}: NoteSourceProps & {
  noteId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialVisibility?: "private" | "public";
  onClose: () => void;
  onSaved?: (note: NoteRow) => void;
  /** Render form in-place instead of a centered modal overlay. */
  inline?: boolean;
}) {
  const [title, setTitle] = useState(initialTitle ?? defaultTitle);
  const [content, setContent] = useState(initialContent ?? "");
  const [visibility, setVisibility] = useState<"private" | "public">(
    initialVisibility,
  );
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState("");
  const [undoSnapshot, setUndoSnapshot] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const enhance = async () => {
    if (enhancing || saving) return;
    if (content.trim().length < 8) {
      setError("Write a bit more first — AI needs at least a short note to enhance.");
      return;
    }
    setEnhancing(true);
    setError("");
    const snapshot = { title, content };
    try {
      const res = await apiSend<{ title?: string; content?: string }>(
        "/api/ai/notes/enhance",
        "POST",
        {
          title,
          content,
          contextLabel,
          sourceType,
        },
      );
      const nextTitle = typeof res.title === "string" ? res.title.trim() : "";
      const nextContent = typeof res.content === "string" ? res.content.trim() : "";
      if (!nextContent) {
        setError("Could not enhance that note. Try again.");
        return;
      }
      setUndoSnapshot(snapshot);
      if (nextTitle) setTitle(nextTitle.slice(0, 200));
      setContent(nextContent.slice(0, 12000));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not enhance note");
    } finally {
      setEnhancing(false);
    }
  };

  const undoEnhance = () => {
    if (!undoSnapshot) return;
    setTitle(undoSnapshot.title);
    setContent(undoSnapshot.content);
    setUndoSnapshot(null);
  };

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

  const form = (
    <div
      onClick={inline ? undefined : (e) => e.stopPropagation()}
      style={{
        width: inline ? "100%" : "min(480px, 100%)",
        background: "var(--bg-card)",
        borderRadius: inline ? 12 : 18,
        border: "1.5px solid var(--border-light)",
        boxShadow: inline ? "none" : "0 24px 60px rgba(15,23,42,0.25)",
        padding: inline ? 14 : 20,
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
        <h3 style={{ margin: 0, fontSize: inline ? 15 : 18, fontWeight: 800, color: "var(--text-main)" }}>
          {noteId ? "Edit note" : "Add note"}
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
          boxSizing: "border-box",
        }}
      />

      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
        Note
      </label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="I finally understood how recursion works..."
        rows={inline ? 5 : 6}
        disabled={enhancing}
        style={{
          width: "100%",
          marginTop: 6,
          marginBottom: 8,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1.5px solid var(--border-light)",
          background: "var(--bg-alt)",
          color: "var(--text-main)",
          fontFamily: "Inter, sans-serif",
          fontSize: 14,
          lineHeight: 1.6,
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => void enhance()}
          disabled={enhancing || saving || content.trim().length < 8}
          title="Clean up and structure this note with AI"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            borderRadius: 999,
            border: "1.5px solid rgba(108,99,255,0.35)",
            background: "rgba(108,99,255,0.08)",
            color: "#6c63ff",
            padding: "7px 12px",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 700,
            fontSize: 12,
            cursor: enhancing || saving || content.trim().length < 8 ? "not-allowed" : "pointer",
            opacity: enhancing || saving || content.trim().length < 8 ? 0.55 : 1,
          }}
        >
          {enhancing ? <Loader2 size={14} className="spin-note-ai" /> : <Sparkles size={14} />}
          {enhancing ? "Enhancing…" : "Enhance with AI"}
        </button>
        {undoSnapshot ? (
          <button
            type="button"
            onClick={undoEnhance}
            disabled={enhancing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "none",
              background: "transparent",
              color: "var(--text-muted)",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            <Undo2 size={14} /> Undo
          </button>
        ) : (
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "Inter, sans-serif" }}>
            Cleans up messy notes. You can edit before saving.
          </span>
        )}
      </div>

      {contextLabel ? (
        <div
          style={{
            marginBottom: 12,
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          {contextLabel}
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
        <Button variant="ghost" onClick={onClose} disabled={saving || enhancing}>
          Cancel
        </Button>
        <Button onClick={() => void save()} disabled={saving || enhancing}>
          {saving ? "Saving…" : "Save Note"}
        </Button>
      </div>
      <style>{`
        .spin-note-ai { animation: spin-note-ai 0.9s linear infinite; }
        @keyframes spin-note-ai { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  if (inline) {
    return (
      <div role="form" aria-label={noteId ? "Edit note" : "Add note"}>
        {form}
      </div>
    );
  }

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
      {form}
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
  defaultTitle,
  links,
  emptyHint,
  inline = false,
}: {
  sourceType: string;
  sourceId: string;
  contextLabel?: string;
  defaultTitle?: string;
  links?: Array<{ entityType: string; entityId: string }>;
  emptyHint?: string;
  /** Edit/add notes in-panel instead of a modal overlay. */
  inline?: boolean;
}) {
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [editing, setEditing] = useState<NoteRow | null>(null);
  const [composing, setComposing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ notes: NoteRow[] }>(
        `/api/me/notes?sourceType=${encodeURIComponent(sourceType)}&sourceId=${encodeURIComponent(sourceId)}`,
      );
      setNotes(res.notes || []);
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [sourceType, sourceId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setEditing(null);
    setComposing(false);
  }, [sourceId]);

  const remove = async (id: string) => {
    await fetch(`/api/me/notes/${id}`, { method: "DELETE", credentials: "include" });
    void load();
  };

  const showEditor = composing || editing;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ fontFamily: "Outfit, sans-serif", color: "var(--text-main)" }}>
          Your notes{notes.length ? ` (${notes.length})` : ""}
        </strong>
        {inline ? (
          !showEditor ? (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setComposing(true);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 8,
                border: "1.5px solid var(--border-light)",
                background: "var(--bg-card)",
                color: "var(--text-main)",
                padding: "6px 10px",
                fontFamily: "Outfit, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <StickyNote size={14} /> Note
            </button>
          ) : null
        ) : (
          <AddNoteButton
            sourceType={sourceType}
            sourceId={sourceId}
            defaultTitle={defaultTitle}
            contextLabel={contextLabel}
            links={links}
            compact
            onSaved={() => void load()}
          />
        )}
      </div>

      {inline && showEditor ? (
        <NoteEditor
          key={editing?.id || "new"}
          sourceType={sourceType}
          sourceId={sourceId}
          defaultTitle={defaultTitle}
          contextLabel={contextLabel}
          links={links}
          noteId={editing?.id}
          initialTitle={editing?.title}
          initialContent={editing?.content}
          initialVisibility={editing?.visibility === "public" ? "public" : "private"}
          inline
          onClose={() => {
            setEditing(null);
            setComposing(false);
          }}
          onSaved={() => {
            setEditing(null);
            setComposing(false);
            void load();
          }}
        />
      ) : null}

      {loading && notes.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", fontFamily: "Inter, sans-serif" }}>
          Loading notes…
        </p>
      ) : null}
      {!loading && notes.length === 0 && !showEditor ? (
        <p
          style={{
            margin: 0,
            padding: 14,
            borderRadius: 12,
            background: "var(--bg-alt)",
            border: "1px dashed var(--border-light)",
            fontSize: 13,
            color: "var(--text-muted)",
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.5,
          }}
        >
          {emptyHint ||
            "No notes yet. Capture key takeaways while you study — they stay linked to this topic."}
        </p>
      ) : null}
      {notes.map((n) =>
        inline && editing?.id === n.id ? null : (
          <NoteCard
            key={n.id}
            note={n}
            onEdit={() => {
              setComposing(false);
              setEditing(n);
            }}
            onDelete={() => void remove(n.id)}
          />
        ),
      )}
      {!inline && editing ? (
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
