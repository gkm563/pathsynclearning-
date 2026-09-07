"use client";

import { channelIcon } from "./channelIcons";
import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Channel } from "./types";

export function ChannelSidebar({
  channels,
  selectedId,
  onSelect,
}: {
  channels: readonly Channel[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <h2 className="type-label m-0 text-faint">Community spaces</h2>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {channels.map((channel) => {
          const selected = selectedId === channel.id;
          const Icon = channelIcon(channel.id);
          return (
            <li key={channel.id}>
              <button
                type="button"
                onClick={() => onSelect(channel.id)}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "flex min-h-11 w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-left transition-colors",
                  selected
                    ? "bg-primary-soft text-primary"
                    : "text-ink hover:bg-sunken",
                )}
              >
                <Icon size={16} aria-hidden className="shrink-0" />
                <span className="type-small min-w-0 flex-1 truncate font-semibold">
                  {channel.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
