"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  MoreHorizontal,
  Plus,
  Route,
  Trash2,
  Pencil,
} from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import type { RoadmapSummary } from "@/types/roadmap";

type PanelPos = { top: number; left: number; width: number };

export default function RoadmapSwitcher({
  activeRoadmapId,
  activeTitle,
  onSwitched,
  onCreateNew,
  embedded = false,
}: {
  activeRoadmapId: string;
  activeTitle: string;
  onSwitched: () => void | Promise<void>;
  onCreateNew: () => void;
  /** Compact trigger for the canvas overview nav bar. */
  embedded?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<RoadmapSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [pos, setPos] = useState<PanelPos | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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

  const updatePosition = useCallback(() => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24);
    let left = rect.left;
    if (left + width > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - width - 12);
    }
    setPos({
      top: rect.bottom + 8,
      left,
      width,
    });
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    updatePosition();
    const onWin = () => updatePosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, updatePosition, items.length]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
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
    try {
      await apiSend("/api/roadmap/switch", "POST", { roadmapId: id });
      setOpen(false);
      await onSwitched();
    } finally {
      setBusyId(null);
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
    try {
      await apiSend(`/api/roadmap/${id}`, "DELETE");
      setMenuId(null);
      await load();
      await onSwitched();
    } finally {
      setBusyId(null);
    }
  };

  const needsListScroll = items.length > 6;

  const panel =
    open && pos && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            role="listbox"
            aria-label="Your roadmaps"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 1200,
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)",
              borderRadius: 16,
              boxShadow: "0 16px 40px rgba(15,23,42,0.16)",
              display: "flex",
              flexDirection: "column",
              maxHeight: `min(420px, calc(100vh - ${pos.top + 16}px))`,
            }}
          >
            <div
              style={{
                padding: "12px 14px 8px",
                fontFamily: "Outfit",
                fontSize: 12,
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: 0.4,
                flexShrink: 0,
              }}
            >
              YOUR ROADMAPS
            </div>

            <div
              style={{
                padding: "0 8px 8px",
                // Only scroll when there are many roadmaps — avoid nested scroll for 1–few items
                overflowY: needsListScroll ? "auto" : "visible",
                flex: needsListScroll ? "1 1 auto" : "0 0 auto",
                minHeight: 0,
              }}
            >
              {loading && items.length === 0 ? (
                <p
                  style={{
                    margin: 0,
                    padding: 12,
                    fontSize: 13,
                    color: "var(--text-muted)",
                    fontFamily: "Inter",
                  }}
                >
                  Loading…
                </p>
              ) : null}

              {items.map((item) => {
                const active = item.id === activeRoadmapId;
                const renaming = renamingId === item.id;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 6,
                      padding: "8px 6px",
                      borderRadius: 12,
                      background: active ? "rgba(108,99,255,0.08)" : "transparent",
                      marginBottom: 2,
                    }}
                  >
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => void switchTo(item.id)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        padding: "4px 6px",
                        color: "var(--text-main)",
                      }}
                    >
                      {renaming ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void saveRename(item.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          onBlur={() => void saveRename(item.id)}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: 8,
                            border: "1.5px solid #6c63ff",
                            fontFamily: "Outfit",
                            fontSize: 13,
                            background: "var(--bg-alt)",
                            color: "var(--text-main)",
                            boxSizing: "border-box",
                          }}
                        />
                      ) : (
                        <>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              fontFamily: "Outfit",
                              fontWeight: 700,
                              fontSize: 13,
                            }}
                          >
                            <span
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.title}
                            </span>
                            {active ? <Check size={14} color="#6c63ff" /> : null}
                          </div>
                          <div
                            style={{
                              marginTop: 2,
                              fontSize: 11,
                              color: "var(--text-muted)",
                              fontFamily: "Inter",
                            }}
                          >
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

                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <button
                        type="button"
                        title="More"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId((v) => (v === item.id ? null : item.id));
                        }}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "var(--text-muted)",
                          padding: 6,
                          borderRadius: 8,
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {menuId === item.id ? (
                        <div
                          style={{
                            position: "absolute",
                            right: 0,
                            top: "100%",
                            marginTop: 4,
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-light)",
                            borderRadius: 10,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            minWidth: 140,
                            zIndex: 2,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingId(item.id);
                              setRenameValue(item.title);
                              setMenuId(null);
                            }}
                            style={menuItemStyle}
                          >
                            <Pencil size={14} /> Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => void remove(item.id)}
                            style={{ ...menuItemStyle, color: "#ef4444" }}
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

            <div
              style={{
                borderTop: "1px solid var(--border-light)",
                padding: 8,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onCreateNew();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1.5px dashed rgba(108,99,255,0.4)",
                  background: "rgba(108,99,255,0.06)",
                  color: "#6c63ff",
                  fontFamily: "Outfit",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> Create new roadmap
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Switch roadmap"
        aria-expanded={open}
        aria-haspopup="listbox"
        style={
          embedded
            ? {
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                maxWidth: 200,
                padding: "2px 6px 2px 2px",
                margin: "-2px 0",
                borderRadius: 10,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "var(--text-main)",
              }
            : {
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                maxWidth: 280,
                padding: "8px 12px",
                borderRadius: 12,
                border: "1.5px solid var(--border-light)",
                background: "rgba(var(--bg-card-rgb, 255, 255, 255), 0.92)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                cursor: "pointer",
                color: "var(--text-main)",
              }
        }
      >
        <div
          style={{
            width: embedded ? 28 : 32,
            height: embedded ? 28 : 32,
            borderRadius: 9,
            background: "rgba(108,99,255,0.12)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Route size={embedded ? 14 : 16} color="#6c63ff" />
        </div>
        <span
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            minWidth: 0,
            gap: 3,
          }}
        >
          {embedded ? (
            <span
              style={{
                fontFamily: "Fira Code, monospace",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "var(--text-muted)",
                lineHeight: 1,
              }}
            >
              ROADMAP
            </span>
          ) : null}
          <span
            style={{
              fontFamily: "Outfit",
              fontWeight: 700,
              fontSize: embedded ? 14 : 13,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: embedded ? 148 : 220,
              lineHeight: 1.15,
            }}
          >
            {activeTitle || "My roadmap"}
          </span>
        </span>
        <ChevronDown size={15} color="var(--text-muted)" />
      </button>
      {panel}
    </>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  padding: "10px 12px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontFamily: "Outfit",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-main)",
  textAlign: "left",
};
