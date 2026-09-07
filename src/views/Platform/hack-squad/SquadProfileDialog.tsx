"use client";

import { Avatar, Badge, Button, Dialog } from "@/components/ui";
import type { PublicSquad } from "./types";

export function SquadProfileDialog({
  squad,
  onClose,
  onApply,
}: {
  squad: PublicSquad | null;
  onClose: () => void;
  onApply: (squad: PublicSquad) => void;
}) {
  return (
    <Dialog
      open={squad !== null}
      onClose={onClose}
      size="md"
      title={squad ? squad.name : "Squad profile"}
      description={squad ? squad.hackathon : undefined}
      footer={
        squad ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                onApply(squad);
                onClose();
              }}
            >
              Request admission
            </Button>
          </>
        ) : undefined
      }
    >
      {squad ? (
        <div className="flex flex-col gap-5">
          <div>
            <Badge tone="accent">{squad.domain}</Badge>
            <p className="type-small mt-3 mb-0 text-muted">{squad.description}</p>
            <p className="type-caption mt-2 mb-0 text-faint">
              {squad.teamSize}/{squad.maxSize} members · {squad.timeLeft}
            </p>
          </div>

          <div>
            <h3 className="type-label m-0 mb-2 text-ink">Roster</h3>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {squad.members.map((member) => (
                <li
                  key={`${member.github}-${member.name}`}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line bg-sunken px-3 py-2.5"
                >
                  <Avatar name={member.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="type-small m-0 font-semibold text-ink">
                      {member.name}
                    </p>
                    <p className="type-caption m-0 text-muted">{member.role}</p>
                  </div>
                  <span className="type-caption font-mono text-faint">
                    {member.github}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {squad.openPositions.length > 0 ? (
            <div>
              <h3 className="type-label m-0 mb-2 text-ink">Open roles</h3>
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {squad.openPositions.map((role) => (
                  <li key={role}>
                    <Badge tone="success">{role}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </Dialog>
  );
}
