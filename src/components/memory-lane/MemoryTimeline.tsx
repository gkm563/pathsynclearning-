"use client";

import { useMemo } from "react";
import { MemoryCard } from "@/components/memory-lane/MemoryCard";
import type { TimelineItem } from "@/lib/memory/types";
import { LoadMore, Section } from "@/components/ui";
import { cn } from "@/lib/cn";

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
    <div className="mt-6">
      {grouped.map(([year, yearItems]) => (
        <Section key={year} title={String(year)}>
          <div className="relative pl-7">
            <div
              aria-hidden
              className="absolute top-1 bottom-1 left-[7px] w-px bg-line"
            />
            <ol className="m-0 grid list-none gap-4 p-0">
              {yearItems.map((item) => (
                <li key={`${item.kind}-${item.id}`} className="relative">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-5 -left-[22px] h-3 w-3 rounded-full border-2 border-canvas bg-primary shadow-[0_0_0_2px_var(--border-light)]",
                      item.kind === "note" && "bg-muted",
                      item.kind === "milestone" && "bg-success",
                    )}
                  />
                  <p className="type-overline mb-2 text-faint">
                    {monthDay(item.occurredAt)}
                  </p>
                  <MemoryCard item={item} onOpen={onOpen} />
                </li>
              ))}
            </ol>
          </div>
        </Section>
      ))}

      {hasMore && onLoadMore ? (
        <LoadMore
          hasMore
          loading={Boolean(loadingMore)}
          onClick={onLoadMore}
        />
      ) : null}
    </div>
  );
}
