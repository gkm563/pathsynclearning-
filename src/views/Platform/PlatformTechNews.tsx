"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiSend } from "@/lib/api";
import type { NewsSort } from "@/lib/news/constants";
import type {
  NewsArticleDto,
  NewsListResponse,
  NewsPreferencesDto,
} from "@/lib/news/types";
import { Button, EmptyState } from "@/components/ui/primitives";
import { FeaturedStories } from "@/components/tech-news/FeaturedStories";
import { NewsCard } from "@/components/tech-news/NewsCard";
import {
  CategoryNav,
  NewsControls,
  TechNewsHeader,
} from "@/components/tech-news/NewsControls";
import { PreferencesPanel } from "@/components/tech-news/PreferencesPanel";
import { NewsSection, NewsSkeletonGrid } from "@/components/tech-news/shared";

export default function PlatformTechNews() {
  const [category, setCategory] = useState<string | "all">("all");
  const [sort, setSort] = useState<NewsSort>("latest");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [items, setItems] = useState<NewsArticleDto[]>([]);
  const [featured, setFeatured] = useState<NewsArticleDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [preferred, setPreferred] = useState<string[]>([]);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefsDraft, setPrefsDraft] = useState<string[]>([]);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiGet<{ preferences: NewsPreferencesDto }>(
          "/api/me/tech-news/preferences",
        );
        setPreferred(res.preferences?.categories || []);
      } catch {
        /* defaults */
      }
    })();
  }, []);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    p.set("sort", sort);
    p.set("limit", "18");
    if (category !== "all") p.set("category", category);
    if (debouncedSearch) p.set("search", debouncedSearch);
    return p.toString();
  }, [category, sort, debouncedSearch]);

  const load = useCallback(
    async (cursor?: string | null, append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams(queryString);
        if (cursor) qs.set("cursor", cursor);
        const data = await apiGet<NewsListResponse>(
          `/api/me/tech-news?${qs.toString()}`,
        );
        setStale(Boolean(data.stale));
        setNextCursor(data.nextCursor);
        if (!append) setFeatured(data.featured || []);
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load tech news.");
        if (!append) {
          setItems([]);
          setFeatured([]);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [queryString],
  );

  useEffect(() => {
    void load(null, false);
  }, [load]);

  const toggleBookmark = async (article: NewsArticleDto) => {
    const next = !article.bookmarked;
    const patch = (list: NewsArticleDto[]) =>
      list.map((a) => (a.id === article.id ? { ...a, bookmarked: next } : a));
    setItems(patch);
    setFeatured(patch);
    try {
      await apiSend("/api/me/tech-news/bookmark", "POST", {
        articleId: article.id,
        bookmarked: next,
      });
    } catch {
      const revert = (list: NewsArticleDto[]) =>
        list.map((a) =>
          a.id === article.id ? { ...a, bookmarked: article.bookmarked } : a,
        );
      setItems(revert);
      setFeatured(revert);
    }
  };

  const savePrefs = async () => {
    setSavingPrefs(true);
    try {
      const res = await apiSend<{ preferences: NewsPreferencesDto }>(
        "/api/me/tech-news/preferences",
        "PUT",
        { categories: prefsDraft },
      );
      setPreferred(res.preferences.categories);
      setPrefsOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save preferences");
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div style={{ padding: "8px 4px 40px", maxWidth: 1100, margin: "0 auto" }}>
      <TechNewsHeader />

      {stale ? (
        <p
          role="status"
          style={{
            margin: "0 0 12px",
            fontSize: 13,
            color: "#f59e0b",
            fontWeight: 600,
          }}
        >
          Showing cached headlines — live feed temporarily unavailable.
        </p>
      ) : null}

      <CategoryNav
        active={category}
        preferred={preferred}
        onChange={setCategory}
      />

      <NewsControls
        search={search}
        sort={sort}
        onSearchChange={setSearch}
        onSortChange={setSort}
        onOpenPrefs={() => {
          setPrefsDraft(preferred);
          setPrefsOpen(true);
        }}
      />

      {loading && items.length === 0 ? <NewsSkeletonGrid /> : null}

      {!loading && error && items.length === 0 ? (
        <EmptyState
          title="Unable to load tech news"
          description="Please try again in a moment."
          action={<Button onClick={() => void load(null, false)}>Try Again</Button>}
        />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No articles found"
          description={
            debouncedSearch
              ? "Try a different search or clear filters."
              : "Fresh headlines will appear here soon."
          }
          action={
            debouncedSearch || category !== "all" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {items.length > 0 || featured.length > 0 ? (
        <>
          {!debouncedSearch ? <FeaturedStories articles={featured} /> : null}

          <NewsSection title="Latest news">
            <div
              className="news-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 16,
              }}
            >
              {items.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onToggleBookmark={(a) => void toggleBookmark(a)}
                />
              ))}
            </div>
            <style>{`
              @media (max-width: 960px) {
                .news-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
              }
              @media (max-width: 640px) {
                .news-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </NewsSection>

          {nextCursor ? (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <Button
                variant="secondary"
                disabled={loadingMore}
                onClick={() => void load(nextCursor, true)}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      <PreferencesPanel
        open={prefsOpen}
        selected={prefsDraft}
        onClose={() => setPrefsOpen(false)}
        onChange={setPrefsDraft}
        onSave={() => void savePrefs()}
        saving={savingPrefs}
      />
    </div>
  );
}
