"use client";

import { useId, useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";
import type { ConsistencyHeatmap, HeatmapDay } from "@/lib/progress/types";
import {
  Button,
  EmptyState,
  ErrorState,
  Field,
  RefreshOverlay,
  Select,
} from "@/components/ui";
import { heatLevelClass, homeUi } from "./tokens";

const HEAT_LEVELS = [0, 1, 2, 3, 4] as const;

type Props = {
  heatmap: ConsistencyHeatmap | null;
  year: number;
  onYearChange: (year: number) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

function sessionLabel(count: number) {
  return count === 1 ? "practice session" : "practice sessions";
}

function formatFullDay(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function monthName(monthKey: string) {
  return new Date(`${monthKey}-01T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Twelve-month consistency calendar.
 *
 * The grid keeps a fixed 12px cell and scrolls inside its own container, so a
 * 53-week year stays legible at 360px instead of collapsing into unreadable
 * slivers — and the overflow never escapes to the page.
 */
export function ActivityHeatmap({
  heatmap,
  year,
  onYearChange,
  loading = false,
  error = null,
  onRetry,
}: Props) {
  const [hover, setHover] = useState<HeatmapDay | null>(null);
  const yearFieldId = useId();

  const columns = useMemo(() => {
    if (!heatmap?.days?.length) return [] as HeatmapDay[][];
    const cols: HeatmapDay[][] = [];
    for (let i = 0; i < heatmap.days.length; i += 7) {
      cols.push(heatmap.days.slice(i, i + 7));
    }
    return cols;
  }, [heatmap]);

  const monthByWeek = useMemo(() => {
    const map = new Map<number, string>();
    for (const m of heatmap?.monthLabels ?? []) map.set(m.weekIndex, m.label);
    return map;
  }, [heatmap?.monthLabels]);

  /** Per-month totals, read out to assistive tech in place of the grid. */
  const monthSummaries = useMemo(() => {
    const map = new Map<string, { active: number; events: number }>();
    for (const day of heatmap?.days ?? []) {
      if (!day.inYear) continue;
      const key = day.date.slice(0, 7);
      const entry = map.get(key) ?? { active: 0, events: 0 };
      if (day.count > 0) {
        entry.active += 1;
        entry.events += day.count;
      }
      map.set(key, entry);
    }
    return [...map.entries()];
  }, [heatmap?.days]);

  const years = heatmap?.availableYears?.length
    ? heatmap.availableYears
    : [year];
  const weekdayLabels = heatmap?.weekdayLabels?.length
    ? heatmap.weekdayLabels
    : Array.from({ length: 7 }, () => "");

  const total = heatmap?.totalEvents ?? 0;
  const displayYear = heatmap?.year ?? year;
  const rangeLabel = heatmap?.rangeLabel ?? String(displayYear);

  const gridSummary = `Activity calendar for ${rangeLabel}: ${total} ${sessionLabel(
    total,
  )} across ${heatmap?.activeDays ?? 0} active days. Current streak ${
    heatmap?.currentStreak ?? 0
  } days, best streak ${heatmap?.bestStreak ?? 0} days.`;

  return (
    <div className={homeUi.card}>
      <div className={homeUi.cardHead}>
        <div className="min-w-0">
          <h3 className={homeUi.cardTitle}>
            <span className="type-numeric">{total.toLocaleString()}</span>{" "}
            {sessionLabel(total)}
          </h3>
          <p className={homeUi.cardHint}>
            Challenges, assessments and roadmap progress · {rangeLabel}
          </p>
        </div>

        <div className="w-[7.5rem] shrink-0">
          <Field label="Year" htmlFor={yearFieldId}>
            <Select
              id={yearFieldId}
              value={displayYear}
              disabled={loading}
              onChange={(event) => onYearChange(Number(event.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className={homeUi.chip}>
          {heatmap?.currentStreak ?? 0}-day streak
        </span>
        <span className={homeUi.chip}>{heatmap?.bestStreak ?? 0}-day best</span>
        <span className={homeUi.chip}>
          {heatmap?.activeDays ?? 0} active days
        </span>
      </div>

      {error && !heatmap ? (
        <ErrorState
          compact
          title="Couldn’t load your calendar"
          description="Your consistency history is temporarily unavailable."
          detail={error}
          action={
            onRetry ? (
              <Button variant="secondary" onClick={onRetry}>
                Try again
              </Button>
            ) : undefined
          }
        />
      ) : columns.length === 0 ? (
        <EmptyState
          compact
          icon={<CalendarRange size={17} aria-hidden />}
          title="Nothing logged yet"
          description="Every challenge, assessment and roadmap node you finish fills a day on this calendar."
        />
      ) : (
        <RefreshOverlay busy={loading} label="Loading year…">
          <figure className="m-0 min-w-0">
            <div
              role="img"
              tabIndex={0}
              aria-label={gridSummary}
              className="hide-scrollbar min-w-0 overflow-x-auto rounded-[var(--radius-sm)] pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              onMouseLeave={() => setHover(null)}
            >
              <div className="flex w-max gap-2">
                <div className="flex shrink-0 flex-col gap-[3px] pt-4">
                  {weekdayLabels.map((label, i) => (
                    <span
                      key={i}
                      className="type-caption flex h-3 items-center text-[10px] leading-none text-faint"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <div className="flex gap-[3px]">
                  {columns.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[3px]">
                      <span className="type-caption relative block h-4 w-3 text-[10px] text-faint">
                        {monthByWeek.get(weekIndex) ? (
                          <span className="absolute top-0 left-0 whitespace-nowrap">
                            {monthByWeek.get(weekIndex)}
                          </span>
                        ) : null}
                      </span>

                      {week.map((day) => (
                        <span
                          key={day.date}
                          onMouseEnter={() => day.inYear && setHover(day)}
                          title={
                            day.inYear
                              ? `${formatFullDay(day.date)}: ${day.count} ${sessionLabel(day.count)}`
                              : undefined
                          }
                          className={
                            day.inYear
                              ? `h-3 w-3 shrink-0 rounded-[3px] border border-line ${heatLevelClass(day.level)}`
                              : "h-3 w-3 shrink-0 rounded-[3px] border border-transparent"
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <span
                className="type-small min-w-0 text-muted"
                aria-live="polite"
              >
                {hover
                  ? `${hover.count} ${sessionLabel(hover.count)} · ${formatFullDay(hover.date)}`
                  : "Hover a day for detail"}
              </span>

              <span className="type-caption flex shrink-0 items-center gap-1 text-faint">
                Quiet
                {HEAT_LEVELS.map((level) => (
                  <span
                    key={level}
                    aria-hidden
                    className={`h-3 w-3 rounded-[3px] border border-line ${heatLevelClass(level)}`}
                  />
                ))}
                Peak
              </span>

              <ul className="sr-only">
                {monthSummaries.map(([key, value]) => (
                  <li key={key}>
                    {monthName(key)}: {value.active} active days, {value.events}{" "}
                    {sessionLabel(value.events)}.
                  </li>
                ))}
              </ul>
            </figcaption>
          </figure>
        </RefreshOverlay>
      )}

      {error && heatmap ? (
        <p className="type-caption mt-3 mb-0 text-danger" role="status">
          Showing the last loaded calendar — the refresh didn’t reach the
          server.
        </p>
      ) : null}
    </div>
  );
}
