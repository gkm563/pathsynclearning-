"use client";

import React, { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  LoaderCircle,
  MoreHorizontal,
  Plus,
  Route,
  Trash2,
  Pencil,
} from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import type { RoadmapSummary } from "@/types/roadmap";
import { AnimatePresence, motion } from "framer-motion";
import { Button, IconButton, Input } from "@/components/ui";
import { cn } from "@/lib/cn";

export default function RoadmapSwitcher({
  activeRoadmapId,
  activeTitle,
  onSwitched,
  onCreateNew,
  onBusyChange,
  embedded = false,
  children,
}: {
  activeRoadmapId: string;
  activeTitle: string;
  onSwitched: () => void | Promise<void>;
  onCreateNew: () => void;
  onBusyChange?: (busy: boolean) => void;
  /** Compact trigger for the canvas overview nav bar. */
  embedded?: boolean;
  children?: (api: {
    open: boolean;
    trigger: ReactNode;
    list: ReactNode;
  }) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<RoadmapSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ roadmaps: RoadmapSummary[] }>("/api/roadmap/list");
      setItems(res.roadmaps || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      setOpen(false);
      setMenuId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMenuId(null);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const switchTo = async (id: string) => {
    if (id === activeRoadmapId) {
      setOpen(false);
      return;
    }
    setBusyId(id);
    onBusyChange?.(true);
    try {
      await apiSend("/api/roadmap/switch", "POST", { roadmapId: id });
      setOpen(false);
      await onSwitched();
    } finally {
      setBusyId(null);
      onBusyChange?.(false);
    }
  };

  const saveRename = async (id: string) => {
    const title = renameValue.trim();
    if (!title) {
      setRenamingId(null);
      return;
    }
    setBusyId(id);
    try {
      await apiSend(`/api/roadmap/${id}`, "PATCH", { title });
      setRenamingId(null);
      await load();
      if (id === activeRoadmapId) await onSwitched();
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (
      !confirm(
        "Delete this roadmap? Progress and assessments on it will be removed. Other roadmaps are kept.",
      )
    ) {
      return;
    }
    setBusyId(id);
    onBusyChange?.(true);
    try {
      await apiSend(`/api/roadmap/${id}`, "DELETE");
      setMenuId(null);
      await load();
      await onSwitched();
    } finally {
      setBusyId(null);
      onBusyChange?.(false);
    }
  };

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      title="Switch roadmap"
      aria-expanded={open}
      aria-haspopup="listbox"
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-2 text-ink",
        embedded
          ? "my-[-2px] rounded-[10px] border-0 bg-transparent py-0.5 pr-1.5 pl-0.5"
          : "rounded-[var(--radius-md)] border border-line bg-surface/92 px-3 py-2 shadow-[var(--shadow-sm)] backdrop-blur-md",
      )}
    >
      <div
        className="grid shrink-0 place-items-center rounded-[9px] bg-primary-soft"
        style={{
          width: embedded ? 28 : 32,
          height: embedded ? 28 : 32,
        }}
      >
        <Route size={embedded ? 14 : 16} color="var(--primary)" />
      </div>
      <span className="flex min-w-0 flex-col items-start gap-0.5">
        {embedded ? (
          <span className="type-overline leading-none text-muted">Roadmap</span>
        ) : null}
        <span
          className={cn(
            "overflow-hidden text-ellipsis whitespace-nowrap font-bold leading-tight",
            embedded ? "type-label max-w-[min(220px,48vw)]" : "type-small max-w-[220px]",
          )}
        >
          {activeTitle || "My roadmap"}
        </span>
      </span>
      <ChevronDown
        size={15}
        className={cn(
          "shrink-0 text-muted transition-transform duration-[var(--duration-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none",
          open && "rotate-180",
        )}
      />
    </button>
  );

  const list = (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="roadmap-list"
          role="listbox"
          aria-label="Your roadmaps"
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          transition={{
            height: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
          }}
          className="min-w-0 w-full overflow-hidden border-t border-line"
        >
          <div className="type-overline px-3.5 pt-3 pb-2 text-muted">Your roadmaps</div>

          <div className="max-h-[min(50dvh,22rem)] overflow-y-auto px-2 pb-2">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center gap-2 p-4 text-muted">
                <LoaderCircle
                  size={16}
                  aria-hidden
                  className="animate-spin text-primary motion-reduce:animate-none"
                />
                <p className="type-small m-0">Loading roadmaps…</p>
              </div>
            ) : null}

            {items.map((item) => {
              const active = item.id === activeRoadmapId;
              const renaming = renamingId === item.id;
              return (
                <div
                  key={item.id}
                  className={cn(
                    "mb-0.5 flex items-start gap-1.5 rounded-[var(--radius-md)] px-1.5 py-2",
                    active && "bg-primary-soft",
                  )}
                >
                  <button
                    type="button"
                    disabled={Boolean(busyId)}
                    onClick={() => void switchTo(item.id)}
                    className="min-w-0 flex-1 cursor-pointer border-0 bg-transparent px-1.5 py-1 text-left text-ink"
                  >
                    {renaming ? (
                      <Input
                        autoFocus
                        value={renameValue}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void saveRename(item.id);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onBlur={() => void saveRename(item.id)}
                        className="min-h-0 py-1.5"
                      />
                    ) : (
                      <>
                        <div className="type-label flex items-center gap-1.5">
                          <span className="truncate">{item.title}</span>
                          {busyId === item.id ? (
                            <LoaderCircle
                              size={14}
                              aria-hidden
                              className="shrink-0 animate-spin text-primary motion-reduce:animate-none"
                            />
                          ) : active ? (
                            <Check size={14} className="shrink-0 text-primary" />
                          ) : null}
                        </div>
                        <div className="type-caption mt-0.5 text-muted">
                          {item.targetCompany ? `${item.targetCompany} · ` : ""}
                          {item.completionPercent}% · {item.completedNodes ?? 0}/
                          {item.nodeCount} nodes
                          {typeof item.remainingHours === "number"
                            ? ` · ~${item.remainingHours}h left`
                            : item.estimatedWeeks
                              ? ` · ~${item.estimatedWeeks}w`
                              : ""}
                        </div>
                      </>
                    )}
                  </button>

                  <div className="relative shrink-0">
                    <IconButton
                      label="More"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuId((v) => (v === item.id ? null : item.id));
                      }}
                    >
                      <MoreHorizontal size={16} />
                    </IconButton>
                    {menuId === item.id ? (
                      <div className="absolute top-full right-0 z-[2] mt-1 min-w-[140px] rounded-[var(--radius-md)] border border-line bg-surface py-1 shadow-[var(--shadow-md)]">
                        <button
                          type="button"
                          onClick={() => {
                            setRenamingId(item.id);
                            setRenameValue(item.title);
                            setMenuId(null);
                          }}
                          className="type-label flex w-full items-center gap-2 px-3 py-2.5 text-left text-ink hover:bg-sunken"
                        >
                          <Pencil size={14} /> Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(item.id)}
                          className="type-label flex w-full items-center gap-2 px-3 py-2.5 text-left text-danger hover:bg-sunken"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-line p-2">
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-[var(--primary-border)] bg-primary-soft text-primary hover:bg-primary-soft"
              onClick={() => {
                setOpen(false);
                onCreateNew();
              }}
            >
              <Plus size={16} /> Create new roadmap
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  const body = children ? (
    children({ open, trigger, list })
  ) : (
    <>
      {trigger}
      {list}
    </>
  );

  return (
    <div ref={rootRef} className="contents">
      {body}
    </div>
  );
}
