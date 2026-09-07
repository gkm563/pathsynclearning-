/**
 * Layout tokens for the student home widgets.
 *
 * Colour never appears here as a literal. Every value is a Tailwind utility
 * bridged to the semantic variables in `globals.css`, so the widgets follow
 * the light/dark themes without a second palette to keep in sync.
 */

export const homeUi = {
  /** Surface shared by every home widget. */
  card: "flex min-w-0 flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-xs)] sm:p-5",
  /** Widget header row: title block on the left, action on the right. */
  cardHead: "mb-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2",
  cardTitle: "type-h4 m-0 text-ink",
  cardHint: "type-small mt-0.5 mb-0 text-muted",
  /** Inline text link sized to a 44px touch target. */
  link: "type-label inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-sm)] px-1 text-primary transition-colors duration-[var(--duration-fast)] hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  /** Small metric pill used for streak / totals. */
  chip: "type-caption type-numeric inline-flex items-center gap-1.5 rounded-full border border-line bg-sunken px-2.5 py-1 text-muted",
} as const;

/**
 * Bar tones cycled through the skill list. Restricted to the `Progress`
 * primitive's tone union so no widget invents its own colour.
 */
export const SKILL_TONES = [
  "primary",
  "accent",
  "success",
  "warning",
] as const;

/**
 * Heatmap cell fill for intensity 0–4.
 *
 * Opacity modifiers on the bridged `primary` colour give the four steps a
 * single hue ramp, which reads as one scale rather than four unrelated swatches.
 */
export function heatLevelClass(level: number): string {
  switch (level) {
    case 1:
      return "bg-primary/25";
    case 2:
      return "bg-primary/45";
    case 3:
      return "bg-primary/70";
    case 4:
      return "bg-primary";
    default:
      return "bg-sunken";
  }
}
