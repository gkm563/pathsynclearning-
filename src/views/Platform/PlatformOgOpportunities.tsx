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
  TabPanel,
  Tabs,
} from "@/components/ui";
import {
  applicationKindFor,
  ApplicationDialog,
  matchesQuery,
  OpportunityCard,
  OpportunityDetailDialog,
  OpportunityGrid,
  OpportunityToolbar,
  PlanBanner,
  PremiumLockedNotice,
  sortOpportunities,
  useApplications,
  type Opportunity,
  type OpportunityAction,
  type OpportunitySort,
  type PlanId,
} from "@/components/opportunities";
import { usePlan } from "@/hooks/useStudentData";
import { routes } from "@/lib/routes";
import { EVENT_OPPORTUNITIES } from "./events/data";
import { OG_CATEGORIES, OG_OPPORTUNITIES } from "./events/og-data";

type OgTab = "mine" | "search";

export default function PlatformOgOpportunities() {
  const router = useRouter();
  const { plan, setPlan } = usePlan();
  const applications = useApplications();

  const [tab, setTab] = useState<OgTab>("mine");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<OpportunitySort>("featured");
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const [applying, setApplying] = useState<Opportunity | null>(null);

  const { eventIds, ogIds } = applications;
  const premiumUnlocked = plan === "premium";

  const isApplied = useCallback(
    (item: Opportunity) =>
      applicationKindFor(item) === "og"
        ? ogIds.includes(item.id)
        : eventIds.includes(item.id),
    [eventIds, ogIds],
  );

  /**
   * Applied OG tracks, plus the PathEd-hosted opportunities applied to from
   * the events page — both are first-party applications, so both belong in
   * this list.
   */
  const applied = useMemo(
    () => [
      ...OG_OPPORTUNITIES.filter((item) => ogIds.includes(item.id)),
      ...EVENT_OPPORTUNITIES.filter(
        (item) => item.parthed_og && eventIds.includes(item.id),
      ),
    ],
    [eventIds, ogIds],
  );

  /**
   * Premium-tier tracks are withheld from free-plan students entirely, exactly
   * as before — the count is surfaced separately so the shorter list reads as
   * a gate rather than as missing data.
   */
  const discoverable = useMemo(
    () =>
      OG_OPPORTUNITIES.filter((item) => {
        if (item.tier === "premium" && !premiumUnlocked) return false;
        return matchesQuery(item, query);
      }),
    [premiumUnlocked, query],
  );

  const hiddenPremiumCount = premiumUnlocked
    ? 0
    : OG_OPPORTUNITIES.filter((item) => item.tier === "premium").length;

  const goToStore = useCallback(() => router.push(routes.app.store), [router]);

  const actionFor = (item: Opportunity, fromDetail = false): OpportunityAction => {
    if (isApplied(item)) return { kind: "applied" };
    return {
      kind: "apply",
      onApply: () => {
        if (fromDetail) setDetail(null);
        setApplying(item);
      },
    };
  };

  const renderCards = (items: Opportunity[], label: string) => (
    <OpportunityGrid ariaLabel={label}>
      {items.map((item) => (
        <OpportunityCard
          key={item.id}
          opportunity={item}
          action={actionFor(item)}
          onDetails={setDetail}
        />
      ))}
    </OpportunityGrid>
  );

  const appliedByCategory = OG_CATEGORIES.map((meta) => ({
    meta,
    items: applied.filter((item) => item.category === meta.id),
  }));
  const appliedOther = applied.filter(
    (item) => !OG_CATEGORIES.some((meta) => meta.id === item.category),
  );

  const discoverByCategory = OG_CATEGORIES.map((meta) => ({
    meta,
    items: sortOpportunities(
      discoverable.filter((item) => item.category === meta.id),
      sort,
    ),
  }));

  return (
    <>
      <PageHeader
        eyebrow="PathEd OG"
        title="OG Opportunities"
        description="First-party recruitment tracks, closed cohorts and coding challenges validated directly by PathEd — every one applied to in-product."
        actions={
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => router.push(routes.app.events)}
          >
            All events
          </Button>
        }
      />

      <PlanBanner
        plan={plan}
        onPlanChange={(next: PlanId) => setPlan(next)}
        onSeePlans={goToStore}
        lockedSummary={`${hiddenPremiumCount} premium-only tracks are hidden from discovery.`}
      />

      <Tabs<OgTab>
        ariaLabel="OG opportunity sections"
        value={tab}
        onChange={setTab}
        className="mb-5"
        items={[
          { id: "mine", label: "My opportunities", badge: applied.length },
          { id: "search", label: "Search discovery", badge: discoverable.length },
        ]}
      />

      {applications.status === "loading" ? (
        <CardGridSkeleton count={6} withMedia />
      ) : applications.status === "error" ? (
        <ErrorState
          title="We couldn’t load your OG applications"
          description="Your applied tracks are unavailable right now. Retry to load them."
          action={
            <Button className="min-h-11" onClick={applications.reload}>
              Retry
            </Button>
          }
        />
      ) : (
        <RefreshOverlay
          busy={applications.refreshing}
          label="Refreshing applications…"
        >
          <TabPanel active={tab === "mine"}>
            <p className="type-small mb-5 text-muted" aria-live="polite">
              {applied.length} active{" "}
              {applied.length === 1 ? "application" : "applications"} synced for
              recruiter review
            </p>

            {applied.length === 0 ? (
              <EmptyState
                icon={<Compass size={20} />}
                title="No OG applications yet"
                description="Apply to a PathEd-hosted track and it appears here with its deadline, so you can track recruiter-visible submissions in one list."
                action={
                  <Button className="min-h-11" onClick={() => setTab("search")}>
                    Browse OG tracks
                  </Button>
                }
              />
            ) : (
              <>
                {appliedByCategory
                  .filter((group) => group.items.length > 0)
                  .map(({ meta, items }) => (
                    <Section
                      key={meta.id}
                      title={`Applied ${meta.label}`}
                      description="Active applications synced for recruiter review."
                    >
                      {renderCards(items, `Applied ${meta.label}`)}
                    </Section>
                  ))}

                {appliedOther.length > 0 ? (
                  <Section
                    title="Other PathEd-hosted tracks"
                    description="First-party applications from the events catalogue."
                  >
                    {renderCards(appliedOther, "Other PathEd-hosted tracks")}
                  </Section>
                ) : null}
              </>
            )}
          </TabPanel>

          <TabPanel active={tab === "search"}>
            <OpportunityToolbar
              query={query}
              onQueryChange={setQuery}
              placeholder="Search OG tracks by title, organiser or technology"
              sort={sort}
              onSortChange={setSort}
            />

            <p className="type-small mb-5 text-muted" aria-live="polite">
              {discoverable.length}{" "}
              {discoverable.length === 1 ? "track" : "tracks"}{" "}
              {query.trim() ? "match your search" : "open to you"}
            </p>

            <PremiumLockedNotice
              count={hiddenPremiumCount}
              onSeePlans={goToStore}
              className="mb-6"
            />

            {discoverable.length === 0 ? (
              query.trim() ? (
                <EmptyState
                  icon={<SearchX size={20} />}
                  title="No OG tracks match your search"
                  description="Try a shorter term, or search by organiser — PathEd Labs, Vercel, Stripe Eng."
                  action={
                    <Button
                      variant="secondary"
                      className="min-h-11"
                      onClick={() => setQuery("")}
                    >
                      Clear search
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<Compass size={20} />}
                  title="No OG tracks open right now"
                  description="New first-party cohorts and challenges open every month. Check back shortly."
                />
              )
            ) : (
              discoverByCategory
                .filter((group) => group.items.length > 0)
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
                    {renderCards(items, meta.label)}
                  </Section>
                ))
            )}
          </TabPanel>
        </RefreshOverlay>
      )}

      <OpportunityDetailDialog
        opportunity={detail}
        onClose={() => setDetail(null)}
        action={detail ? actionFor(detail, true) : { kind: "applied" }}
        categoryLabel={
          OG_CATEGORIES.find((meta) => meta.id === detail?.category)?.label
        }
      />

      <ApplicationDialog
        opportunity={applying}
        alreadyApplied={applying ? isApplied(applying) : false}
        onClose={() => setApplying(null)}
        onApplied={applications.markApplied}
      />
    </>
  );
}
