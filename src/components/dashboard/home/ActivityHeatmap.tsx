"use client";

import { useMemo, useState } from "react";
import type { ConsistencyHeatmap, HeatmapDay } from "@/lib/progress/types";
import { heatLevelClass, homeUi } from "./tokens";
import { SectionLabel } from "./shared";

const HEAT_LEVELS = [0, 1, 2, 3, 4] as const;

type Props = {
  heatmap: ConsistencyHeatmap | null;
  year: number;
  onYearChange: (year: number) => void;
  loading?: boolean;
};

function sessionLabel(count: number) {
  return count === 1 ? "practice session" : "practice sessions";
}

export function ActivityHeatmap({
  heatmap,
  year,
  onYearChange,
  loading = false,
}: Props) {
  const [hover, setHover] = useState<HeatmapDay | null>(null);

  const columns = useMemo(() => {
    if (!heatmap?.days?.length) return [] as HeatmapDay[][];
    const cols: HeatmapDay[][] = [];
    for (let i = 0; i < heatmap.days.length; i += 7) {
      cols.push(heatmap.days.slice(i, i + 7));
    }
    return cols;
  }, [heatmap]);

  const years = heatmap?.availableYears?.length
    ? heatmap.availableYears
    : [year];
  const weekdayLabels = heatmap?.weekdayLabels?.length
    ? heatmap.weekdayLabels
    : Array.from({ length: 7 }, () => "");
  const monthByWeek = useMemo(() => {
    const map = new Map<number, string>();
    for (const m of heatmap?.monthLabels ?? []) {
      map.set(m.weekIndex, m.label);
    }
    return map;
  }, [heatmap?.monthLabels]);

  const total = heatmap?.totalEvents ?? 0;
  const displayYear = heatmap?.year ?? year;

  return (
    <div
      className={`${homeUi.card} overflow-hidden px-[22px] pt-5 pb-4 max-sm:px-3 max-sm:pt-4 max-sm:pb-3 ${loading ? "pointer-events-none opacity-65" : ""}`}
    >
      <div className="grid min-w-0 grid-cols-1 items-start gap-4 min-[901px]:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0 overflow-hidden">
          <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionLabel>Consistency</SectionLabel>
              <h3 className="m-0 flex flex-wrap items-baseline gap-2 font-[Outfit,sans-serif] text-[1.05rem] font-semibold text-[var(--text-main)]">
                <strong className="font-extrabold">{total.toLocaleString()}</strong>{" "}
                {sessionLabel(total)}
                <span className="text-[0.85rem] font-semibold text-[var(--text-muted)]">
                  {heatmap?.rangeLabel ?? displayYear}
                </span>
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--border-light)] bg-[var(--bg-alt)] px-2.5 py-1 font-['Fira_Code',monospace] text-[11px] font-bold text-[var(--text-muted)]">
                {heatmap?.currentStreak ?? 0}d streak
              </span>
              <span className="rounded-full border border-[var(--border-light)] bg-[var(--bg-alt)] px-2.5 py-1 font-['Fira_Code',monospace] text-[11px] font-bold text-[var(--text-muted)]">
                {heatmap?.bestStreak ?? 0}d best
              </span>
              <span className="rounded-full border border-[var(--border-light)] bg-[var(--bg-alt)] px-2.5 py-1 font-['Fira_Code',monospace] text-[11px] font-bold text-[var(--text-muted)]">
                {heatmap?.activeDays ?? 0} active days
              </span>
            </div>
          </div>

          {columns.length === 0 ? (
            <p className={homeUi.emptyInline}>
              Practice sessions will fill this calendar as you complete work.
            </p>
          ) : (
            <div className="relative min-w-0 w-full overflow-hidden" onMouseLeave={() => setHover(null)}>
              <div
                className="mb-1 grid w-full min-w-0 grid-cols-[28px_minmax(0,1fr)] gap-2"
                aria-hidden
              >
                <span />
                <div
                  className="grid w-full min-w-0 gap-[3px]"
                  style={{
                    gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                  }}
                >
                  {columns.map((_, wi) => (
                    <span
                      key={wi}
                      className="min-w-0 overflow-hidden font-[Inter,sans-serif] text-[10px] font-semibold whitespace-nowrap text-[var(--text-muted)]"
                    >
                      {monthByWeek.get(wi) ?? ""}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid w-full min-w-0 grid-cols-[28px_minmax(0,1fr)] items-stretch gap-2">
                <div
                  className="flex flex-col gap-[3px] font-[Inter,sans-serif] text-[9px] font-semibold text-[var(--text-muted)]"
                  aria-hidden
                >
                  {weekdayLabels.map((d, i) => (
                    <span
                      key={i}
                      className="flex h-3.5 shrink-0 basis-3.5 items-center leading-none"
                    >
                      {d}
                    </span>
                  ))}
                </div>

                <div
                  className="grid w-full min-w-0 gap-[3px]"
                  style={{
                    gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
                  }}
                >
                  {columns.map((week, wi) => (
                    <div key={wi} className="flex min-w-0 flex-col gap-[3px]">
                      {week.map((day) => (
                        <button
                          key={day.date}
                          type="button"
                          className={`box-border h-3.5 w-full min-w-0 shrink-0 basis-3.5 cursor-pointer rounded-[5px] border p-0 transition-[box-shadow,border-color] duration-100 ${
                            day.inYear
                              ? `${heatLevelClass(day.level)} border-black/[0.06] hover:z-[1] hover:border-black/45 hover:shadow-[inset_0_0_0_1px_rgba(27,31,35,0.2)] focus-visible:z-[1] focus-visible:border-black/45 focus-visible:shadow-[inset_0_0_0_1px_rgba(27,31,35,0.2)] focus-visible:outline-none [html[data-theme=dark]_&]:border-white/8`
                              : "invisible pointer-events-none border-transparent"
                          }`}
                          disabled={!day.inYear}
                          aria-label={
                            day.inYear
                              ? `${formatFullDay(day.date)}: ${day.count} ${sessionLabel(day.count)}`
                              : undefined
                          }
                          onMouseEnter={() => day.inYear && setHover(day)}
                          onFocus={() => day.inYear && setHover(day)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2">
                <span className="min-w-0 text-[11px] font-medium text-[var(--text-muted)]">
                  Challenges, assessments, and roadmap progress
                </span>
                <div className="flex shrink-0 items-center gap-1 text-[11px] text-[var(--text-muted)]">
                  <span>Quiet</span>
                  {HEAT_LEVELS.map((level) => (
                    <span
                      key={level}
                      className={`h-3.5 w-3.5 shrink-0 rounded-[5px] border border-black/[0.06] [html[data-theme=dark]_&]:border-white/8 ${heatLevelClass(level)}`}
                    />
                  ))}
                  <span>Peak</span>
                </div>
                <div
                  className={`col-span-full min-h-5 text-xs leading-snug max-sm:text-[11px] ${
                    hover
                      ? "font-semibold text-[var(--text-main)]"
                      : "font-medium text-[var(--text-muted)]"
                  }`}
                  aria-live="polite"
                >
                  {hover ? (
                    <>
                      <strong className="font-extrabold text-[#0f766e]">
                        {hover.count}
                      </strong>{" "}
                      {sessionLabel(hover.count)} · {formatFullDay(hover.date)}
                    </>
                  ) : (
                    "Hover a day to see detail"
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className="flex shrink-0 flex-row flex-wrap gap-1 pt-0 min-[901px]:flex-col min-[901px]:pt-7"
          role="tablist"
          aria-label="Year"
        >
          {years.map((y) => (
            <button
              key={y}
              type="button"
              role="tab"
              aria-selected={y === displayYear}
              className={`rounded-lg border-none px-3.5 py-2 text-left font-[Inter,sans-serif] text-[13px] font-semibold transition-colors duration-150 ${
                y === displayYear
                  ? "bg-[#0969da] text-white [html[data-theme=dark]_&]:bg-[#1f6feb]"
                  : "bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text-main)]"
              }`}
              onClick={() => onYearChange(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatFullDay(iso: string) {
  const d = new Date(`${iso}T00:00:00.000Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
