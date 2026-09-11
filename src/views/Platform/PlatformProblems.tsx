"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { problemPath, routes } from "@/lib/routes";
import type { ProblemListItem } from "@/lib/problems/public";
import {
  Badge,
  Button,
  ErrorState,
  InlineLoader,
  PageHeader,
  PageSkeleton,
  RefreshOverlay,
  SearchInput,
  Select,
} from "@/components/ui";

type ListResponse = {
  items: ProblemListItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  topics: string[];
  catalogTotal: number;
};

const DIFF_TONE: Record<string, "success" | "warning" | "error"> = {
  easy: "success",
  medium: "warning",
  hard: "error",
};

export default function PlatformProblems() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [topic, setTopic] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setQDebounced(q), 280);
    return () => window.clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setError("");
      const params = new URLSearchParams({
        q: qDebounced,
        difficulty,
        kind,
        status,
        topic,
        page: String(page),
        limit: "20",
      });
      const res = await apiGet<ListResponse>(`/api/me/problems?${params}`);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load problems");
    } finally {
      setLoading(false);
    }
  }, [qDebounced, difficulty, kind, status, topic, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtering = loading || q !== qDebounced;

  if (loading && !data) return <PageSkeleton variant="list" stats={false} />;

  if (error && !data) {
    return (
      <ErrorState
        title="Couldn't load problems"
        description="The problem catalogue didn't come back."
        detail={error}
        action={
          <Button variant="secondary" onClick={() => void load()}>
            Try again
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Problems"
        description={`${data?.catalogTotal ?? 0} interview-style problems. Daily, weekly, and monthly challenges pick from this list.`}
        actions={
          <Button variant="secondary" onClick={() => router.push(routes.app.challenges)}>
            Open challenges
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end">
        <SearchInput
          value={q}
          busy={filtering}
          onValueChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="Search title, topic, slug"
          className="lg:flex-1"
          aria-busy={filtering}
        />
        <Select
          value={difficulty}
          disabled={loading}
          onChange={(e) => {
            setDifficulty(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
        <Select
          value={kind}
          disabled={loading}
          onChange={(e) => {
            setKind(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All kinds</option>
          <option value="coding">Coding</option>
          <option value="mcq">MCQ</option>
          <option value="system_design">System design</option>
          <option value="project">Project</option>
        </Select>
        <Select
          value={status}
          disabled={loading}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All status</option>
          <option value="todo">Todo</option>
          <option value="attempted">Attempted</option>
          <option value="solved">Solved</option>
        </Select>
        <Select
          value={topic}
          disabled={loading}
          onChange={(e) => {
            setTopic(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All topics</option>
          {(data?.topics || []).slice(0, 40).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      <RefreshOverlay busy={filtering} label="Filtering problems…">
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-line bg-sunken text-left">
                <th className="type-caption px-3 py-2 text-muted">#</th>
                <th className="type-caption px-3 py-2 text-muted">Title</th>
                <th className="type-caption px-3 py-2 text-muted">Difficulty</th>
                <th className="type-caption px-3 py-2 text-muted">Kind</th>
                <th className="type-caption px-3 py-2 text-muted">Status</th>
                <th className="type-caption px-3 py-2 text-muted">XP</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center">
                    {filtering ? (
                      <InlineLoader label="Filtering problems…" />
                    ) : (
                      <p className="type-small m-0 text-muted">
                        No problems match these filters.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                (data?.items || []).map((item) => (
                  <tr key={item.slug} className="border-b border-line last:border-0">
                    <td className="type-numeric px-3 py-3 text-muted">{item.number}</td>
                    <td className="px-3 py-3">
                      <Link
                        href={problemPath(item.slug)}
                        className="type-label text-ink hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      <p className="type-caption mt-1 mb-0 text-muted">
                        {item.topics.slice(0, 3).join(" · ")}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={DIFF_TONE[item.difficulty] || "neutral"}>
                        {item.difficulty}
                      </Badge>
                    </td>
                    <td className="type-caption px-3 py-3 text-muted">
                      {item.kind.replace("_", " ")}
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        tone={
                          item.status === "solved"
                            ? "success"
                            : item.status === "attempted"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="type-numeric px-3 py-3 text-muted">{item.xp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </RefreshOverlay>

      <div className="mt-4 flex items-center justify-between">
        <p className="type-caption m-0 inline-flex items-center gap-2 text-muted">
          {filtering ? (
            <InlineLoader label="Updating results…" />
          ) : (
            `${data?.total ?? 0} matching · page ${data?.page ?? 1} / ${data?.pages ?? 1}`
          )}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={filtering || (data?.page || 1) <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={filtering || (data?.page || 1) >= (data?.pages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
