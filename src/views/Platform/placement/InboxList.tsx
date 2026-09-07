"use client";

import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  STATUS_TONE,
  type RecruiterMessage,
} from "./inbox-data";

/**
 * Recruiter message list.
 *
 * On desktop this is the left pane of a split view; on phones it is the whole
 * screen and selecting a row swaps in the detail view. Both cases share this
 * component so read/unread state can never diverge between the two layouts.
 */
export function InboxList({
  messages,
  selectedId,
  readIds,
  onSelect,
}: {
  messages: readonly RecruiterMessage[];
  selectedId: string | null;
  readIds: ReadonlySet<string>;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {messages.map((message) => {
        const active = message.id === selectedId;
        const unread = !readIds.has(message.id);
        return (
          <li key={message.id} className="min-w-0">
            <button
              type="button"
              onClick={() => onSelect(message.id)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex w-full min-w-0 flex-col gap-2 rounded-[var(--radius-md)] border px-3.5 py-3 text-left transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active
                  ? "border-primary-border bg-primary-soft"
                  : "border-line bg-surface hover:bg-sunken",
              )}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden
                  className={cn(
                    "type-label grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] border",
                    active
                      ? "border-primary-border bg-surface text-primary"
                      : "border-line bg-sunken text-muted",
                  )}
                >
                  {message.initials}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "type-label block truncate",
                      unread ? "text-ink" : "text-muted",
                    )}
                  >
                    {message.company}
                    {unread ? (
                      <span className="sr-only"> — unread</span>
                    ) : null}
                  </span>
                  <span className="type-caption block truncate text-faint">
                    {message.receivedOn}
                  </span>
                </span>

                {unread ? (
                  <span
                    aria-hidden
                    className="h-2 w-2 shrink-0 rounded-full bg-accent"
                  />
                ) : null}
              </span>

              <span
                className={cn(
                  "type-small block truncate font-semibold",
                  active ? "text-primary" : "text-ink",
                )}
              >
                {message.role}
              </span>

              <span className="type-small line-clamp-2 block text-muted">
                {message.snippet}
              </span>

              <span className="flex items-center justify-between gap-2">
                <Badge tone={STATUS_TONE[message.status.kind]}>
                  {message.status.label}
                </Badge>
                <ChevronRight
                  size={16}
                  aria-hidden
                  className="shrink-0 text-faint"
                />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
