"use client";

import React, { useMemo, useState } from "react";
import type { ChallengeSummary, ChallengeType } from "@/lib/challenges/types";
import ChallengeCard from "./ChallengeCard";
import { routes } from "@/lib/routes";

const TYPE_SECTIONS: { id: ChallengeType | "milestone"; label: string; match: (q: ChallengeSummary) => boolean }[] = [
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
  const [sort, setSort] = useState<"recommended" | "xp" | "difficulty">("recommended");

  const filtered = useMemo(() => {
    let list = [...questions];
    if (type === "coding") list = list.filter((x) => x.type === "coding");
    if (type === "mcq") list = list.filter((x) => x.type === "mcq");
    if (type === "project") {
      list = list.filter((x) => x.type === "project" && x.legacyType !== "MILESTONE");
    }
    if (type === "milestone") list = list.filter((x) => x.legacyType === "MILESTONE");
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

  const selectStyle: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid var(--border-light)",
    background: "var(--bg-card)",
    color: "var(--text-main)",
    fontFamily: "Outfit",
    fontSize: 13,
  };

  if (!careerGoal) {
    return (
      <div
        style={{
          padding: 28,
          borderRadius: 18,
          background: "var(--bg-card)",
          border: "1.5px solid var(--border-light)",
          fontFamily: "Outfit",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Set your career goal</h3>
        <p style={{ color: "var(--text-muted)" }}>
          All Questions are ranked for your goal. Personalize your roadmap first.
        </p>
        <a
          href={routes.app.roadmapPersonalize}
          style={{
            display: "inline-block",
            marginTop: 8,
            padding: "10px 16px",
            borderRadius: 12,
            background: "#6c63ff",
            color: "#fff",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Personalize roadmap
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search questions, topics, companies…"
          style={{ ...selectStyle, minWidth: 220, flex: 1 }}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
          style={selectStyle}
        >
          <option value="all">All types (grouped)</option>
          <option value="coding">Coding only</option>
          <option value="mcq">MCQ only</option>
          <option value="project">Projects only</option>
          <option value="milestone">Milestones only</option>
        </select>
        <select value={diff} onChange={(e) => setDiff(e.target.value as typeof diff)} style={selectStyle}>
          <option value="all">All difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} style={selectStyle}>
          <option value="all">All status</option>
          <option value="todo">Todo</option>
          <option value="attempted">Attempted</option>
          <option value="solved">Solved</option>
        </select>
        <select value={company} onChange={(e) => setCompany(e.target.value)} style={selectStyle}>
          <option value="all">All companies</option>
          {companies.map((c) => (
            <option key={c} value={c}>
              Asked at {c}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} style={selectStyle}>
          <option value="recommended">Recommended</option>
          <option value="xp">XP</option>
          <option value="difficulty">Difficulty</option>
        </select>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontFamily: "Outfit",
            color: "var(--text-main)",
          }}
        >
          <input
            type="checkbox"
            checked={roadmapOnly}
            onChange={(e) => setRoadmapOnly(e.target.checked)}
          />
          From my roadmap
        </label>
      </div>

      <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "Outfit" }}>
        Showing {filtered.length} of {questions.length} · goal{" "}
        <b style={{ color: "#6c63ff" }}>{careerGoal}</b>
      </div>

      {sections.map((section) => (
        <div key={section.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontFamily: "Outfit",
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text-main)",
              }}
            >
              {section.label}
            </h3>
            <span style={{ fontFamily: "Fira Code", fontSize: 12, color: "var(--text-muted)" }}>
              {section.items.filter((i) => i.status === "solved").length}/
              {section.items.length} solved
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
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
        </div>
      ))}

      {filtered.length === 0 && (
        <div
          style={{
            padding: 28,
            borderRadius: 16,
            background: "var(--bg-card)",
            border: "1px dashed var(--border-light)",
            color: "var(--text-muted)",
            fontFamily: "Outfit",
          }}
        >
          No questions match these filters.
        </div>
      )}
    </div>
  );
}
