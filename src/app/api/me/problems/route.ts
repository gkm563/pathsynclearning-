import { errorResponse, jsonResponse } from "@/lib/api/http";
import { loadChallengeContext } from "@/lib/challenges/service";
import { attemptMap } from "@/lib/challenges/progress";
import { listCatalog } from "@/lib/challenges/catalog";
import type { AttemptStatus, ChallengeType } from "@/lib/challenges/types";
import type { ProblemListItem } from "@/lib/problems/public";
import { requireDbUser } from "@/lib/db/users";

export async function GET(request: Request) {
  try {
    const user = await requireDbUser();
    const ctx = await loadChallengeContext(user.id);
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim().toLowerCase();
    const difficulty = url.searchParams.get("difficulty") || "all";
    const kind = (url.searchParams.get("kind") || "all") as
      | "all"
      | ChallengeType;
    const status = (url.searchParams.get("status") || "all") as
      | "all"
      | AttemptStatus;
    const topic = (url.searchParams.get("topic") || "").trim().toLowerCase();
    const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
    const limit = Math.min(
      50,
      Math.max(10, Number(url.searchParams.get("limit") || 20) || 20),
    );

    const attempts = attemptMap(ctx.state);
    let list = listCatalog();

    if (kind !== "all") list = list.filter((p) => p.type === kind);
    if (difficulty !== "all") {
      list = list.filter((p) => p.difficulty === difficulty);
    }
    if (topic) {
      list = list.filter((p) =>
        p.topics.some((t) => t.toLowerCase().includes(topic)),
      );
    }
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.includes(q) ||
          p.topics.some((t) => t.toLowerCase().includes(q)),
      );
    }

    const withStatus: ProblemListItem[] = list.map((p) => {
      const attempt = attempts.get(p.id) || attempts.get(p.slug);
      const solved =
        attempt?.status === "solved" ||
        ctx.state.solvedIds.includes(p.id) ||
        ctx.state.solvedIds.includes(p.slug);
      const st: AttemptStatus = solved
        ? "solved"
        : attempt?.status || "todo";
      return {
        slug: p.slug,
        number: p.number,
        title: p.title,
        difficulty: p.difficulty,
        kind: p.type,
        status: st,
        score: attempt?.score,
        topics: p.topics,
        companyTags: p.companyTags,
        xp: p.xp,
        estMinutes: p.estMinutes,
        category: p.category,
      };
    });

    const filtered =
      status === "all"
        ? withStatus
        : withStatus.filter((p) => p.status === status);

    filtered.sort((a, b) => a.number - b.number);
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    const topics = [
      ...new Set(listCatalog().flatMap((p) => p.topics)),
    ].sort();

    return jsonResponse({
      items,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
      topics,
      catalogTotal: listCatalog().length,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
