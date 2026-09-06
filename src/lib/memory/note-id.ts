import type { TimelineItem } from "@/lib/memory/types";

function asId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const id = value.trim();
  if (id.length < 8) return null;
  return id;
}

/** Real notes.id — not the remapped roadmap/challenge source on the timeline item. */
export function noteIdFromTimelineItem(item: TimelineItem): string | null {
  const m = item.metadata || {};
  return (
    asId(m.noteId) ||
    asId(m.memorySourceId) ||
    (item.sourceType === "note" ? asId(item.sourceId) : null)
  );
}
