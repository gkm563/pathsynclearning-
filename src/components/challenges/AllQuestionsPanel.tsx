"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChallengeSummary, ChallengeType } from "@/lib/challenges/types";
import { routes } from "@/lib/routes";
import {
  Button,
  Checkbox,
  EmptyState,
  SearchInput,
  Section,
  Select,
  Toolbar,
} from "@/components/ui";
import ChallengeCard from "./ChallengeCard";

const TYPE_SECTIONS: {
  id: ChallengeType | "milestone";
  label: string;
  match: (q: ChallengeSummary) => boolean;
}[] = [
  {
    id: "coding",
    label: "Coding",
    match: (q) => q.type === "coding",
  },
  {
    id: "mcq",
    label: "MCQ",
    match: (q) => q.type === "mcq",
  },
  {
    id: "project",
    label: "Projects",
    match: (q) => q.type === "project" && q.legacyType !== "MILESTONE",
  },
  {
    id: "milestone",
    label: "Milestones",
    match: (q) => q.legacyType === "MILESTONE",
  },
];

export default function AllQuestionsPanel({
  questions,
  careerGoal,
  companies,
  roadmapOnlyDefault,
  onOpen,
  onReview,
  onUnlockHint,
  hintBusy,
}: {
  questions: ChallengeSummary[];
  careerGoal: string | null;
  companies: string[];
  roadmapOnlyDefault?: boolean;
  onOpen: (item: ChallengeSummary) => void;
  onReview: (item: ChallengeSummary) => void;
  onUnlockHint: (item: ChallengeSummary) => void;
  hintBusy?: boolean;
}) {
  const [type, setType] = useState<"all" | ChallengeType | "milestone">("all");
  const [diff, setDiff] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [status, setStatus] = useState<"all" | "todo" | "attempted" | "solved">(
    "all",
  );
  const [company, setCompany] = useState("all");
  const [roadmapOnly, setRoadmapOnly] = useState(Boolean(roadmapOnlyDefault));
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"recommended" | "xp" | "difficulty">(
    "recommended",
  );
  const router = useRouter();

  const filtered = useMemo(() => {
    let list = [...questions];
    if (type === "coding") list = list.filter((x) => x.type === "coding");
    if (type === "mcq") list = list.filter((x) => x.type === "mcq");
    if (type === "project") {
      list = list.filter(
        (x) => x.type === "project" && x.legacyType !== "MILESTONE",
      );
    }
    if (type === "milestone")
      list = list.filter((x) => x.legacyType === "MILESTONE");
    if (diff !== "all") list = list.filter((x) => x.difficulty === diff);
    if (status !== "all") list = list.filter((x) => x.status === status);
    if (company !== "all") {
      list = list.filter((x) => x.companyTags.includes(company));
    }
    if (roadmapOnly) {
      list = list.filter((x) => x.linkedNodeId || x.relevance >= 35);
    }
    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      list = list.filter(
        (x) =>
          x.title.toLowerCase().includes(needle) ||
          x.topics.some((t) => t.includes(needle)) ||
          x.category.toLowerCase().includes(needle) ||
          x.companyTags.some((c) => c.toLowerCase().includes(needle)),
      );
    }
    if (sort === "recommended") list.sort((a, b) => b.relevance - a.relevance);
    if (sort === "xp") list.sort((a, b) => b.xp - a.xp);
    if (sort === "difficulty") {
      const order = { easy: 0, medium: 1, hard: 2 };
      list.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
    }
    return list;
  }, [questions, type, diff, status, company, roadmapOnly, q, sort]);

  const sections = useMemo(() => {
    if (type !== "all") {
      const label =
        TYPE_SECTIONS.find((s) => s.id === type)?.label || "Questions";
      return [{ id: type, label, items: filtered }];
    }
    return TYPE_SECTIONS.map((s) => ({
      id: s.id,
      label: s.label,
      items: filtered.filter(s.match),
    })).filter((s) => s.items.length > 0);
  }, [filtered, type]);

  if (!careerGoal) {
    return (
      <EmptyState
        title="Set your career goal"
        description="All Questions are ranked for your goal. Personalize your roadmap first."
        action={
          <Button onClick={() => router.push(routes.app.roadmapPersonalize)}>
            Personalize roadmap
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Toolbar>
        <SearchInput
          value={q}
          onValueChange={setQ}
          placeholder="Search questions, topics, companies…"
          aria-label="Search questions"
        />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          aria-label="Challenge type"
          className="w-auto min-w-40"
        >
          <option value="all">All types (grouped)</option>
          <option value="coding">Coding only</option>
          <option value="mcq">MCQ only</option>
          <option value="project">Projects only</option>
          <option value="milestone">Milestones only</option>
        </Select>
        <Select
          value={diff}
          onChange={(e) => setDiff(e.target.value as typeof diff)}
          aria-label="Difficulty"
          className="w-auto min-w-36"
        >
          <option value="all">All difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          aria-label="Status"
          className="w-auto min-w-32"
        >
          <option value="all">All status</option>
          <option value="todo">Todo</option>
          <option value="attempted">Attempted</option>
          <option value="solved">Solved</option>
        </Select>
        <Select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          aria-label="Company"
          className="w-auto min-w-36"
        >
          <option value="all">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              Asked at {c}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label="Sort"
          className="w-auto min-w-36"
        >
          <option value="recommended">Recommended</option>
          <option value="xp">XP</option>
          <option value="difficulty">Difficulty</option>
        </Select>
        <Checkbox
          checked={roadmapOnly}
          onChange={setRoadmapOnly}
          label="From my roadmap"
        />
      </Toolbar>

      <p className="type-small m-0 text-muted">
        Showing {filtered.length} of {questions.length} · goal{" "}
        <span className="font-semibold text-ink">{careerGoal}</span>
      </p>

      {sections.map((section) => (
        <Section
          key={section.id}
          title={section.label}
          actions={
            <span className="type-caption type-numeric text-muted">
              {section.items.filter((i) => i.status === "solved").length}/
              {section.items.length} solved
            </span>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {section.items.map((item) => (
              <ChallengeCard
                key={item.id}
                item={item}
                onOpen={() => onOpen(item)}
                onReview={() => onReview(item)}
                onUnlockHint={() => onUnlockHint(item)}
                hintBusy={hintBusy}
              />
            ))}
          </div>
        </Section>
      ))}

      {filtered.length === 0 && (
        <EmptyState
          title="No questions match these filters"
          description="Try a different search or clear some of the filters above."
        />
      )}
    </div>
  );
}
