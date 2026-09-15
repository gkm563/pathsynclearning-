"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Lock, RefreshCw, Sparkles } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  CardGridSkeleton,
  EmptyState,
  ErrorState,
  PageHeader,
  Progress,
  Section,
  StatCard,
  StatGridSkeleton,
  useToast,
} from "@/components/ui";
import { routes } from "@/lib/routes";
import { AiInsightCard } from "./placement/AiInsightCard";
import { MentorReviewCard } from "./placement/MentorReviewCard";
import {
  AI_INSIGHTS,
  COMPETENCIES,
  MENTOR_REVIEWS,
  competencyTone,
} from "./placement/insights-data";
import { useStudent } from "@/components/dashboard/StudentContext";
import { formatCri, resolveCriMilli } from "@/lib/cri/milli";
import { useMockResource } from "./shared/useMockResource";

/** CRI needed before national benchmarking is generated. */
const DEEP_DIVE_CRI = 70;

/** AI + mentor guidance — `/dashboard/placement-insights`. */
export default function PlatformPlacementInsights() {
  const router = useRouter();
  const toast = useToast();
  const student = useStudent();
  const criLabel = formatCri(resolveCriMilli(student.criMilli, student.cri));
  const criInt = student.cri;
  const { state, reload } = useMockResource();
  const [analysing, setAnalysing] = useState(false);

  const reanalyse = async () => {
    setAnalysing(true);
    reload();
    await new Promise((resolve) => setTimeout(resolve, 700));
    setAnalysing(false);
    toast.success({
      title: "Profile re-analysed",
      description:
        "Roadmap nodes, project updates and mentor logs are back in sync.",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Placement"
        title="Placement insights"
        description="Actionable engineering guidance, synchronised across your roadmap, projects and mentor evaluations. Last sync 14 minutes ago."
        actions={
          <Button
            variant="secondary"
            onClick={reanalyse}
            loading={analysing || state === "loading"}
          >
            <RefreshCw size={15} aria-hidden />
            Re-analyse profile
          </Button>
        }
      />

      {state === "error" ? (
        <ErrorState
          title="We couldn't refresh your insights"
          description="Diagnostics need a connection to your roadmap and mentor logs. Check your network and try again."
          action={<Button onClick={reload}>Try again</Button>}
        />
      ) : state === "loading" ? (
        <div>
          <StatGridSkeleton count={3} className="mb-6 lg:grid-cols-3" />
          <CardGridSkeleton count={4} />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Readiness score (CRI)"
              value={`${criLabel}%`}
              delta={{ value: 4, label: "this week" }}
              hint="Top 15% nationally"
            />
            <StatCard
              label="Recruiter views"
              value={14}
              delta={{ value: 5, label: "views" }}
              hint="Stripe, Razorpay, Adobe"
            />
            <StatCard
              label="Cohort percentile"
              value="Top 12%"
              hint="Leading on coding consistency"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
            <div className="flex min-w-0 flex-col gap-4">
              <Card className="flex min-w-0 flex-col gap-5">
                <h2 className="type-h4 m-0 text-ink">
                  Engineering competency
                </h2>
                <ul className="m-0 flex list-none flex-col gap-4 p-0">
                  {COMPETENCIES.map((skill) => (
                    <li key={skill.label} className="min-w-0">
                      <Progress
                        value={skill.pct}
                        label={skill.label}
                        showValue
                        tone={competencyTone(skill.pct)}
                      />
                    </li>
                  ))}
                </ul>
                <Alert tone="info" title="Focus your next block">
                  Two 45-minute blocks on system architecture and data caching
                  lift your composite score past the 70% direct-referral
                  threshold.
                </Alert>
              </Card>

              <Card className="flex min-w-0 flex-col gap-3">
                <p className="type-overline m-0 flex items-center gap-2 text-muted">
                  <Lock size={13} aria-hidden />
                  Locked
                </p>
                <div className="min-w-0">
                  <h2 className="type-h4 m-0 text-ink">
                    National benchmarking deep dive
                  </h2>
                  <p className="type-small mt-1.5 mb-0 text-muted">
                    Per-company percentile curves and interview-loop
                    predictions generate at {DEEP_DIVE_CRI}% CRI. You are at{" "}
                    {criInt}% — {Math.max(0, DEEP_DIVE_CRI - criInt)} points away.
                  </p>
                </div>
                <Progress
                  value={criInt}
                  max={DEEP_DIVE_CRI}
                  label={`Progress to ${DEEP_DIVE_CRI}% CRI`}
                  tone="accent"
                  size="sm"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="self-start"
                  onClick={() => router.push(routes.app.challenges)}
                >
                  <Sparkles size={14} aria-hidden />
                  Close the gap
                </Button>
              </Card>
            </div>

            <div className="min-w-0">
              <Section
                title="AI diagnostics"
                description="Generated from your verified nodes, project history and recruiter demand signals."
                className="mt-0"
              >
                {AI_INSIGHTS.length === 0 ? (
                  <EmptyState
                    compact
                    icon={<Lightbulb size={17} aria-hidden />}
                    title="No recommendations yet"
                    description="Verify a few roadmap nodes and PathEd AI will start suggesting your next moves."
                    action={
                      <Button onClick={() => router.push(routes.app.roadmap)}>
                        Open my roadmap
                      </Button>
                    }
                  />
                ) : (
                  <ul className="m-0 grid list-none gap-4 p-0 xl:grid-cols-2">
                    {AI_INSIGHTS.map((insight) => (
                      <li key={insight.id} className="flex min-w-0">
                        <AiInsightCard insight={insight} />
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section
                title="Mentor reviews"
                description="Written evaluations from verified engineers who reviewed your work."
              >
                {MENTOR_REVIEWS.length === 0 ? (
                  <EmptyState
                    compact
                    title="No mentor reviews yet"
                    description="Book a mock round or submit a project for review and feedback lands here."
                    action={
                      <Button
                        onClick={() => router.push(routes.app.mentorship)}
                      >
                        Find a mentor
                      </Button>
                    }
                  />
                ) : (
                  <ul className="m-0 flex list-none flex-col gap-4 p-0">
                    {MENTOR_REVIEWS.map((review) => (
                      <li key={review.id} className="min-w-0">
                        <MentorReviewCard review={review} />
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
            </div>
          </div>
        </>
      )}
    </>
  );
}
