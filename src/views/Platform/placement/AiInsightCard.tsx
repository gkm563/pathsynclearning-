"use client";

import { useRouter } from "next/navigation";
import {
  ChevronRight,
  Rocket,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import type { AiInsight, InsightKind } from "./insights-data";

const KIND_ICON: Record<InsightKind, LucideIcon> = {
  immediate: Target,
  project: Rocket,
  decay: Zap,
  trend: TrendingUp,
};

const KIND_TONE: Record<
  InsightKind,
  "accent" | "info" | "warning" | "success"
> = {
  immediate: "accent",
  project: "info",
  decay: "warning",
  trend: "success",
};

/** One AI recommendation with its impact and a route into the product. */
export function AiInsightCard({ insight }: { insight: AiInsight }) {
  const router = useRouter();
  const Icon = KIND_ICON[insight.kind];

  return (
    <Card className="flex w-full min-w-0 flex-col gap-3">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
        <span className="type-caption flex min-w-0 items-center gap-2 text-muted">
          <Icon size={15} aria-hidden className="shrink-0 text-primary" />
          <span className="min-w-0 truncate">{insight.category}</span>
        </span>
        <Badge tone={KIND_TONE[insight.kind]}>{insight.impact}</Badge>
      </div>

      <div className="min-w-0">
        <h3 className="type-h4 m-0 text-ink">{insight.title}</h3>
        <p className="type-small mt-1.5 mb-0 text-muted">
          {insight.description}
        </p>
      </div>

      <Button
        variant="secondary"
        className="mt-auto w-full justify-between"
        onClick={() => router.push(insight.href)}
      >
        {insight.actionLabel}
        <ChevronRight size={15} aria-hidden />
      </Button>
    </Card>
  );
}
