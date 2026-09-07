"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Newspaper } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import type { NewsSort } from "@/lib/news/constants";
import type {
  NewsArticleDto,
  NewsListResponse,
  NewsPreferencesDto,
} from "@/lib/news/types";
import {
  Alert,
  Button,
  CardGridSkeleton,
  EmptyState,
  ErrorState,
  LoadMore,
  RefreshOverlay,
  Section,
} from "@/components/ui";
import { FeaturedStories } from "@/components/tech-news/FeaturedStories";
import { NewsCard } from "@/components/tech-news/NewsCard";
import {
  CategoryNav,
  NewsControls,
  TechNewsHeader,
} from "@/components/tech-news/NewsControls";
import { PreferencesPanel } from "@/components/tech-news/PreferencesPanel";

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
  const requestId = useRef(0);

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
      const id = ++requestId.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams(queryString);
        if (cursor) qs.set("cursor", cursor);
        const data = await apiGet<NewsListResponse>(
          `/api/me/tech-news?${qs.toString()}`,
        );
        if (id !== requestId.current) return;
        setStale(Boolean(data.stale));
        setNextCursor(data.nextCursor);
        if (!append) setFeatured(data.featured || []);
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      } catch (e) {
        if (id !== requestId.current) return;
        setError(e instanceof Error ? e.message : "Unable to load tech news.");
        if (!append) {
          setItems([]);
          setFeatured([]);
        }
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
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

  const searchPending = search.trim() !== debouncedSearch;
  const feedRefreshing = (loading && !loadingMore) || searchPending;
  const hasFeed = items.length > 0 || featured.length > 0;
  const busyLabel = searchPending
    ? "Searching…"
    : category !== "all"
      ? `Loading ${category}…`
      : "Updating stories…";

  return (
    <>
      <TechNewsHeader />

      {stale ? (
        <div className="mb-4">
          <Alert tone="warning" title="Showing cached headlines">
            The live feed is temporarily unavailable. Stories below may be a few
            minutes behind.
          </Alert>
        </div>
      ) : null}

      <CategoryNav
        active={category}
        preferred={preferred}
        onChange={setCategory}
      />

      <NewsControls
        search={search}
        sort={sort}
        busy={feedRefreshing}
        onSearchChange={setSearch}
        onSortChange={setSort}
        onOpenPrefs={() => {
          setPrefsDraft(preferred);
          setPrefsOpen(true);
        }}
      />

      {feedRefreshing && !hasFeed ? <CardGridSkeleton count={6} withMedia /> : null}

      {!feedRefreshing && error && items.length === 0 ? (
        <ErrorState
          title="Unable to load tech news"
          description="Please try again in a moment."
          detail={error}
          action={
            <Button variant="secondary" onClick={() => void load(null, false)}>
              Try again
            </Button>
          }
        />
      ) : null}

      {!feedRefreshing && !error && items.length === 0 ? (
        <EmptyState
          icon={<Newspaper size={20} aria-hidden />}
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

      {hasFeed ? (
        <RefreshOverlay busy={feedRefreshing} label={busyLabel}>
          {!debouncedSearch ? <FeaturedStories articles={featured} /> : null}

          <Section title="Latest">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onToggleBookmark={(a) => void toggleBookmark(a)}
                />
              ))}
            </div>
          </Section>

          {nextCursor ? (
            <LoadMore
              hasMore
              loading={loadingMore}
              onClick={() => void load(nextCursor, true)}
            />
          ) : null}
        </RefreshOverlay>
      ) : null}

      <PreferencesPanel
        open={prefsOpen}
        selected={prefsDraft}
        onClose={() => setPrefsOpen(false)}
        onChange={setPrefsDraft}
        onSave={() => void savePrefs()}
        saving={savingPrefs}
      />
    </>
  );
}
