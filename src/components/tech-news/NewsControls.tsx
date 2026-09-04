"use client";

import { Bookmark, Search, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { NEWS_CATEGORIES, type NewsSort } from "@/lib/news/constants";
import { routes } from "@/lib/routes";
import { Button } from "@/components/ui/primitives";

export function TechNewsHeader({
  savedCountHint,
}: {
  savedCountHint?: boolean;
}) {
  const router = useRouter();
  return (
    <header
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 20,
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: "Outfit, sans-serif",
            fontSize: "clamp(26px, 4vw, 34px)",
            fontWeight: 800,
            color: "var(--text-main)",
            letterSpacing: "-0.02em",
          }}
        >
          Tech News
        </h1>
        <p
          style={{
            margin: "8px 0 0",
            color: "var(--text-muted)",
            fontSize: 15,
            maxWidth: 520,
            lineHeight: 1.5,
          }}
        >
          Stay current on AI, engineering, startups, and the tools that shape your career.
        </p>
      </div>
      <Button
        variant="secondary"
        onClick={() => router.push(routes.app.techNewsSaved)}
        aria-label="Open saved news"
      >
        <Bookmark size={16} /> Saved News
        {savedCountHint ? null : null}
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
    <nav aria-label="News categories" style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Chip
          label="All"
          active={active === "all"}
          onClick={() => onChange("all")}
        />
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
      style={{
        flexShrink: 0,
        border: active
          ? "none"
          : "1.5px solid var(--border-light)",
        background: active
          ? "linear-gradient(135deg, #6c63ff, #00c9a7)"
          : "var(--bg-card)",
        color: active ? "#fff" : "var(--text-main)",
        borderRadius: 999,
        padding: "8px 14px",
        fontWeight: 700,
        fontSize: 13,
        fontFamily: "Outfit, sans-serif",
        cursor: "pointer",
        boxShadow: preferred && !active ? "inset 0 0 0 1px #6c63ff55" : undefined,
      }}
    >
      {label}
    </button>
  );
}

export function NewsControls({
  search,
  sort,
  onSearchChange,
  onSortChange,
  onOpenPrefs,
}: {
  search: string;
  sort: NewsSort;
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
        marginBottom: 18,
      }}
    >
      <label
        style={{
          flex: "1 1 220px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1.5px solid var(--border-light)",
          borderRadius: 12,
          padding: "0 12px",
          background: "var(--bg-card)",
          minHeight: 44,
        }}
      >
        <Search size={16} color="var(--text-muted)" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search headlines, sources…"
          aria-label="Search news"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--text-main)",
            fontSize: 14,
            fontFamily: "Outfit, sans-serif",
            minHeight: 42,
          }}
        />
      </label>

      <div
        role="group"
        aria-label="Sort news"
        style={{
          display: "inline-flex",
          gap: 4,
          padding: 4,
          borderRadius: 12,
          border: "1.5px solid var(--border-light)",
          background: "var(--bg-alt)",
        }}
      >
        {(["latest", "popular"] as const).map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={sort === s}
            onClick={() => onSortChange(s)}
            style={{
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "Outfit, sans-serif",
              cursor: "pointer",
              background: sort === s ? "var(--bg-card)" : "transparent",
              color: sort === s ? "var(--text-main)" : "var(--text-muted)",
            }}
          >
            {s === "latest" ? "Latest" : "Popular"}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenPrefs}
        aria-label="Category preferences"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          minHeight: 44,
          borderRadius: 12,
          border: "1.5px solid var(--border-light)",
          background: "var(--bg-card)",
          color: "var(--text-muted)",
          padding: "0 12px",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        <Settings2 size={15} /> Preferences
      </button>
    </div>
  );
}
