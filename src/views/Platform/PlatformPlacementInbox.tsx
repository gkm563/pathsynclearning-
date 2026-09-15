"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Inbox, RefreshCw, SearchX } from "lucide-react";
import {
  Button,
  Card,
  CardGridSkeleton,
  EmptyState,
  ErrorState,
  ListSkeleton,
  PageHeader,
  SearchInput,
  Segmented,
  StatCard,
  StatGridSkeleton,
  Toolbar,
  useToast,
  type TabItem,
} from "@/components/ui";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { formatCri, resolveCriMilli } from "@/lib/cri/milli";
import { useStudent } from "@/components/dashboard/StudentContext";
import { InboxList } from "./placement/InboxList";
import { MessageDetail } from "./placement/MessageDetail";
import {
  MESSAGE_FILTERS,
  RECRUITER_MESSAGES,
  matchesFilter,
  matchesQuery,
  type MessageFilter,
  type RecruiterMessage,
} from "./placement/inbox-data";
import { useMockResource } from "./shared/useMockResource";

const FILTER_TABS: TabItem<MessageFilter>[] = MESSAGE_FILTERS.map((f) => ({
  id: f.id,
  label: f.label,
}));

/** Recruiter inbox — `/dashboard/placement-inbox`. */
export default function PlatformPlacementInbox() {
  const router = useRouter();
  const toast = useToast();
  const student = useStudent();
  const studentCri = student.cri;
  const criLabel = formatCri(resolveCriMilli(student.criMilli, student.cri));
  const { state, reload } = useMockResource();

  const [archivedIds, setArchivedIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MessageFilter>("all");
  /** Phones show one pane at a time; this is which one. */
  const [detailOnPhone, setDetailOnPhone] = useState(false);

  const inbox = useMemo(
    () => RECRUITER_MESSAGES.filter((m) => !archivedIds.has(m.id)),
    [archivedIds],
  );

  const visible = useMemo(
    () =>
      inbox.filter((m) => matchesFilter(m, filter) && matchesQuery(m, query)),
    [inbox, filter, query],
  );

  const selected = visible.find((m) => m.id === selectedId) ?? null;
  const filtered = query.trim().length > 0 || filter !== "all";

  // Open the first message by default, but only count it as read on desktop,
  // where the detail pane is actually on screen next to the list.
  useEffect(() => {
    if (state !== "ready" || selectedId) return;
    const first = visible[0];
    if (!first) return;
    setSelectedId(first.id);
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setReadIds((prev) => new Set(prev).add(first.id));
    }
  }, [state, selectedId, visible]);

  const openMessage = (id: string) => {
    setSelectedId(id);
    setReadIds((prev) => new Set(prev).add(id));
    setDetailOnPhone(true);
  };

  const archive = (message: RecruiterMessage) => {
    setArchivedIds((prev) => new Set(prev).add(message.id));
    setSelectedId(null);
    setDetailOnPhone(false);
    toast.success({
      title: `Archived ${message.company}`,
      description: "It stays searchable from your placement history.",
      action: {
        label: "Undo",
        onClick: () =>
          setArchivedIds((prev) => {
            const next = new Set(prev);
            next.delete(message.id);
            return next;
          }),
      },
    });
  };

  const clearFilters = () => {
    setQuery("");
    setFilter("all");
  };

  const unreadCount = inbox.filter((m) => !readIds.has(m.id)).length;

  return (
    <>
      <PageHeader
        eyebrow="Placement"
        title="Recruiter inbox"
        description={`Verified recruiters reaching out on the strength of your Career Readiness Index (currently ${criLabel}%). CRI is a readiness index, not a hire recommendation.`}
        actions={
          <Button
            variant="secondary"
            onClick={reload}
            loading={state === "loading"}
          >
            <RefreshCw size={15} aria-hidden />
            Refresh
          </Button>
        }
      />

      {state === "error" ? (
        <ErrorState
          title="We couldn't load your inbox"
          description="Your recruiter messages need a connection to sync. Check your network and try again."
          action={<Button onClick={reload}>Try again</Button>}
        />
      ) : state === "loading" ? (
        <div>
          <StatGridSkeleton count={2} className="mb-6 lg:grid-cols-2" />
          <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
            <ListSkeleton count={4} />
            <CardGridSkeleton count={1} className="lg:grid-cols-1" />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Active leads"
              value={inbox.length}
              hint={`${unreadCount} unread`}
            />
            <StatCard
              label="Recruiter profile views"
              value={14}
              delta={{ value: 5, label: "this week" }}
            />
            <Card className="flex min-w-0 flex-col justify-between gap-3 sm:col-span-2 lg:col-span-1">
              <div className="min-w-0">
                <p className="type-overline m-0 text-primary">
                  PathEd playbook
                </p>
                <p className="type-small mt-1.5 mb-0 text-muted">
                  How recruiters bypass resume filters and reach you through
                  your CRI.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="self-start"
                onClick={() => router.push(routes.marketing.guides)}
              >
                Read the guide
                <ArrowUpRight size={15} aria-hidden />
              </Button>
            </Card>
          </div>

          {inbox.length === 0 ? (
            <EmptyState
              icon={<Inbox size={20} aria-hidden />}
              title="Inbox zero"
              description="You've cleared every recruiter message. New invites arrive as your Career Readiness Index crosses each company's threshold."
              action={
                <Button
                  onClick={() => router.push(routes.app.placementInsights)}
                >
                  See what lifts my CRI
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
              <section
                aria-label="Recruiter messages"
                className={cn(
                  "min-w-0",
                  detailOnPhone && "hidden lg:block",
                )}
              >
                <Toolbar className="mb-3 flex-col items-stretch sm:flex-row sm:items-center">
                  <SearchInput
                    value={query}
                    onValueChange={setQuery}
                    placeholder="Search company or role…"
                    aria-label="Search recruiter messages"
                  />
                  <Segmented<MessageFilter>
                    items={FILTER_TABS}
                    value={filter}
                    onChange={setFilter}
                    ariaLabel="Filter messages"
                    fullWidth
                    className="sm:w-auto"
                  />
                </Toolbar>

                <p aria-live="polite" className="type-caption mb-3 text-muted">
                  {visible.length} of {inbox.length} messages
                </p>

                {visible.length === 0 ? (
                  <EmptyState
                    compact
                    icon={<SearchX size={17} aria-hidden />}
                    title="No messages match"
                    description="Nothing in your inbox matches this search and filter combination."
                    action={
                      <Button variant="secondary" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    }
                  />
                ) : (
                  <InboxList
                    messages={visible}
                    selectedId={selectedId}
                    readIds={readIds}
                    onSelect={openMessage}
                  />
                )}
              </section>

              <section
                aria-label="Message"
                className={cn(
                  "min-w-0",
                  detailOnPhone ? "block" : "hidden lg:block",
                )}
              >
                {selected ? (
                  <MessageDetail
                    message={selected}
                    studentCri={studentCri}
                    onBack={() => setDetailOnPhone(false)}
                    onArchive={archive}
                  />
                ) : (
                  <EmptyState
                    icon={<Inbox size={20} aria-hidden />}
                    title="Pick a message"
                    description={
                      filtered
                        ? "Clear your filters or choose a message from the list to read it here."
                        : "Choose a recruiter message from the list to read the full brief."
                    }
                    action={
                      filtered ? (
                        <Button variant="secondary" onClick={clearFilters}>
                          Clear filters
                        </Button>
                      ) : undefined
                    }
                  />
                )}
              </section>
            </div>
          )}
        </>
      )}
    </>
  );
}
