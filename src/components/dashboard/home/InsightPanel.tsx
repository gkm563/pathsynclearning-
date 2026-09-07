"use client";

import {
  BookOpen,
  Code2,
  RefreshCw,
  Rocket,
  Shield,
  Target,
  Zap,
} from "lucide-react";
import { Alert, Button, IconButton, InlineLoader } from "@/components/ui";
import { homeUi } from "./tokens";

export type HomeInsight = {
  icon: "target" | "zap" | "rocket" | "book" | "code" | "shield";
  text: string;
};

/** Icon keys returned by `POST /api/ai/insights`, mapped to lucide glyphs. */
const ICONS: Record<HomeInsight["icon"], typeof Target> = {
  target: Target,
  zap: Zap,
  rocket: Rocket,
  book: BookOpen,
  code: Code2,
  shield: Shield,
};

type Props = {
  insights: HomeInsight[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  goalRole: string;
};

/**
 * AI coaching prompts.
 *
 * A failed refresh keeps the current list on screen and reports itself in an
 * inline alert, because the previous advice is still valid — blanking the
 * panel would lose usable content to a transient network error.
 */
export function InsightPanel({
  insights,
  loading,
  error,
  onRefresh,
  goalRole,
}: Props) {
  return (
    <div className={homeUi.card}>
      <div className={homeUi.cardHead}>
        <div className="min-w-0">
          <h3 className={homeUi.cardTitle}>Coach notes</h3>
          <p className={homeUi.cardHint}>
            Written for {goalRole || "your path"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {loading ? <InlineLoader label="Refreshing" /> : null}
          <IconButton
            label="Refresh coach notes"
            variant="secondary"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={15} aria-hidden />
          </IconButton>
        </div>
      </div>

      {error ? (
        <Alert tone="error" title="Couldn’t refresh your notes">
          <p className="m-0">{error}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-2.5"
            onClick={onRefresh}
            disabled={loading}
          >
            Try again
          </Button>
        </Alert>
      ) : null}

      <ul
        className="m-0 mt-3 flex list-none flex-col gap-2 p-0 first:mt-0"
        aria-live="polite"
      >
        {insights.map((item, idx) => {
          const Icon = ICONS[item.icon] ?? Target;
          return (
            <li
              key={`${item.text}-${idx}`}
              className="flex min-w-0 items-start gap-3 rounded-[var(--radius-md)] border border-line bg-sunken px-3.5 py-3"
            >
              <span
                className="mt-px inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary-soft text-primary"
                aria-hidden
              >
                <Icon size={15} />
              </span>
              <p className="type-small m-0 min-w-0 text-ink">{item.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
