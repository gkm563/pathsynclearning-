"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MemoryLaneHeader } from "@/components/memory-lane/MemoryLaneHeader";
import { MemorySections } from "@/components/memory-lane/MemorySections";
import {
  MemoryFilters,
  MemorySearch,
} from "@/components/memory-lane/MemoryFilters";
import { MemoryTimeline } from "@/components/memory-lane/MemoryTimeline";
import { MemoryDetail } from "@/components/memory-lane/MemoryDetail";
import { MemorySettingsPanel } from "@/components/memory-lane/MemorySettingsPanel";
import { AddNoteButton } from "@/components/memory-lane/AddNoteButton";
import {
  Button,
  EmptyState,
  ErrorState,
  ListSkeleton,
  Toolbar,
} from "@/components/ui";
import { apiGet } from "@/lib/api";
import { routes } from "@/lib/routes";
import { MEMORY_SECTION_META, SECTION_FILTERS } from "@/lib/memory/sections";
import { noteIdFromTimelineItem } from "@/lib/memory/note-id";
import type {
  MemoryFilter,
  MemorySection,
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

const DEFAULT_SECTION_COUNTS = { roadmap: 0, challenges: 0, general: 0 };

function parseSection(raw: string | null): MemorySection {
  if (raw === "roadmap" || raw === "challenges" || raw === "general") return raw;
  return "roadmap";
}

function noteDefaults(section: MemorySection) {
  if (section === "roadmap") {
    return {
      sourceType: "roadmap",
      sourceId: "personal",
      contextLabel: "Roadmap note",
    };
  }
  if (section === "challenges") {
    return {
      sourceType: "challenge",
      sourceId: "personal",
      contextLabel: "Challenge note",
    };
  }
  return {
    sourceType: "career",
    sourceId: "personal",
    contextLabel: "Personal Memory Lane note",
  };
}

export default function PlatformMemoryLane() {
  const router = useRouter();
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [section, setSection] = useState<MemorySection>(() => {
    if (typeof window === "undefined") return "roadmap";
    return parseSection(new URLSearchParams(window.location.search).get("section"));
  });
  const [filter, setFilter] = useState<MemoryFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<TimelineItem | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<MemorySettingsDto>(DEFAULT_SETTINGS);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const changeSection = (next: MemorySection) => {
    setSection(next);
    setFilter("all");
    const url = new URL(window.location.href);
    url.searchParams.set("section", next);
    window.history.replaceState({}, "", url);
  };

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("section", section);
    p.set("filter", filter);
    p.set("limit", "30");
    if (debouncedSearch) p.set("search", debouncedSearch);
    return p.toString();
  }, [section, filter, debouncedSearch]);

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
    if (!items.length) return;
    const noteParam = new URLSearchParams(window.location.search).get("note");
    if (!noteParam) return;
    const match = items.find((item) => {
      if (item.kind !== "note" && item.type !== "PERSONAL_NOTE") return false;
      return (
        noteIdFromTimelineItem(item) === noteParam ||
        item.id === noteParam ||
        item.sourceId === noteParam
      );
    });
    if (match) setSelected(match);
  }, [items]);

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
    const noteId = noteIdFromTimelineItem(selected);
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
  const sectionMeta = MEMORY_SECTION_META[section];
  const noteMeta = noteDefaults(section);

  return (
    <div className="min-w-0 w-full">
      <MemoryLaneHeader
        onOpenSettings={() => setSettingsOpen(true)}
        onExport={() => void exportJourney()}
      />

      <MemorySections
        value={section}
        counts={stats?.sections ?? DEFAULT_SECTION_COUNTS}
        onChange={changeSection}
      />

      <Toolbar>
        <MemorySearch value={search} onChange={setSearch} />
        <AddNoteButton
          sourceType={noteMeta.sourceType}
          sourceId={noteMeta.sourceId}
          defaultTitle=""
          contextLabel={noteMeta.contextLabel}
        />
      </Toolbar>
      <MemoryFilters
        value={filter}
        onChange={setFilter}
        filters={SECTION_FILTERS[section]}
      />

      {error && !loading && items.length === 0 ? (
        <div className="mt-6">
          <ErrorState
            title="Couldn't load Memory Lane"
            description="The timeline didn't come back. Retry, and if it keeps failing the service is temporarily unavailable."
            detail={error}
            action={
              <Button variant="secondary" onClick={() => void load(null, false)}>
                Try again
              </Button>
            }
          />
        </div>
      ) : null}

      {error && items.length > 0 ? (
        <p className="type-small mt-4 mb-0 font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? <ListSkeleton count={6} className="mt-6" /> : null}

      {!loading && emptySearch ? (
        <div className="mt-7">
          <EmptyState
            title="No memories found"
            description="Try another search or remove some filters."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear filters
              </Button>
            }
          />
        </div>
      ) : null}

      {!loading && empty && !emptySearch ? (
        <div className="mt-7">
          <EmptyState
            title={sectionMeta.emptyTitle}
            description={sectionMeta.emptyDescription}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {section === "roadmap" || section === "general" ? (
                  <Button onClick={() => router.push(routes.app.roadmap)}>
                    Open Roadmap
                  </Button>
                ) : null}
                {section === "challenges" || section === "general" ? (
                  <Button
                    variant={section === "general" ? "secondary" : "primary"}
                    onClick={() => router.push(routes.app.challenges)}
                  >
                    Try a Challenge
                  </Button>
                ) : null}
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
          onDeleteNote={
            selected.kind === "note" || selected.type === "PERSONAL_NOTE"
              ? () => void deleteSelectedNote()
              : undefined
          }
          onNoteSaved={(note) => {
            setSelected((prev) =>
              prev
                ? {
                    ...prev,
                    title: note.title,
                    description: note.content.slice(0, 280),
                    visibility:
                      note.visibility === "public" ? "public" : prev.visibility,
                  }
                : prev,
            );
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
