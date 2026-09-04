"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MemoryLaneHeader } from "@/components/memory-lane/MemoryLaneHeader";
import {
  MemoryFilters,
  MemorySearch,
} from "@/components/memory-lane/MemoryFilters";
import { MemoryTimeline } from "@/components/memory-lane/MemoryTimeline";
import { MemoryDetail } from "@/components/memory-lane/MemoryDetail";
import { MemorySettingsPanel } from "@/components/memory-lane/MemorySettingsPanel";
import {
  AddNoteButton,
  NoteEditor,
} from "@/components/memory-lane/AddNoteButton";
import { EmptyState, PageSpinner } from "@/components/ui/primitives";
import { apiGet } from "@/lib/api";
import { routes } from "@/lib/routes";
import type {
  MemoryFilter,
  MemorySettingsDto,
  MemoryStats,
  TimelineItem,
} from "@/lib/memory/types";

type TimelineResponse = {
  items: TimelineItem[];
  nextCursor: string | null;
  stats: MemoryStats;
};

const DEFAULT_SETTINGS: MemorySettingsDto = {
  includeLearning: true,
  includeProjects: true,
  includeAchievements: true,
  includeCertifications: true,
  includeMentorship: true,
  includeChallenges: true,
  includeEvents: true,
  includeCareer: true,
  includePrivateNotes: true,
  allowAiNotes: false,
};

export default function PlatformMemoryLane() {
  const router = useRouter();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [filter, setFilter] = useState<MemoryFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<TimelineItem | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<MemorySettingsDto>(DEFAULT_SETTINGS);
  const [editingNote, setEditingNote] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("filter", filter);
    p.set("limit", "30");
    if (debouncedSearch) p.set("search", debouncedSearch);
    return p.toString();
  }, [filter, debouncedSearch]);

  const load = useCallback(
    async (cursor?: string | null, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams(queryString);
        if (cursor) qs.set("cursor", cursor);
        const data = await apiGet<TimelineResponse>(
          `/api/me/memory-lane?${qs.toString()}`,
        );
        setStats(data.stats);
        setNextCursor(data.nextCursor);
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load Memory Lane");
        if (!append) setItems([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [queryString],
  );

  useEffect(() => {
    void load(null, false);
  }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiGet<{ settings: MemorySettingsDto }>(
          "/api/me/memory-lane?settings=1",
        );
        if (res.settings) setSettings(res.settings);
      } catch {
        /* defaults */
      }
    })();
  }, []);

  const exportJourney = async () => {
    try {
      const res = await apiGet<{ journey: unknown }>(
        "/api/me/memory-lane?export=1",
      );
      const blob = new Blob([JSON.stringify(res.journey, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pathed-memory-lane-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    }
  };

  const deleteSelectedNote = async () => {
    if (!selected) return;
    const noteId =
      (typeof selected.metadata?.noteId === "string" &&
        selected.metadata.noteId) ||
      selected.sourceId ||
      (selected.metadata?.memorySourceId as string | undefined);
    if (!noteId) return;
    await fetch(`/api/me/notes/${noteId}`, {
      method: "DELETE",
      credentials: "include",
    });
    setSelected(null);
    void load(null, false);
  };

  const empty = !loading && items.length === 0;
  const emptySearch = empty && (Boolean(debouncedSearch) || filter !== "all");

  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <MemoryLaneHeader
          stats={stats}
          onOpenSettings={() => setSettingsOpen(true)}
          onExport={() => void exportJourney()}
        />

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
          }}
        >
          <MemorySearch value={search} onChange={setSearch} />
          <AddNoteButton
            sourceType="career"
            sourceId="personal"
            defaultTitle=""
            contextLabel="Personal Memory Lane note"
          />
        </div>
        <MemoryFilters value={filter} onChange={setFilter} />

        {error ? (
          <p style={{ color: "#ef4444", marginTop: 16, fontSize: 14 }}>{error}</p>
        ) : null}

        {loading ? <PageSpinner label="Loading your journey…" /> : null}

        {!loading && emptySearch ? (
          <div style={{ marginTop: 28 }}>
            <EmptyState
              title="No memories found."
              description="Try another search or remove some filters."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--purple)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Clear filters
                </button>
              }
            />
          </div>
        ) : null}

        {!loading && empty && !emptySearch ? (
          <div style={{ marginTop: 28 }}>
            <EmptyState
              title="🧠 Your Memory Lane is waiting."
              description="Complete a learning activity, challenge, project, or milestone and your journey will appear here. You can also add your own personal notes."
              action={
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => router.push(routes.app.roadmap)}
                    style={cta}
                  >
                    Open Roadmap
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(routes.app.challenges)}
                    style={cta}
                  >
                    Try a Challenge
                  </button>
                </div>
              }
            />
          </div>
        ) : null}

        {!loading && items.length > 0 ? (
          <MemoryTimeline
            items={items}
            onOpen={setSelected}
            hasMore={Boolean(nextCursor)}
            loadingMore={loadingMore}
            onLoadMore={() => void load(nextCursor, true)}
          />
        ) : null}

      {selected ? (
        <MemoryDetail
          item={selected}
          onClose={() => setSelected(null)}
          onEditNote={
            selected.kind === "note" || selected.type === "PERSONAL_NOTE"
              ? () => setEditingNote(true)
              : undefined
          }
          onDeleteNote={
            selected.kind === "note" || selected.type === "PERSONAL_NOTE"
              ? () => void deleteSelectedNote()
              : undefined
          }
        />
      ) : null}

      {editingNote && selected ? (
        <NoteEditor
          sourceType={
            (selected.metadata?.sourceType as string) ||
            selected.sourceType ||
            "career"
          }
          sourceId={
            (selected.metadata?.sourceId as string) ||
            selected.sourceId ||
            "personal"
          }
          noteId={
            (selected.metadata?.noteId as string) ||
            (selected.metadata?.memorySourceId as string) ||
            selected.sourceId ||
            undefined
          }
          initialTitle={selected.title}
          initialContent={selected.description || ""}
          initialVisibility={
            selected.visibility === "public" ? "public" : "private"
          }
          onClose={() => setEditingNote(false)}
          onSaved={() => {
            setEditingNote(false);
            setSelected(null);
            void load(null, false);
          }}
        />
      ) : null}

      {settingsOpen ? (
        <MemorySettingsPanel
          initial={settings}
          onClose={() => setSettingsOpen(false)}
          onSaved={(s) => {
            setSettings(s);
            void load(null, false);
          }}
        />
      ) : null}
    </div>
  );
}

const cta: React.CSSProperties = {
  borderRadius: 10,
  border: "1.5px solid var(--border-light)",
  background: "var(--bg-card)",
  padding: "10px 14px",
  fontFamily: "Outfit, sans-serif",
  fontWeight: 700,
  cursor: "pointer",
  color: "var(--text-main)",
};
