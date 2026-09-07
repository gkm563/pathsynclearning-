import type { ApplicationKind, Opportunity } from "./types";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * `2026-08-15` → `15 Aug 2026`.
 *
 * Deliberately not `toLocaleDateString`: these components render on the server
 * too, and a locale- or timezone-dependent string would hydrate differently on
 * the client. Unparseable input is passed through untouched.
 */
export function formatDeadline(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const name = MONTHS[Number(month) - 1];
  if (!name) return iso;
  return `${Number(day)} ${name} ${year}`;
}

/** Splits the comma-separated `tech` string into trimmed, non-empty tags. */
export function techTags(tech: string): string[] {
  return tech
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/** First tech entry — the one surfaced as the card's prerequisite. */
export function primaryTech(tech: string): string {
  return techTags(tech)[0] ?? tech;
}

/**
 * Which application bucket an opportunity belongs to.
 *
 * The `og_` id prefix is the existing discriminator used by both pages and the
 * only thing the API distinguishes, so it stays the source of truth.
 */
export function applicationKindFor(opportunity: Opportunity): ApplicationKind {
  return opportunity.id.startsWith("og_") ? "og" : "event";
}

/** Case-insensitive match across the fields the search box covers. */
export function matchesQuery(opportunity: Opportunity, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    opportunity.title.toLowerCase().includes(q) ||
    opportunity.organizer.toLowerCase().includes(q) ||
    opportunity.tech.toLowerCase().includes(q)
  );
}

export type OpportunitySort = "featured" | "deadline" | "seats";

export const SORT_LABELS: Record<OpportunitySort, string> = {
  featured: "Featured order",
  deadline: "Deadline — soonest",
  seats: "Seats — fewest left",
};

/**
 * Returns a new sorted array. `featured` preserves catalogue order, which is
 * the default so the page reads identically until a sort is chosen.
 */
export function sortOpportunities(
  items: Opportunity[],
  sort: OpportunitySort,
): Opportunity[] {
  if (sort === "featured") return items;
  const next = [...items];
  if (sort === "deadline") {
    next.sort((a, b) => a.deadline.localeCompare(b.deadline));
  } else {
    next.sort((a, b) => a.seatsLeft - b.seatsLeft);
  }
  return next;
}
