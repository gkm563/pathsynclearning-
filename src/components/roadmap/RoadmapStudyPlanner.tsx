"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import { Badge, Button, Card, IconButton, Segmented } from "@/components/ui";

type Task = {
  id: string;
  nodeId: string;
  title: string;
  scheduledDate: string;
  sourceDate: string;
  estimatedMinutes: number;
  status: "planned" | "done" | "backlog";
};

type PlanPayload = {
  today: string;
  total: number;
  done: number;
  percent: number;
  daysLeft: number;
  backlogCount: number;
  todayRemaining: number;
  todayDone: number;
  todayMissed: number;
  todayTasks: Task[];
  backlog: Task[];
  upcoming: Task[];
  tasks: Task[];
};

function monthCells(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const startDow = first.getUTCDay();
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: Array<{ key: string; day: number | null }> = [];
  for (let i = 0; i < startDow; i++) cells.push({ key: `e-${i}`, day: null });
  for (let d = 1; d <= days; d++) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({ key, day: d });
  }
  return cells;
}

export default function RoadmapStudyPlanner({
  onOpenNode,
}: {
  onOpenNode: (nodeId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"today" | "backlog" | "upcoming">("today");
  const [plan, setPlan] = useState<PlanPayload | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await apiGet<PlanPayload>("/api/roadmap/plan");
      setPlan(data);
      setSelectedDay((prev) => prev || data.today);
    } catch {
      setPlan(null);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const byDay = useMemo(() => {
    const map = new Map<string, { planned: number; done: number; backlog: number }>();
    for (const t of plan?.tasks || []) {
      const key = t.status === "backlog" ? t.sourceDate : t.scheduledDate;
      const row = map.get(key) || { planned: 0, done: 0, backlog: 0 };
      if (t.status === "done") row.done += 1;
      else if (t.status === "backlog") row.backlog += 1;
      else row.planned += 1;
      map.set(key, row);
    }
    return map;
  }, [plan]);

  const list =
    tab === "backlog"
      ? plan?.backlog || []
      : tab === "upcoming"
        ? plan?.upcoming || []
        : (plan?.tasks || []).filter(
            (t) =>
              t.scheduledDate === (selectedDay || plan?.today) && t.status !== "backlog",
          );

  const tick = async (task: Task) => {
    setBusyId(task.id);
    try {
      const data = await apiSend<PlanPayload>("/api/roadmap/plan", "PATCH", { taskId: task.id });
      setPlan(data);
    } finally {
      setBusyId(null);
    }
  };

  if (!open) {
    return (
      <div className="absolute bottom-4 left-3 z-20 lg:bottom-6 lg:left-4">
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          <CalendarDays size={16} /> Daily plan
          {plan?.backlogCount ? (
            <Badge tone="warning">{plan.backlogCount}</Badge>
          ) : null}
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute bottom-3 left-3 z-20 w-[min(360px,calc(100%-24px))] lg:bottom-6 lg:left-4">
      <Card className="overflow-hidden border border-line bg-surface/96 shadow-[var(--shadow-lg)] backdrop-blur-md">
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
          <div>
            <p className="type-overline m-0 text-muted">Study plan</p>
            <p className="type-label m-0 text-ink">
              {plan ? `${plan.todayRemaining} left today` : "Loading…"}
            </p>
          </div>
          <IconButton size="sm" label="Hide plan" onClick={() => setOpen(false)}>
            <ChevronLeft size={16} />
          </IconButton>
        </div>

        {plan ? (
          <div className="grid grid-cols-3 gap-1 border-b border-line px-3 py-2 type-caption text-muted">
            <span>{plan.percent}% done</span>
            <span>{plan.daysLeft} days left</span>
            <span>{plan.backlogCount} backlog</span>
          </div>
        ) : null}

        <div className="px-3 pt-2">
          <div className="mb-2 flex items-center justify-between">
            <IconButton
              size="sm"
              label="Previous month"
              onClick={() =>
                setCursor((c) =>
                  c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 },
                )
              }
            >
              <ChevronLeft size={14} />
            </IconButton>
            <span className="type-caption text-ink">
              {new Date(cursor.y, cursor.m, 1).toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </span>
            <IconButton
              size="sm"
              label="Next month"
              onClick={() =>
                setCursor((c) =>
                  c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 },
                )
              }
            >
              <ChevronRight size={14} />
            </IconButton>
          </div>
          <div className="mb-1 grid grid-cols-7 gap-0.5 type-overline text-muted">
            {"SMTWTFS".split("").map((d, i) => (
              <span key={`${d}-${i}`} className="text-center">
                {d}
              </span>
            ))}
          </div>
          <div className="mb-2 grid grid-cols-7 gap-0.5">
            {monthCells(cursor.y, cursor.m).map((cell) => {
              if (cell.day == null) return <span key={cell.key} />;
              const stats = byDay.get(cell.key);
              const selected = (selectedDay || plan?.today) === cell.key;
              const isToday = plan?.today === cell.key;
              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => {
                    setSelectedDay(cell.key);
                    setTab("today");
                  }}
                  className="type-caption rounded-[var(--radius-sm)] py-1 text-center"
                  style={{
                    background: selected
                      ? "var(--primary)"
                      : stats?.backlog
                        ? "var(--warning-soft)"
                        : stats?.done
                          ? "var(--success-soft)"
                          : isToday
                            ? "var(--primary-soft)"
                            : "transparent",
                    color: selected ? "var(--text-on-primary)" : "var(--text-ink)",
                  }}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-3">
          <Segmented
            size="sm"
            fullWidth
            ariaLabel="Plan lists"
            value={tab}
            onChange={(id) => setTab(id as typeof tab)}
            items={[
              { id: "today", label: "Today" },
              {
                id: "backlog",
                label: "Backlog",
                badge: plan?.backlogCount || undefined,
              },
              { id: "upcoming", label: "Upcoming" },
            ]}
          />
        </div>

        <ul className="m-0 max-h-48 list-none overflow-auto px-3 py-2">
          {list.length === 0 ? (
            <li className="type-caption py-3 text-muted">
              {tab === "backlog"
                ? "No missed work waiting."
                : tab === "upcoming"
                  ? "Nothing scheduled after this."
                  : "No tasks on this day."}
            </li>
          ) : (
            list.map((task) => (
              <li key={task.id} className="mb-2 flex items-start gap-2">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={task.status === "done"}
                  disabled={task.status === "done" || busyId === task.id}
                  onChange={() => void tick(task)}
                />
                <button
                  type="button"
                  className="min-w-0 flex-1 border-0 bg-transparent p-0 text-left"
                  onClick={() => onOpenNode(task.nodeId)}
                >
                  <span className="type-body block text-ink">{task.title}</span>
                  <span className="type-caption text-muted">
                    {task.estimatedMinutes} min
                    {task.status === "backlog" ? ` · missed ${task.sourceDate}` : ""}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </Card>
    </div>
  );
}
