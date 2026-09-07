"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  SearchInput,
  Section,
  Select,
} from "@/components/ui";
import { COLLABORATORS_POOL } from "./data";
import type { BrowseProject, FilterType } from "./types";

function ProjectRow({
  title,
  projects,
  onApply,
}: {
  title: string;
  projects: BrowseProject[];
  onApply: (project: BrowseProject) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <Section
      title={title}
      actions={
        <div className="flex gap-1">
          <IconButton
            label={`Scroll ${title} left`}
            variant="secondary"
            onClick={() => scrollRef.current?.scrollBy({ left: -320, behavior: "smooth" })}
          >
            <ChevronLeft size={16} aria-hidden />
          </IconButton>
          <IconButton
            label={`Scroll ${title} right`}
            variant="secondary"
            onClick={() => scrollRef.current?.scrollBy({ left: 320, behavior: "smooth" })}
          >
            <ChevronRight size={16} aria-hidden />
          </IconButton>
        </div>
      }
    >
      {projects.length === 0 ? (
        <EmptyState compact title="No matching projects" description="Try a different search or filter." />
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-1"
        >
          {projects.map((project) => (
            <article
              key={project.id}
              className="flex w-[280px] shrink-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)] sm:w-[310px]"
            >
              <div className="aspect-[16/9] overflow-hidden bg-sunken">
                <img
                  src={project.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h4 className="type-h4 m-0 text-ink">{project.name}</h4>
                  <p className="type-caption m-0 text-muted">Owner: {project.owner}</p>
                </div>
                <p className="type-small m-0 line-clamp-3 text-muted">{project.desc}</p>
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {project.tech.slice(0, 3).map((tech) => (
                    <li key={tech}>
                      <Badge tone="neutral">{tech}</Badge>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
                  <span className="type-caption text-danger">{project.slots}</span>
                  <Badge tone="neutral">{project.difficulty}</Badge>
                </div>
                <Button className="min-h-11 w-full" onClick={() => onApply(project)}>
                  Apply to join
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}

export function Marketplace({
  query,
  filterType,
  projects,
  reversed,
  onQueryChange,
  onFilterChange,
  onApply,
}: {
  query: string;
  filterType: FilterType;
  projects: BrowseProject[];
  reversed: BrowseProject[];
  onQueryChange: (value: string) => void;
  onFilterChange: (value: FilterType) => void;
  onApply: (project: BrowseProject) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={query}
          onValueChange={onQueryChange}
          placeholder="Search project terms, technology frameworks..."
          aria-label="Search marketplace"
          className="flex-1"
        />
        <Select
          value={filterType}
          aria-label="Target filter"
          className="sm:max-w-xs"
          onChange={(event) => onFilterChange(event.target.value as FilterType)}
        >
          <option value="all">Show all opportunities</option>
          <option value="participate">To participate (open teams)</option>
          <option value="recruit">To recruit (hire teammates)</option>
          <option value="collaborators">Look for collaborators</option>
        </Select>
      </Card>

      <ProjectRow
        title="High-impact open source initiatives"
        projects={projects}
        onApply={onApply}
      />
      <ProjectRow
        title="Active student startup hackathons"
        projects={reversed}
        onApply={onApply}
      />

      <Section title="Teammates seeking collaborators">
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {COLLABORATORS_POOL.map((person) => (
            <li key={person.name}>
              <Card className="flex items-center gap-3">
                <Avatar name={person.name} size="lg" />
                <div className="min-w-0">
                  <p className="type-label m-0 text-ink">{person.name}</p>
                  <p className="type-caption m-0 text-muted">
                    {person.role} ({person.college})
                  </p>
                  <Badge tone="neutral" className="mt-2">
                    {person.spec}
                  </Badge>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
