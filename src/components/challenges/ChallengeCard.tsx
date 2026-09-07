"use client";

import { useState } from "react";
import {
  Play,
  MapPin,
  Lightbulb,
  FileText,
  Building2,
  ClipboardList,
  RotateCcw,
} from "lucide-react";
import type { ChallengeSummary } from "@/lib/challenges/types";
import { HINT_COST } from "@/lib/challenges/progress";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import ChallengeIcon from "./ChallengeIcon";

const DIFF_TONE = {
  easy: "success",
  medium: "warning",
  hard: "error",
} as const;

const DIFF_LABEL = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
} as const;

export default function ChallengeCard({
  item,
  featured,
  boss,
  onOpen,
  onReview,
  onUnlockHint,
  hintBusy,
}: {
  item: ChallengeSummary;
  featured?: boolean;
  boss?: boolean;
  onOpen: () => void;
  onReview?: () => void;
  onUnlockHint?: () => void;
  hintBusy?: boolean;
}) {
  const [showSolution, setShowSolution] = useState(false);
  const done = item.status === "solved";
  const attempted = item.status === "attempted" || done;
  const visibleHints = item.hints.slice(0, item.hintsUnlocked);
  const canReview = Boolean(onReview) && (attempted || Boolean(item.lastAttempt));
  const canShowSolution =
    done && (Boolean(item.solution) || Boolean(item.questions?.length));

  return (
    <Card
      className={cn(
        "relative flex h-full min-w-0 flex-col gap-3 transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
        "hover:border-primary-border hover:shadow-[var(--shadow-md)]",
        featured && "border-primary-border",
        boss &&
          "border-[color-mix(in_srgb,var(--warning)_42%,var(--border-light))]",
        done &&
          !featured &&
          !boss &&
          "border-[color-mix(in_srgb,var(--success)_36%,var(--border-light))]",
      )}
    >
      {(featured || boss) && (
        <Badge
          tone={boss ? "warning" : "accent"}
          className="absolute top-4 right-4"
        >
          {boss ? "Weekly Boss" : "Challenge of the Day"}
        </Badge>
      )}
      {done && !featured && !boss && (
        <Badge tone="success" className="absolute top-4 right-4">
          Solved
        </Badge>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "grid place-items-center rounded-[var(--radius-md)] bg-primary-soft text-primary",
            featured ? "h-11 w-11" : "h-9 w-9",
          )}
        >
          <ChallengeIcon name={item.icon} size={featured ? 22 : 18} />
        </span>
        <Badge tone={DIFF_TONE[item.difficulty]}>
          {DIFF_LABEL[item.difficulty]}
        </Badge>
        <Badge>{item.type}</Badge>
        <span className="type-caption type-numeric text-muted">+{item.xp} XP</span>
      </div>

      <h3
        className={cn(
          "m-0 text-ink",
          featured ? "type-h3 pr-28" : "type-h4",
          (featured || boss) && "pr-32",
        )}
      >
        {item.title}
      </h3>
      <p className="type-small m-0 text-muted">{item.description}</p>

      {item.companyTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <Building2 size={12} className="text-faint" aria-hidden />
          {item.companyTags.slice(0, 4).map((c) => (
            <Badge key={c} className="normal-case tracking-normal">
              {c}
            </Badge>
          ))}
        </div>
      )}

      {item.linkedNodeTitle && item.linkedNodeId && (
        <a
          href={`/dashboard/roadmap?node=${encodeURIComponent(item.linkedNodeId)}`}
          className="type-small inline-flex items-center gap-1.5 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <MapPin size={13} aria-hidden /> Practice for: {item.linkedNodeTitle}
        </a>
      )}

      {visibleHints.length > 0 && (
        <div className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--warning)_28%,var(--border-light))] bg-[var(--warning-soft)] px-3 py-2.5">
          {visibleHints.map((h, i) => (
            <p
              key={i}
              className={cn(
                "type-small m-0 text-ink",
                i < visibleHints.length - 1 && "mb-1.5",
              )}
            >
              Hint {i + 1}: {h}
            </p>
          ))}
        </div>
      )}

      <div className="mt-1 flex flex-wrap gap-2">
        <Button onClick={onOpen}>
          {done ? <RotateCcw size={14} aria-hidden /> : <Play size={14} aria-hidden />}
          {done
            ? "Retry"
            : item.type === "mcq"
              ? "Start MCQ"
              : item.type === "coding"
                ? "Solve in IDE"
                : "Open"}
        </Button>
        {canReview && (
          <Button variant="secondary" onClick={onReview}>
            <ClipboardList size={14} aria-hidden /> Review
            {typeof item.score === "number" ? ` ${item.score}%` : ""}
          </Button>
        )}
        {!done && onUnlockHint && item.hintsUnlocked < item.hints.length && (
          <Button
            variant="secondary"
            disabled={hintBusy}
            onClick={onUnlockHint}
          >
            <Lightbulb size={14} aria-hidden /> Hint ({HINT_COST}c)
          </Button>
        )}
        {canShowSolution && (
          <Button
            variant={showSolution ? "outline" : "ghost"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSolution((v) => !v);
            }}
          >
            <FileText size={14} aria-hidden />{" "}
            {showSolution ? "Hide solution" : "Solution"}
          </Button>
        )}
      </div>

      {showSolution && canShowSolution && (
        <div className="rounded-[var(--radius-md)] border border-line bg-sunken p-3.5">
          <p className="type-label m-0 mb-2 text-ink">
            {item.type === "mcq" ? "Answer key" : "Solution"}
          </p>

          {item.solution?.editorial && (
            <p className="type-small mt-0 mb-2.5 text-ink">
              {item.solution.editorial}
            </p>
          )}

          {item.type === "mcq" && item.questions && item.questions.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {item.questions.map((q, i) => {
                const letter = String.fromCharCode(65 + q.correct);
                const answer = q.opts[q.correct] ?? "—";
                return (
                  <div
                    key={String(q.id)}
                    className="rounded-[var(--radius-md)] border border-line bg-surface p-3"
                  >
                    <p className="type-small m-0 mb-1.5 font-semibold text-ink">
                      {i + 1}. {q.q}
                    </p>
                    <p className="type-small m-0 font-semibold text-success">
                      Correct: {letter}. {answer}
                    </p>
                    {q.explanation && (
                      <p className="type-caption mt-1.5 mb-0 text-muted">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              {item.solution?.complexity &&
                item.solution.complexity.toLowerCase() !== "n/a" && (
                  <p className="type-caption type-numeric m-0 text-primary">
                    {item.solution.complexity}
                  </p>
                )}
              {item.solution?.notes && (
                <p className="type-caption mt-2 mb-0 text-muted">
                  {item.solution.notes}
                </p>
              )}
              {!item.solution?.editorial && (
                <p className="type-small m-0 text-muted">
                  No written solution for this challenge yet.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
