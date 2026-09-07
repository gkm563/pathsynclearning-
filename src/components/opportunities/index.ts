/**
 * Shared opportunity surface.
 *
 * `/dashboard/events` and `/dashboard/og-opportunities` show the same kind of
 * record and run the same application flow, so the card, the detail sheet, the
 * apply dialog, the filter bar and the applications fetch all live here and
 * are imported by both pages. Import from this barrel, not the files.
 */

export { ApplicationDialog } from "./ApplicationDialog";
export {
  OpportunityActionControl,
  type OpportunityAction,
} from "./OpportunityAction";
export { OpportunityCard, OpportunityGrid } from "./OpportunityCard";
export { OpportunityDetailDialog } from "./OpportunityDetailDialog";
export { OpportunityToolbar } from "./OpportunityToolbar";
export { PlanBanner, PremiumLockedNotice, type PlanId } from "./PlanBanner";
export { useApplications, type ApplicationsState } from "./useApplications";
export {
  applicationKindFor,
  formatDeadline,
  matchesQuery,
  primaryTech,
  SORT_LABELS,
  sortOpportunities,
  techTags,
  type OpportunitySort,
} from "./helpers";
export type {
  ApplicationCreateResponse,
  ApplicationKind,
  ApplicationsResponse,
  Opportunity,
  OpportunityCategory,
  OpportunityCategoryMeta,
  OpportunityDifficulty,
  OpportunityTier,
} from "./types";
