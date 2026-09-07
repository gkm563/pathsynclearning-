"use client";

import { CalendarClock, Radio, Users } from "lucide-react";
import { Badge, Card, Section, StatCard } from "@/components/ui";
import {
  INSTRUCTOR_CLASSES,
  INSTRUCTOR_SLOTS,
  PERFORMANCE_STATS,
} from "./data";

/**
 * Read-only mentor-side view: recurring availability, scheduled group classes
 * and teaching performance.
 */
export function InstructorPortal() {
  return (
    <div className="min-w-0">
      <Section
        title="Performance"
        description="Rolling figures across every cohort you teach."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {PERFORMANCE_STATS.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              hint={stat.hint}
            />
          ))}
        </div>
      </Section>

      <div className="mt-8 grid min-w-0 gap-6 sm:mt-10 lg:grid-cols-2">
        <Section
          title="Booking slots"
          description="Weekly recurring 1-on-1 availability."
          as="h3"
          className="mt-0 sm:mt-0"
        >
          <ul className="flex list-none flex-col gap-2 p-0">
            {INSTRUCTOR_SLOTS.map((slot) => (
              <li key={`${slot.day}-${slot.time}`}>
                <Card
                  padded={false}
                  className="flex min-h-11 items-center justify-between gap-3 px-3.5 py-3"
                >
                  <span className="min-w-0">
                    <span className="type-label block text-ink">
                      {slot.day} · {slot.time}
                    </span>
                    <span className="type-caption block text-muted">
                      {slot.remaining > 0
                        ? `${slot.remaining} slots remaining`
                        : "Fully booked"}
                    </span>
                  </span>
                  <Badge tone={slot.status === "Active" ? "success" : "warning"}>
                    {slot.status}
                  </Badge>
                </Card>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Live stream classes"
          description="One-to-many sessions open for registration."
          as="h3"
          className="mt-0 sm:mt-0"
        >
          <ul className="flex list-none flex-col gap-2 p-0">
            {INSTRUCTOR_CLASSES.map((session) => (
              <li key={session.topic}>
                <Card padded={false} className="px-3.5 py-3">
                  <p className="type-label m-0 flex items-start gap-2 text-ink">
                    <Radio size={14} aria-hidden className="mt-0.5 shrink-0 text-accent" />
                    <span className="min-w-0">{session.topic}</span>
                  </p>
                  <p className="type-caption type-numeric mt-1.5 mb-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock size={12} aria-hidden />
                      {session.date}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users size={12} aria-hidden />
                      {session.registered} registered
                    </span>
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
