"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiSend } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { ChallengeSummary } from "@/lib/challenges/types";
import {
  Badge,
  Button,
  ErrorState,
  PageHeader,
  PageSkeleton,
  useToast,
} from "@/components/ui";
import ChallengeCodingIde from "@/components/challenges/ChallengeCodingIde";
import ChallengeMcqIde from "@/components/challenges/ChallengeMcqIde";
import ChallengeProjectIde from "@/components/challenges/ChallengeProjectIde";
import ChallengeDesignIde from "@/components/challenges/ChallengeDesignIde";
import ChallengeReviewModal from "@/components/challenges/ChallengeReviewModal";
import { AnimatePresence } from "framer-motion";

export default function PlatformProblemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const toast = useToast();
  const [item, setItem] = useState<ChallengeSummary | null>(null);
  const [windows, setWindows] = useState({
    daily: false,
    weekly: false,
    monthly: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workspace, setWorkspace] = useState(true);
  const [review, setReview] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    try {
      setError("");
      const res = await apiGet<{
        problem: ChallengeSummary;
        windows: { daily: boolean; weekly: boolean; monthly: boolean };
      }>(`/api/me/problems/${encodeURIComponent(slug)}`);
      setItem(res.problem);
      setWindows(res.windows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Problem not found");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitAttempt = async (
    target: ChallengeSummary,
    body: Record<string, unknown>,
  ) => {
    try {
      await apiSend("/api/me/challenges/attempt", "POST", {
        questionId: target.id,
        ...body,
      });
      toast.success("Attempt saved");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save attempt");
    }
  };

  if (loading) return <PageSkeleton />;
  if (error || !item) {
    return (
      <ErrorState
        title="Problem not found"
        description="This slug is missing from the catalogue."
        detail={error || undefined}
        action={
          <Button variant="secondary" onClick={() => router.push(routes.app.problems)}>
            Back to problems
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={`Problem ${item.number}`}
        title={item.title}
        description={item.description}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => router.push(routes.app.problems)}>
              All problems
            </Button>
            <Button onClick={() => setWorkspace(true)}>Solve</Button>
          </div>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge tone={item.difficulty === "easy" ? "success" : item.difficulty === "hard" ? "error" : "warning"}>
          {item.difficulty}
        </Badge>
        <Badge>{item.type.replace("_", " ")}</Badge>
        {windows.daily ? <Badge tone="accent">Daily</Badge> : null}
        {windows.weekly ? <Badge tone="accent">Weekly</Badge> : null}
        {windows.monthly ? <Badge tone="accent">Monthly</Badge> : null}
        <Badge tone={item.status === "solved" ? "success" : "neutral"}>
          {item.status}
        </Badge>
      </div>
      <p className="type-small whitespace-pre-wrap text-ink">{item.prompt}</p>
      {item.examples ? (
        <pre className="type-code mt-4 overflow-auto rounded-[var(--radius-md)] border border-line bg-sunken p-3">
          {item.examples}
        </pre>
      ) : null}
      {item.status !== "todo" ? (
        <Button className="mt-4" variant="secondary" onClick={() => setReview(true)}>
          Review last attempt
        </Button>
      ) : null}

      <AnimatePresence>
        {workspace && item.type === "mcq" ? (
          <ChallengeMcqIde
            item={item}
            onClose={() => setWorkspace(false)}
            onFinished={(p) => void submitAttempt(item, { answers: p.answers })}
          />
        ) : null}
        {workspace && (item.project || item.type === "project") ? (
          <ChallengeProjectIde
            item={item}
            onClose={() => {
              setWorkspace(false);
              void load();
            }}
            onFinished={() => void load()}
          />
        ) : null}
        {workspace && (item.type === "system_design" || item.design) && !item.project ? (
          <ChallengeDesignIde
            item={item}
            onClose={() => setWorkspace(false)}
            onFinished={(p) =>
              void submitAttempt(item, {
                writeup: p.writeup,
                dimensionIds: p.dimensionIds,
              })
            }
          />
        ) : null}
        {workspace &&
        (item.coding || item.type === "coding") &&
        item.type !== "system_design" &&
        !item.project ? (
          <ChallengeCodingIde
            item={item}
            onClose={() => setWorkspace(false)}
            onFinished={(p) =>
              void submitAttempt(item, { code: p.code, language: p.language })
            }
          />
        ) : null}
        {review ? (
          <ChallengeReviewModal
            item={item}
            onClose={() => setReview(false)}
            onRetry={() => {
              setReview(false);
              setWorkspace(true);
            }}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
