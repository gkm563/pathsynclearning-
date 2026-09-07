/**
 * Opportunity domain types.
 *
 * Both `/dashboard/events` and `/dashboard/og-opportunities` render the same
 * shape of record and share one application flow, so the type lives here next
 * to the shared components rather than in either view.
 */

/** Which application bucket the server files a record under. */
export type ApplicationKind = "event" | "og";

/** Free-plan students never see `premium`-tier opportunities in a list. */
export type OpportunityTier = "free" | "premium";

export type OpportunityCategory =
  | "hackathons"
  | "internships"
  | "scholarships"
  | "bootcamps"
  | "workshops"
  | "conferences";

export type OpportunityDifficulty =
  | "All Levels"
  | "Beginner"
  | "Intermediate"
  | "Advanced";

export type Opportunity = {
  id: string;
  category: OpportunityCategory;
  title: string;
  organizer: string;
  /** Free text — "Online", "Hybrid (Pune / Online)", "Offline (Venice, Italy)". */
  mode: string;
  /** ISO date (`YYYY-MM-DD`); sorted and formatted for display, never parsed for logic. */
  deadline: string;
  /** Prize money, stipend or non-cash benefit, already formatted for display. */
  prizePool: string;
  difficulty: OpportunityDifficulty;
  eligibility: string;
  /** Comma-separated stack; the first entry is surfaced on the card. */
  tech: string;
  seatsLeft: number;
  /**
   * PathEd-hosted. Drives the application route: OG opportunities are applied
   * to in-product via the applications API, everything else hands off to the
   * partner's own portal in a new tab.
   */
  parthed_og: boolean;
  desc: string;
  externalLink: string;
  coverImage: string;
  tier?: OpportunityTier;
};

/** Category grouping metadata, rendered as section headers and filter tabs. */
export type OpportunityCategoryMeta = {
  id: OpportunityCategory;
  label: string;
  /** Short label for the filter strip, where the full label is too long. */
  shortLabel: string;
  description: string;
};

/** Shape returned by `GET /api/me/applications`. */
export type ApplicationsResponse = {
  applications: Array<{
    event_id: string;
    kind: ApplicationKind;
    created_at: string;
  }>;
  eventIds: string[];
  ogIds: string[];
};

/** Shape returned by `POST /api/me/applications`. */
export type ApplicationCreateResponse = {
  ok: true;
  eventIds: string[];
  ogIds: string[];
};
