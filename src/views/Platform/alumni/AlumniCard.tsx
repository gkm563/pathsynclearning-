"use client";

import { Briefcase, MessageSquare } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { REFERRAL_LOCK_MS } from "./data";
import type { AlumniProfile } from "./types";

export function isReferralOnCooldown(
  alumnusId: string,
  cooldowns: Record<string, number>,
) {
  const stamped = cooldowns[alumnusId];
  return Boolean(stamped && Date.now() - stamped < REFERRAL_LOCK_MS);
}

export function canRequestReferral(
  alumnus: AlumniProfile,
  cooldowns: Record<string, number>,
) {
  return (
    alumnus.availableFor.includes("Referral") &&
    !isReferralOnCooldown(alumnus.id, cooldowns)
  );
}

export function AlumniCard({
  alumnus,
  connected,
  canRefer,
  onCooldown,
  onConnect,
  onMessage,
  onReferral,
}: {
  alumnus: AlumniProfile;
  connected: boolean;
  canRefer: boolean;
  onCooldown: boolean;
  onConnect: () => void;
  onMessage: () => void;
  onReferral: () => void;
}) {
  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-xs)]">
      <div className="aspect-[4/3] w-full overflow-hidden bg-sunken">
        <img
          src={alumnus.image}
          alt={`Portrait of ${alumnus.name}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="type-h4 m-0 text-ink">{alumnus.name}</h3>
          <p className="type-small m-0 text-muted">
            {alumnus.role} · {alumnus.company}
          </p>
        </div>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {alumnus.skills.slice(0, 3).map((skill) => (
            <li key={skill}>
              <Badge tone="neutral">{skill}</Badge>
            </li>
          ))}
        </ul>
        <p className="type-caption m-0 text-muted">
          {alumnus.college} · {alumnus.branch}
        </p>
        <p className="type-caption m-0 text-faint">Passing year: {alumnus.year}</p>
        <p className="type-small m-0 text-muted">“{alumnus.achievements}”</p>
        <div className="flex flex-wrap gap-1.5">
          {alumnus.availableFor.map((item) => (
            <Badge key={item} tone={item === "Referral" ? "success" : "accent"}>
              {item}
            </Badge>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              className={cn("min-h-11", connected && "text-success")}
              onClick={onConnect}
            >
              {connected ? "Connected" : "Connect"}
            </Button>
            <Button variant="secondary" size="sm" className="min-h-11" onClick={onMessage}>
              <MessageSquare size={14} aria-hidden />
              Message
            </Button>
          </div>
          <Button
            size="sm"
            className="min-h-11 w-full"
            disabled={!canRefer}
            onClick={onReferral}
          >
            <Briefcase size={14} aria-hidden />
            {onCooldown
              ? "Referral dispatched (locked 30d)"
              : "Request placement referral"}
          </Button>
        </div>
      </div>
    </li>
  );
}

export function AlumniProfilePane({
  alumnus,
  connected,
  canRefer,
  onCooldown,
  onConnect,
  onReferral,
}: {
  alumnus: AlumniProfile;
  connected: boolean;
  canRefer: boolean;
  onCooldown: boolean;
  onConnect: () => void;
  onReferral: () => void;
}) {
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden bg-sunken sm:aspect-[5/3]">
        <img
          src={alumnus.image}
          alt={`Portrait of ${alumnus.name}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h3 className="type-h3 m-0 text-ink">{alumnus.name}</h3>
          <p className="type-small m-0 text-muted">
            {alumnus.role} · {alumnus.company}
          </p>
        </div>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {alumnus.skills.map((skill) => (
            <li key={skill}>
              <Badge tone="neutral">{skill}</Badge>
            </li>
          ))}
        </ul>
        <p className="type-small m-0 text-muted">
          {alumnus.college} · {alumnus.branch} ({alumnus.year})
        </p>
        <p className="type-small m-0 text-muted">“{alumnus.achievements}”</p>
        <Button
          variant="secondary"
          className={cn("min-h-11", connected && "text-success")}
          onClick={onConnect}
        >
          {connected ? "Connected" : "Connect"}
        </Button>
        <Button className="min-h-11" disabled={!canRefer} onClick={onReferral}>
          <Briefcase size={14} aria-hidden />
          {onCooldown
            ? "Referral dispatched (locked 30d)"
            : "Request placement referral"}
        </Button>
      </div>
    </Card>
  );
}
