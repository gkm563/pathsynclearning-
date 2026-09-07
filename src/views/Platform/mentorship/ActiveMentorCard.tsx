"use client";

import { useId, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  ChevronDown,
  Lock,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { Badge, Button, Card, IconButton } from "@/components/ui";
import { CASE_STUDY_MENTOR_ID, liveSessionsFor, mentorBio } from "./data";
import type { Mentor } from "./types";

function Highlight({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-[var(--radius-md)] border border-line bg-sunken px-3.5 py-2.5">
      <p className="type-overline m-0 text-faint">{label}</p>
      <p className="type-label mt-1 mb-0 text-ink">{value}</p>
    </div>
  );
}

/**
 * Full-width panel for a mentor the student has added.
 *
 * Two content variants: the case-study mentor shows a placement testimonial,
 * everyone else shows how they teach. Live sessions are a disclosure rather
 * than a second card so the panel stays scannable when several are open.
 */
export function ActiveMentorCard({
  mentor,
  isPremium,
  onBook,
  onRemove,
  onUpgrade,
  onJoinSession,
}: {
  mentor: Mentor;
  isPremium: boolean;
  onBook: (mentor: Mentor) => void;
  onRemove: (mentor: Mentor) => void;
  onUpgrade: () => void;
  onJoinSession: (mentor: Mentor, topic: string) => void;
}) {
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const panelId = useId();
  const isCaseStudy = mentor.id === CASE_STUDY_MENTOR_ID;
  const sessions = liveSessionsFor(mentor);

  return (
    <Card className="min-w-0" padded={false}>
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-md)] bg-sunken">
            <img
              src={mentor.image}
              alt={`Portrait of ${mentor.name}`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="type-h4 mt-3 mb-0 text-ink">{mentor.name}</p>
          <p className="type-small mt-0.5 mb-0 text-muted">
            {mentor.role} · {mentor.company}
          </p>
          <p className="type-caption type-numeric mt-2 mb-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-faint">
            <span className="inline-flex items-center gap-1">
              <Star size={12} aria-hidden className="text-accent" />
              {mentor.rating} ({mentor.reviews} reviews)
            </span>
            <span className="inline-flex items-center gap-1">
              <Users size={12} aria-hidden />
              {mentor.students} coached
            </span>
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="type-overline m-0 text-primary">
                {isCaseStudy ? "Placement case study" : "Your instructor"}
              </p>
              <h3 className="type-h3 mt-1 mb-0 text-ink">
                {mentor.exp} years at {mentor.company}
              </h3>
            </div>
            <IconButton
              label={`Remove ${mentor.name} from your mentors`}
              variant="ghost"
              onClick={() => onRemove(mentor)}
              className="min-h-11 text-muted hover:text-danger"
            >
              <Trash2 size={16} aria-hidden />
            </IconButton>
          </div>

          <blockquote className="type-body-lg m-0 border-l-2 border-primary-border pl-4 text-ink italic">
            {mentor.quote}
          </blockquote>

          <p className="type-body m-0 text-muted">
            {isCaseStudy
              ? "Before PathEd I was lost in a sea of theoretical coursework. Once I started completing the real-world challenges on my personalised roadmap my CRI score climbed, and within three months a recruiter reached out directly — no resume screen, just proof of work."
              : `Instruction is designed to simulate a real engineering team at ${mentor.company}: profiling low-latency services, scaling partition topologies and tracing compiler optimisation flags rather than working through slides.`}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            {isCaseStudy ? (
              <>
                <Highlight label="Before PathEd" value={mentor.beforePath} />
                <Highlight label="After PathEd" value={mentor.afterPath} />
              </>
            ) : (
              <>
                <Highlight
                  label="Target pipeline"
                  value={mentor.role.replace("Senior ", "")}
                />
                <Highlight label="Core specialty" value={mentor.skills[0]} />
              </>
            )}
          </div>

          <div className="rounded-[var(--radius-md)] border border-line bg-sunken p-4">
            <p className="type-overline m-0 text-faint">Bio & teaching vision</p>
            <p className="type-small mt-1.5 mb-0 text-muted">{mentorBio(mentor)}</p>
          </div>

          <ul className="flex list-none flex-wrap gap-1.5 p-0">
            {mentor.skills.map((skill) => (
              <li key={skill}>
                <Badge tone="neutral">{skill}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="type-small m-0 min-w-0 text-muted">
          Available {mentor.availability}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="min-h-11"
            aria-expanded={sessionsOpen}
            aria-controls={panelId}
            onClick={() => setSessionsOpen((open) => !open)}
          >
            <ChevronDown
              size={15}
              aria-hidden
              className={
                sessionsOpen
                  ? "rotate-180 transition-transform duration-[var(--duration-fast)] motion-reduce:transition-none"
                  : "transition-transform duration-[var(--duration-fast)] motion-reduce:transition-none"
              }
            />
            {sessionsOpen ? "Hide live sessions" : "Live sessions"}
          </Button>

          {isPremium ? (
            <Button className="min-h-11" onClick={() => onBook(mentor)}>
              <CalendarClock size={15} aria-hidden />
              Book a 1-on-1
            </Button>
          ) : (
            <Button variant="outline" className="min-h-11" onClick={onUpgrade}>
              <Lock size={15} aria-hidden />
              1-on-1 needs Premium
            </Button>
          )}
        </div>
      </div>

      {sessionsOpen ? (
        <div id={panelId} className="border-t border-line px-5 py-4 sm:px-6">
          <p className="type-overline m-0 text-faint">Scheduled group classes</p>
          <ul className="mt-3 flex list-none flex-col gap-2 p-0">
            {sessions.map((session) => (
              <li key={session.topic}>
                <button
                  type="button"
                  onClick={() => onJoinSession(mentor, session.topic)}
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-surface px-3.5 py-2.5 text-left transition-colors duration-[var(--duration-fast)] hover:border-primary-border hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
                >
                  <span className="min-w-0">
                    <span className="type-label block text-ink">{session.topic}</span>
                    <span className="type-caption block text-muted">
                      {session.date}
                    </span>
                  </span>
                  <span className="type-label inline-flex shrink-0 items-center gap-1 text-primary">
                    Join
                    <ArrowUpRight size={14} aria-hidden />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
