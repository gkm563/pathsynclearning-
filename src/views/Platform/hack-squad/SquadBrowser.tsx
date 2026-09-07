"use client";

import { useMemo, useState } from "react";
import { Lock, SearchX } from "lucide-react";
import {
  Button,
  EmptyState,
  SearchInput,
  Select,
  Toolbar,
} from "@/components/ui";
import { SQUAD_DOMAINS } from "./data";
import { SquadCard } from "./SquadCard";
import type { PublicSquad, SquadDomainFilter } from "./types";

function matches(squad: PublicSquad, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    squad.name.toLowerCase().includes(q) ||
    squad.hackathon.toLowerCase().includes(q) ||
    squad.domain.toLowerCase().includes(q) ||
    squad.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

export function SquadBrowser({
  squads,
  canCreate,
  onCreate,
  onUpgrade,
  onInspect,
  onApply,
}: {
  squads: PublicSquad[];
  canCreate: boolean;
  onCreate: () => void;
  onUpgrade: () => void;
  onInspect: (squad: PublicSquad) => void;
  onApply: (squad: PublicSquad) => void;
}) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<SquadDomainFilter>("all");

  const results = useMemo(
    () =>
      squads.filter(
        (squad) =>
          (domain === "all" || squad.domain === domain) && matches(squad, query),
      ),
    [squads, domain, query],
  );

  const filtered = query.trim().length > 0 || domain !== "all";

  return (
    <div className="min-w-0">
      <Toolbar>
        <SearchInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search by squad, hackathon or stack…"
          aria-label="Search public squads"
          className="w-full sm:w-auto sm:min-w-64 sm:flex-1"
        />
        <Select
          aria-label="Filter by domain"
          value={domain}
          onChange={(event) =>
            setDomain(event.target.value as SquadDomainFilter)
          }
          className="w-full sm:w-auto sm:min-w-52"
        >
          <option value="all">All domains</option>
          {SQUAD_DOMAINS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        {canCreate ? (
          <Button className="min-h-11" onClick={onCreate}>
            Create squad
          </Button>
        ) : (
          <Button
            variant="outline"
            className="min-h-11"
            onClick={onUpgrade}
          >
            <Lock size={14} aria-hidden />
            Create squad
          </Button>
        )}
      </Toolbar>

      <p aria-live="polite" className="type-small mb-4 text-muted">
        {results.length} {results.length === 1 ? "squad" : "squads"}
        {domain !== "all" ? ` in ${domain}` : ""}
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon={<SearchX size={20} aria-hidden />}
          title="No squads match these filters"
          description="Try a broader hackathon name, a different domain, or clear the filters to see the full directory."
          action={
            filtered ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setDomain("all");
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((squad) => (
            <SquadCard
              key={squad.id}
              squad={squad}
              onInspect={onInspect}
              onApply={onApply}
            />
          ))}
        </ul>
      )}

      {canCreate ? null : (
        <div className="mt-6 flex flex-col gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h3 className="type-h4 m-0 text-ink">Launch your own squad</h3>
            <p className="type-small m-0 text-muted">
              Premium unlocks private voice rooms, the sprint board and GitHub
              sync for a squad you own.
            </p>
          </div>
          <Button className="min-h-11 shrink-0" onClick={onUpgrade}>
            View premium
          </Button>
        </div>
      )}
    </div>
  );
}
