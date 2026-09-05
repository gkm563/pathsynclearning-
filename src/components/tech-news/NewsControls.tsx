"use client";

import { Bookmark, Search, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { NEWS_CATEGORIES, type NewsSort } from "@/lib/news/constants";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/primitives";

export function TechNewsHeader() {
  const router = useRouter();
  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 24,
      }}
    >
      <div>
        <p className="tech-news-kicker">Developer briefing</p>
        <h1 className="tech-news-title">Tech News</h1>
        <p className="tech-news-lead">
          Engineering, AI, and startup stories that matter for your career — without
          the noise.
        </p>
      </div>
      <Button
        variant="secondary"
        className="news-toolbar-btn"
        onClick={() => router.push(routes.app.techNewsSaved)}
        aria-label="Open saved news"
        style={{ minHeight: 40 }}
      >
        <Bookmark size={16} aria-hidden /> Saved
      </Button>
    </header>
  );
}

export function CategoryNav({
  active,
  preferred,
  onChange,
}: {
  active: string | "all";
  preferred: string[];
  onChange: (category: string | "all") => void;
}) {
  const preferredSet = new Set(preferred);
  const ordered = [
    ...NEWS_CATEGORIES.filter((c) => preferredSet.has(c)),
    ...NEWS_CATEGORIES.filter((c) => !preferredSet.has(c)),
  ];

  return (
    <nav aria-label="News categories" style={{ marginBottom: 14 }}>
      <div
        className="hide-scrollbar"
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Chip label="All" active={active === "all"} onClick={() => onChange("all")} />
        {ordered.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            active={active === cat}
            preferred={preferredSet.has(cat)}
            onClick={() => onChange(cat)}
          />
        ))}
      </div>
    </nav>
  );
}

function Chip({
  label,
  active,
  preferred,
  onClick,
}: {
  label: string;
  active: boolean;
  preferred?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`news-chip${active ? " is-active" : ""}${preferred ? " is-preferred" : ""}`}
    >
      {label}
    </button>
  );
}

export function NewsControls({
  search,
  sort,
  busy,
  onSearchChange,
  onSortChange,
  onOpenPrefs,
}: {
  search: string;
  sort: NewsSort;
  busy?: boolean;
  onSearchChange: (v: string) => void;
  onSortChange: (v: NewsSort) => void;
  onOpenPrefs: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
        marginBottom: 22,
      }}
    >
      <label className="news-search">
        {busy ? <span className="news-spin" aria-hidden /> : <Search size={16} color="var(--text-muted)" aria-hidden />}
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search headlines, sources…"
          aria-label="Search news"
          aria-busy={busy || undefined}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--text-main)",
            fontSize: 14,
            minHeight: 42,
          }}
        />
      </label>

      <div className="news-sort" role="group" aria-label="Sort news">
        {(["latest", "popular"] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={sort === s}
            onClick={() => onSortChange(s)}
            className={`news-sort-btn${sort === s ? " is-on" : ""}`}
          >
            {s === "latest" ? "Latest" : "Popular"}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenPrefs}
        className="news-toolbar-btn"
        aria-label="Category preferences"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          minHeight: 44,
          minWidth: 44,
          borderRadius: 12,
          border: "1px solid var(--border-light)",
          background: "var(--bg-card)",
          color: "var(--text-muted)",
          padding: "0 12px",
          fontWeight: 650,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        <Settings2 size={15} aria-hidden /> Preferences
      </button>
    </div>
  );
}
