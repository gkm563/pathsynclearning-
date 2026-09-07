"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Quote, Sparkles, RefreshCw } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import quotesData from "../../data/quotes_dataset.json";

type QuotePhase = "motivation" | "pushing" | "determination";

type QuoteItem = {
  text: string;
  author: string;
  phase: string;
};

const PHASE_CHROME: Record<
  QuotePhase,
  { wrap: string; ink: string; title: string }
> = {
  motivation: {
    wrap: "border-primary-border bg-primary-soft",
    ink: "text-primary",
    title: "PHASE 1 · DAILY MOTIVATION",
  },
  pushing: {
    wrap: "border-accent bg-accent-soft",
    ink: "text-accent",
    title: "PHASE 2 · DAILY PUSH",
  },
  determination: {
    wrap: "border-success bg-success-soft",
    ink: "text-success",
    title: "PHASE 3 · DETERMINATION & MASTERY",
  },
};

export default function QuoteBanner({
  userLevel = 1,
  userStreak = 7,
}: {
  userLevel?: number;
  userStreak?: number;
}) {
  const [quote, setQuote] = useState<QuoteItem>({
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
    phase: "motivation",
  });
  const [loading, setLoading] = useState(false);

  // Determine user experience phase
  const getPhase = (): QuotePhase => {
    if (userLevel <= 2) return "motivation"; // Beginner
    if (userLevel <= 5) return "pushing"; // Intermediate
    return "determination"; // Advanced
  };

  const currentPhase = getPhase();

  const fetchQuote = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: currentPhase }),
      });
      const data = await response.json();
      if (data.quote?.text && data.quote?.author) {
        setQuote({ text: data.quote.text, author: data.quote.author, phase: currentPhase });
        setLoading(false);
        return;
      }
    } catch {
      // Fallback to local dataset
    }

    // Local Dataset Fallback: 180-day non-repeat algorithm
    const phaseQuotes = quotesData.filter((q) => q.phase === currentPhase);
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const quoteIndex = dayOfYear % phaseQuotes.length;

    setQuote(phaseQuotes[quoteIndex] || phaseQuotes[0]);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuote();
  }, [userLevel]);

  const chrome = PHASE_CHROME[currentPhase];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <Card className={cn("relative overflow-hidden", chrome.wrap)}>
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <div className={cn("flex items-center gap-2", chrome.ink)}>
            <Sparkles size={18} aria-hidden />
            <span className="type-overline">{chrome.title}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchQuote}
            disabled={loading}
            title="Refresh Daily AI Quote"
            className={cn("text-muted", loading && "opacity-50")}
          >
            <RefreshCw
              size={14}
              className={cn(loading && "animate-spin")}
              aria-hidden
            />
            New Quote
          </Button>
        </div>

        <div className="flex items-start gap-4">
          <Quote
            size={36}
            className={cn("mt-1 shrink-0 opacity-60", chrome.ink)}
            aria-hidden
          />
          <div>
            <blockquote className="type-h3 m-0 mb-2.5 text-ink">
              "{quote.text}"
            </blockquote>
            <cite className="type-label not-italic text-muted">
              — {quote.author}
            </cite>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
