"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/cn";
import { IconButton } from "@/components/ui";

/**
 * Bookmark toggle used on every news surface.
 *
 * The on/off state is carried by three signals, not colour alone: a filled vs
 * outlined glyph, `aria-pressed`, and visually hidden status text. Sized to a
 * 44px target so it stays comfortable on touch.
 */
export function BookmarkToggle({
  bookmarked,
  onToggle,
  title,
  className,
  floating = false,
}: {
  bookmarked: boolean;
  onToggle: () => void;
  /** Article title, so the accessible name is unique within a grid. */
  title: string;
  className?: string;
  /** Overlays the card cover instead of sitting inline. */
  floating?: boolean;
}) {
  return (
    <IconButton
      label={
        bookmarked ? `Remove bookmark: ${title}` : `Bookmark article: ${title}`
      }
      aria-pressed={bookmarked}
      variant="secondary"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      className={cn(
        "h-11 w-11 min-h-11",
        bookmarked ? "text-primary" : "text-muted",
        // Rendered after the card link in the DOM, so it paints above the
        // cover without needing a z-index.
        floating && "absolute top-2.5 right-2.5",
        className,
      )}
    >
      <Bookmark
        size={18}
        aria-hidden
        strokeWidth={bookmarked ? 2.4 : 2}
        className={cn(bookmarked ? "fill-current" : "fill-none")}
      />
      <span className="sr-only">{bookmarked ? "Saved" : "Not saved"}</span>
    </IconButton>
  );
}
