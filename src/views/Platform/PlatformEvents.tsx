"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, SearchX } from "lucide-react";
import {
  Button,
  CardGridSkeleton,
  EmptyState,
  ErrorState,
  PageHeader,
  RefreshOverlay,
  Section,
  Segmented,
  Tabs,
  useToast,
} from "@/components/ui";
import {
  ApplicationDialog,
  matchesQuery,
  OpportunityCard,
  OpportunityDetailDialog,
  OpportunityGrid,
  OpportunityToolbar,
  PlanBanner,
  sortOpportunities,
  useApplications,
  type Opportunity,
  type OpportunityAction,
  type OpportunityCategory,
  type OpportunitySort,
  type PlanId,
} from "@/components/opportunities";
import { usePlan } from "@/hooks/useStudentData";
import { routes } from "@/lib/routes";
import { EVENT_CATEGORIES, EVENT_OPPORTUNITIES } from "./events/data";

type Mode = "discover" | "applied";
type CategoryFilter = OpportunityCategory | "all";

export default function PlatformEvents() {
  const router = useRouter();
  const toast = useToast();
  const { plan, setPlan } = usePlan();
  const applications = useApplications();

  const [mode, setMode] = useState<Mode>("discover");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<OpportunitySort>("featured");
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const [applying, setApplying] = useState<Opportunity | null>(null);

  const appliedIds = applications.eventIds;
  const premiumUnlocked = plan === "premium";

  /**
   * Premium gate, unchanged: advanced tracks need a premium plan. Advanced
   * opportunities stay visible so the gate is legible — they're just not
   * applicable.
   */
  const isLocked = useCallback(
    (item: Opportunity) => !premiumUnlocked && item.difficulty === "Advanced",
    [premiumUnlocked],
  );

  // Search matches title / organiser / stack; the applied filter narrows to
  // opportunities already recorded against this student.
  const visible = useMemo(
    () =>
      EVENT_OPPORTUNITIES.filter((item) => {
        if (mode === "applied" && !appliedIds.includes(item.id)) return false;
        return matchesQuery(item, query);
      }),
    [mode, query, appliedIds],
  );

  const sections = useMemo(
    () =>
      EVENT_CATEGORIES.filter(
        (meta) => category === "all" || meta.id === category,
      ).map((meta) => ({
        meta,
        items: sortOpportunities(
          visible.filter((item) => item.category === meta.id),
          sort,
        ),
      })),
    [visible, category, sort],
  );

  const shown = sections.reduce((total, section) => total + section.items.length, 0);
  const lockedCount = EVENT_OPPORTUNITIES.filter(isLocked).length;
  const filtersActive = query.trim().length > 0 || category !== "all";

  const goToStore = useCallback(() => router.push(routes.app.store), [router]);

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
  };

  const actionFor = (item: Opportunity, fromDetail = false): OpportunityAction => {
    const close = () => {
      if (fromDetail) setDetail(null);
    };

    if (appliedIds.includes(item.id)) return { kind: "applied" };

    if (isLocked(item)) {
      return {
        kind: "locked",
        onUnlock: () => {
          close();
          toast.info({
            title: "Premium track",
            description: `“${item.title}” unlocks with PathEd Premium.`,
          });
          goToStore();
        },
      };
    }

    // PathEd-hosted tracks are applied to in-product; partner tracks hand off
    // to the organiser's own portal and are only recorded locally.
    if (item.parthed_og) {
      return {
        kind: "apply",
        onApply: () => {
          close();
          setApplying(item);
        },
      };
    }

    return {
      kind: "external",
      onOpen: () => {
        close();
        applications.markApplied(item.id, "event");
        toast.info({
          title: "Opening the organiser’s portal",
          description: `Finish your application for “${item.title}” on ${item.organizer}’s site.`,
        });
      },
    };
  };

  const categoryTabs = [
    { id: "all" as CategoryFilter, label: "All", badge: visible.length },
    ...EVENT_CATEGORIES.map((meta) => ({
      id: meta.id as CategoryFilter,
      label: meta.shortLabel,
      badge: visible.filter((item) => item.category === meta.id).length,
    })),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Opportunities"
        title="Events & Summits"
        description="Every hackathon, workshop, internship and institutional summit in one place — apply to PathEd-hosted tracks without leaving the dashboard."
        actions={
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => router.push(routes.app.ogOpportunities)}
          >
            PathEd OG tracks
          </Button>
        }
      />

      <PlanBanner
        plan={plan}
        onPlanChange={(next: PlanId) => setPlan(next)}
        onSeePlans={goToStore}
        lockedSummary={`${lockedCount} advanced tracks are preview-only until you upgrade.`}
      />

      <OpportunityToolbar
        query={query}
        onQueryChange={setQuery}
        placeholder="Search by title, organiser or technology"
        sort={sort}
        onSortChange={setSort}
      >
        <Segmented<Mode>
          ariaLabel="Opportunity view"
          value={mode}
          onChange={setMode}
          className="[&_button]:min-h-11"
          items={[
            { id: "discover", label: "Discover" },
            { id: "applied", label: `Applied (${appliedIds.length})` },
          ]}
        />
      </OpportunityToolbar>

      <Tabs<CategoryFilter>
        ariaLabel="Opportunity categories"
        items={categoryTabs}
        value={category}
        onChange={setCategory}
        className="mb-4"
      />

      <p className="type-small mb-6 text-muted" aria-live="polite">
        {shown} {shown === 1 ? "opportunity" : "opportunities"}{" "}
        {filtersActive || mode === "applied" ? "match your filters" : "available"}
      </p>

      {applications.status === "loading" ? (
        <CardGridSkeleton count={6} withMedia />
      ) : applications.status === "error" ? (
        <ErrorState
          title="We couldn’t load your applications"
          description="The catalogue is fine, but we can’t tell which opportunities you’ve already applied to. Retry to load them."
          action={
            <Button className="min-h-11" onClick={applications.reload}>
              Retry
            </Button>
          }
        />
      ) : shown === 0 ? (
        <EmptyResult
          mode={mode}
          filtersActive={filtersActive}
          onClearFilters={clearFilters}
          onDiscover={() => setMode("discover")}
        />
      ) : (
        <RefreshOverlay
          busy={applications.refreshing}
          label="Refreshing applications…"
        >
          {sections
            .filter((section) => section.items.length > 0)
            .map(({ meta, items }) => (
              <Section
                key={meta.id}
                title={meta.label}
                description={meta.description}
                actions={
                  <span className="type-caption type-numeric text-muted">
                    {items.length} open
                  </span>
                }
              >
                <OpportunityGrid ariaLabel={meta.label}>
                  {items.map((item) => (
                    <OpportunityCard
                      key={item.id}
                      opportunity={item}
                      locked={isLocked(item) && !appliedIds.includes(item.id)}
                      action={actionFor(item)}
                      onDetails={setDetail}
                    />
                  ))}
                </OpportunityGrid>
              </Section>
            ))}
        </RefreshOverlay>
      )}

      <OpportunityDetailDialog
        opportunity={detail}
        onClose={() => setDetail(null)}
        action={
          detail ? actionFor(detail, true) : { kind: "applied" }
        }
        locked={
          detail ? isLocked(detail) && !appliedIds.includes(detail.id) : false
        }
        categoryLabel={
          EVENT_CATEGORIES.find((meta) => meta.id === detail?.category)?.label
        }
      />

      <ApplicationDialog
        opportunity={applying}
        alreadyApplied={applying ? appliedIds.includes(applying.id) : false}
        onClose={() => setApplying(null)}
        onApplied={applications.markApplied}
      />
    </>
  );
}

/**
 * "Nothing here" has two very different causes on this page, and conflating
 * them is what makes an empty state feel broken.
 */
function EmptyResult({
  mode,
  filtersActive,
  onClearFilters,
  onDiscover,
}: {
  mode: Mode;
  filtersActive: boolean;
  onClearFilters: () => void;
  onDiscover: () => void;
}) {
  if (filtersActive) {
    return (
      <EmptyState
        icon={<SearchX size={20} />}
        title="No opportunities match your filters"
        description="Try a broader search term, or clear the category filter to see the full catalogue."
        action={
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        }
      />
    );
  }

  if (mode === "applied") {
    return (
      <EmptyState
        icon={<Compass size={20} />}
        title="You haven’t applied to anything yet"
        description="Applications you submit — and partner tracks you open — show up here so you can track every deadline in one list."
        action={
          <Button className="min-h-11" onClick={onDiscover}>
            Browse opportunities
          </Button>
        }
      />
    );
  }

  return (
    <EmptyState
      icon={<Compass size={20} />}
      title="No opportunities published yet"
      description="New hackathons, cohorts and summits are added every week. Check back shortly."
    />
  );
}
