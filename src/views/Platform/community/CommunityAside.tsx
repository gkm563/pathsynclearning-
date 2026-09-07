"use client";

import { Award, Bell, Calendar } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { CONTRIBUTORS, UPCOMING_EVENTS } from "./data";

const RANK_TONE = [
  "text-warning",
  "text-primary",
  "text-success",
  "text-muted",
] as const;

export function CommunityAside({
  remindedEvents,
  onToggleReminder,
}: {
  remindedEvents: string[];
  onToggleReminder: (eventId: string, eventTitle: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Award size={18} className="text-warning" aria-hidden />
          <h2 className="type-h4 m-0 text-ink">Weekly contributors</h2>
        </div>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {CONTRIBUTORS.map((contributor) => (
            <li
              key={contributor.rank}
              className="flex items-center gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
            >
              <span
                className={cn(
                  "type-caption type-numeric flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sunken font-semibold",
                  RANK_TONE[contributor.rank - 1] ?? "text-muted",
                )}
              >
                {contributor.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="type-small m-0 font-semibold text-ink">
                  {contributor.name}
                </p>
                <p className="type-caption m-0 text-muted">{contributor.title}</p>
              </div>
              <span className="type-caption type-numeric shrink-0 text-faint">
                {contributor.points} pts
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-primary" aria-hidden />
          <h2 className="type-h4 m-0 text-ink">Upcoming live AMAs</h2>
        </div>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {UPCOMING_EVENTS.map((event) => {
            const reminded = remindedEvents.includes(event.id);
            return (
              <li
                key={event.id}
                className="rounded-[var(--radius-md)] border border-line bg-sunken p-3"
              >
                <p className="type-small m-0 font-semibold text-ink">{event.title}</p>
                <p className="type-caption mt-1 mb-3 text-muted">
                  {event.time} · Host: {event.host}
                </p>
                <Button
                  type="button"
                  variant={reminded ? "secondary" : "outline"}
                  size="sm"
                  className="min-h-11 w-full"
                  onClick={() => onToggleReminder(event.id, event.title)}
                >
                  <Bell size={14} aria-hidden />
                  {reminded ? "Reminder set" : "Notify me"}
                </Button>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="bg-primary-soft">
        <Badge tone="accent">Mentor connect</Badge>
        <p className="type-small mt-2 mb-0 text-muted">
          Mentors from Uber, Google, and Stripe answer threads marked with their
          tech-tags daily.
        </p>
      </Card>
    </div>
  );
}
