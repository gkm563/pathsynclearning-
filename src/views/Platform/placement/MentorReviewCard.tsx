"use client";

import { ArrowUpRight, FileText, Star } from "lucide-react";
import { Avatar, Button, Card, useToast } from "@/components/ui";
import type { MentorReview } from "./insights-data";

/** A verified mentor's written review of one project or mock round. */
export function MentorReviewCard({ review }: { review: MentorReview }) {
  const toast = useToast();

  return (
    <Card className="flex min-w-0 flex-col gap-4 sm:flex-row sm:gap-5">
      <div className="flex min-w-0 items-center gap-3 sm:w-40 sm:shrink-0 sm:flex-col sm:items-start">
        <Avatar src={review.avatarUrl} name={review.mentorName} size="lg" />
        <div className="min-w-0">
          <p className="type-label m-0 text-ink">{review.mentorName}</p>
          <p className="type-caption mt-0.5 mb-0 text-muted">
            {review.mentorTitle}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <span className="type-caption flex min-w-0 items-center gap-1.5 text-muted">
            <FileText size={14} aria-hidden className="shrink-0" />
            <span className="min-w-0 truncate">{review.projectName}</span>
          </span>
          <span className="type-label type-numeric flex shrink-0 items-center gap-1 text-ink">
            <Star size={14} aria-hidden className="text-warning" />
            {review.score.toFixed(1)}
            <span className="text-faint"> / 5</span>
          </span>
        </div>

        <blockquote className="type-body m-0 text-ink">
          {review.comment}
        </blockquote>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
          <span className="type-caption text-faint">{review.reviewedOn}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              toast.info({
                title: `Session log · ${review.mentorName}`,
                description:
                  "Recorded mentor sessions open here once the review archive ships.",
              })
            }
          >
            View session logs
            <ArrowUpRight size={14} aria-hidden />
          </Button>
        </div>
      </div>
    </Card>
  );
}
