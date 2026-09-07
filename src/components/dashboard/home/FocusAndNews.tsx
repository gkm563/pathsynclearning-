"use client";

import type { ProgressNextAction } from "@/lib/progress/types";
import type { NewsArticleDto } from "@/lib/news/types";
import { NextMoveCard } from "./NextMoveCard";
import { NewsTeaser } from "./NewsTeaser";

type Props = {
  nextAction: ProgressNextAction | null;
  news: NewsArticleDto[];
  newsLoading: boolean;
  newsError?: string | null;
  progressError?: string | null;
  onRetryNews?: () => void;
  onRetryProgress?: () => void;
};

/** @deprecated Prefer composing NextMoveCard + NewsTeaser on the home page. */
export function FocusAndNews({
  nextAction,
  news,
  newsLoading,
  newsError = null,
  progressError = null,
  onRetryNews,
  onRetryProgress,
}: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <NextMoveCard
        action={nextAction}
        loading={false}
        error={progressError}
        onRetry={onRetryProgress ?? (() => undefined)}
      />
      <NewsTeaser
        news={news}
        loading={newsLoading}
        error={newsError}
        onRetry={onRetryNews ?? (() => undefined)}
      />
    </div>
  );
}
