"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import {
  CircleAlert,
  Globe,
  Lock,
  Sparkles,
  StickyNote,
  Undo2,
  Loader2,
} from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import {
  Button,
  Card,
  Dialog,
  EmptyState,
  Input,
  Segmented,
  Textarea,
} from "@/components/ui";
import { RichStudyText } from "@/components/ai/RichStudyText";
import { cn } from "@/lib/cn";

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
  style?: CSSProperties;
};

type NoteCorrection = {
  wrong: string;
  correct: string;
  explain: string;
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
  className,
  onSaved,
}: NoteSourceProps & { onSaved?: (note: NoteRow) => void }) {
  const [open, setOpen] = useState(false);
  const isIde = variant === "ide";

  return (
    <>
      {isIde ? (
        <button
          type="button"
          title={titleAttr}
          aria-label={titleAttr}
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[var(--radius-md)] border border-line-strong bg-surface px-2.5 text-xs font-semibold text-ink",
            "hover:bg-sunken",
            compact ? "h-8 w-8 justify-center px-0" : "h-8",
            className,
          )}
          style={style}
        >
          <StickyNote size={14} aria-hidden />
          {compact ? null : "Notes"}
        </button>
      ) : (
        <Button
          variant="secondary"
          size={compact ? "sm" : "md"}
          title={titleAttr}
          aria-label={titleAttr}
          onClick={() => setOpen(true)}
          className={className}
          style={style}
        >
          <StickyNote size={compact ? 14 : 15} aria-hidden />
          {compact ? "Note" : "Add Note"}
        </Button>
      )}
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
  bare = false,
}: NoteSourceProps & {
  noteId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialVisibility?: "private" | "public";
  onClose: () => void;
  onSaved?: (note: NoteRow) => void;
  inline?: boolean;
  bare?: boolean;
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
  const [corrections, setCorrections] = useState<NoteCorrection[]>([]);

  useEffect(() => {
    if (!noteId) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiGet<{ note?: NoteRow }>(
          `/api/me/notes?id=${encodeURIComponent(noteId)}`,
        );
        if (cancelled || !res.note) return;
        setTitle(res.note.title);
        setContent(res.note.content);
        if (res.note.visibility === "public" || res.note.visibility === "private") {
          setVisibility(res.note.visibility);
        }
      } catch {
        /* keep initialContent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [noteId]);

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
      const res = await apiSend<{
        title?: string;
        content?: string;
        corrections?: NoteCorrection[];
      }>("/api/ai/notes/enhance", "POST", {
        title,
        content,
        contextLabel,
        sourceType,
      });
      const nextTitle = typeof res.title === "string" ? res.title.trim() : "";
      const nextContent = typeof res.content === "string" ? res.content.trim() : "";
      if (!nextContent) {
        setError("Could not enhance that note. Try again.");
        return;
      }
      setUndoSnapshot(snapshot);
      if (nextTitle) setTitle(nextTitle.slice(0, 200));
      setContent(nextContent.slice(0, 12000));
      setCorrections(
        Array.isArray(res.corrections)
          ? res.corrections.filter(
              (c) => c && c.wrong && c.correct && c.explain,
            )
          : [],
      );
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
    setCorrections([]);
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
    <div className="flex flex-col gap-3">
      <label className="type-label text-ink" htmlFor="note-title">
        Title
      </label>
      <Input
        id="note-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Understanding Recursion"
      />

      <label className="type-label text-ink" htmlFor="note-content">
        Note
      </label>
      <Textarea
        id="note-content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="I finally understood how recursion works..."
        rows={bare ? 10 : inline ? 5 : 6}
        disabled={enhancing}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void enhance()}
          disabled={enhancing || saving || content.trim().length < 8}
          title="Clean up and structure this note with AI"
        >
          {enhancing ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : (
            <Sparkles size={14} aria-hidden />
          )}
          {enhancing ? "Enhancing…" : "Enhance with AI"}
        </Button>
        {undoSnapshot ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={undoEnhance}
            disabled={enhancing}
          >
            <Undo2 size={14} aria-hidden /> Undo
          </Button>
        ) : (
          <span className="type-caption text-muted">
            Cleans up notes, fixes mistakes, and explains what was wrong.
          </span>
        )}
      </div>

      {content.trim() ? (
        <div className="rounded-[var(--radius-md)] border border-line bg-sunken p-3">
          <p className="type-overline mb-2 text-faint">Preview</p>
          <RichStudyText text={content} />
        </div>
      ) : null}

      {corrections.length > 0 ? (
        <div className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--warning)_35%,var(--border-light))] bg-[var(--warning-soft)] p-3">
          <p className="type-label mb-2 inline-flex items-center gap-1.5 text-warning">
            <CircleAlert size={15} aria-hidden /> What was wrong
          </p>
          <div className="grid gap-2.5">
            {corrections.map((c, i) => (
              <div key={`${c.wrong}-${i}`} className="type-small text-ink">
                <div>
                  <strong className="text-danger">You wrote:</strong>{" "}
                  <RichStudyText text={c.wrong} />
                </div>
                <div className="mt-1">
                  <strong className="text-success">Correct:</strong>{" "}
                  <RichStudyText text={c.correct} />
                </div>
                <div className="mt-1 text-muted">
                  <strong className="text-ink">Why:</strong>{" "}
                  <RichStudyText text={c.explain} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : undoSnapshot ? (
        <p className="type-caption m-0 text-success">
          No factual mistakes found — notes were cleaned up.
        </p>
      ) : null}

      {contextLabel ? (
        <p className="type-small m-0 text-muted">{contextLabel}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2.5">
        <span className="type-label text-muted">Visibility</span>
        <Segmented
          size="sm"
          ariaLabel="Note visibility"
          value={visibility}
          onChange={setVisibility}
          items={[
            {
              id: "private",
              label: "Private",
              icon: <Lock size={12} aria-hidden />,
            },
            {
              id: "public",
              label: "Public",
              icon: <Globe size={12} aria-hidden />,
            },
          ]}
        />
      </div>

      {error ? (
        <p className="type-small m-0 font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {inline || bare ? (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving || enhancing}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving || enhancing} loading={saving}>
            {saving ? "Saving…" : "Save Note"}
          </Button>
        </div>
      ) : null}
    </div>
  );

  if (inline || bare) {
    return (
      <div role="form" aria-label={noteId ? "Edit note" : "Add note"}>
        {form}
      </div>
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={noteId ? "Edit note" : "Add note"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving || enhancing}>
            Cancel
          </Button>
          <Button onClick={() => void save()} disabled={saving || enhancing} loading={saving}>
            {saving ? "Saving…" : "Save Note"}
          </Button>
        </>
      }
    >
      {form}
    </Dialog>
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
    <Card className="border-dashed">
      <p className="type-overline m-0 mb-1.5 text-faint">Personal Note</p>
      <h4 className="type-h4 m-0 text-ink">{note.title}</h4>
      <div className="mt-2 text-ink">
        <RichStudyText text={note.content} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="type-caption text-faint">{date}</span>
        <span className="type-caption text-faint">
          {note.visibility === "public" ? "Public" : "Private"}
        </span>
        {onEdit ? (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        ) : null}
        {onDelete ? (
          <Button variant="danger" size="sm" onClick={onDelete}>
            Delete
          </Button>
        ) : null}
      </div>
    </Card>
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
    <div className="grid gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <strong className="type-label text-ink">
          Your notes{notes.length ? ` (${notes.length})` : ""}
        </strong>
        {inline ? (
          !showEditor ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditing(null);
                setComposing(true);
              }}
            >
              <StickyNote size={14} aria-hidden /> Note
            </Button>
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
        <p className="type-small m-0 text-muted">Loading notes…</p>
      ) : null}
      {!loading && notes.length === 0 && !showEditor ? (
        <EmptyState
          compact
          title="No notes yet"
          description={
            emptyHint ||
            "Capture key takeaways while you study — they stay linked to this topic."
          }
        />
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
