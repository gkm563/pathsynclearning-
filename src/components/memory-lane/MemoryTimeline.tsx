"use client";

import React, { useMemo } from "react";
import { MemoryCard } from "@/components/memory-lane/MemoryCard";
import type { TimelineItem } from "@/lib/memory/types";

function yearOf(iso: string) {
  return new Date(iso).getFullYear();
}

function monthDay(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function MemoryTimeline({
  items,
  onOpen,
  loadingMore,
  onLoadMore,
  hasMore,
}: {
  items: TimelineItem[];
  onOpen: (item: TimelineItem) => void;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}) {
  const grouped = useMemo(() => {
    const map = new Map<number, TimelineItem[]>();
    for (const item of items) {
      const y = yearOf(item.occurredAt);
      const list = map.get(y) || [];
      list.push(item);
      map.set(y, list);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [items]);

  return (
    <div style={{ marginTop: 28 }}>
      {grouped.map(([year, yearItems]) => (
        <section key={year} style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: 22,
              fontWeight: 800,
              margin: "0 0 16px",
              color: "var(--text-main)",
            }}
          >
            {year}
          </h2>
          <div style={{ position: "relative", paddingLeft: 28 }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 7,
                top: 4,
                bottom: 4,
                width: 2,
                background: "var(--border-light)",
              }}
            />
            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 18 }}>
              {yearItems.map((item) => (
                <li key={`${item.kind}-${item.id}`} style={{ position: "relative" }}>
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: -25,
                      top: 18,
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background:
                        item.kind === "note"
                          ? "#64748b"
                          : item.kind === "milestone"
                            ? "#22c55e"
                            : "var(--purple)",
                      border: "2px solid var(--bg-main)",
                      boxShadow: "0 0 0 2px var(--border-light)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--text-light)",
                      marginBottom: 6,
                      fontFamily: "Outfit, sans-serif",
                    }}
                  >
                    {monthDay(item.occurredAt)}
                  </div>
                  <MemoryCard item={item} onOpen={onOpen} />
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}

      {hasMore ? (
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            style={{
              borderRadius: 10,
              border: "1.5px solid var(--border-light)",
              background: "var(--bg-card)",
              padding: "10px 16px",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              cursor: "pointer",
              color: "var(--text-main)",
            }}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
