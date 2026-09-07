"use client";

import { Clock, Users } from "lucide-react";
import { Avatar, Badge, Button } from "@/components/ui";
import type { PublicSquad } from "./types";

export function SquadCard({
  squad,
  onInspect,
  onApply,
}: {
  squad: PublicSquad;
  onInspect: (squad: PublicSquad) => void;
  onApply: (squad: PublicSquad) => void;
}) {
  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-xs)]">
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Badge tone="accent">{squad.domain}</Badge>
          <span className="type-caption type-numeric inline-flex shrink-0 items-center gap-1 text-warning">
            <Clock size={12} aria-hidden />
            {squad.timeLeft}
          </span>
        </div>

        <div className="min-w-0">
          <h3 className="type-h4 m-0 text-ink">{squad.name}</h3>
          <p className="type-small m-0 text-muted">{squad.hackathon}</p>
        </div>

        <p className="type-small m-0 text-muted">{squad.description}</p>

        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {squad.tags.map((tag) => (
            <li key={tag}>
              <Badge tone="neutral">{tag}</Badge>
            </li>
          ))}
        </ul>

        <div>
          <p className="type-caption m-0 mb-2 inline-flex items-center gap-1 text-faint">
            <Users size={12} aria-hidden />
            Members ({squad.teamSize}/{squad.maxSize})
          </p>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {squad.members.map((member) => (
              <li
                key={`${member.github}-${member.name}`}
                className="flex min-w-0 items-center gap-2"
              >
                <Avatar name={member.name} size="xs" />
                <span className="type-small min-w-0 truncate text-ink">
                  {member.name}
                </span>
                <span className="type-caption truncate text-faint">
                  {member.role}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {squad.openPositions.length > 0 ? (
          <div>
            <p className="type-caption m-0 mb-1.5 text-faint">Open roles</p>
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {squad.openPositions.map((role) => (
                <li key={role}>
                  <Badge tone="success">{role}</Badge>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-3">
          <Button
            variant="secondary"
            className="min-h-11 flex-1"
            onClick={() => onInspect(squad)}
          >
            Inspect team
          </Button>
          <Button className="min-h-11 flex-1" onClick={() => onApply(squad)}>
            Apply to join
          </Button>
        </div>
      </div>
    </li>
  );
}
