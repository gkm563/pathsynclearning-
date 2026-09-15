import "server-only";
import { getChallengeById, listCatalog } from "@/lib/challenges/catalog";
import { getMemorySettings } from "@/lib/memory/settings";
import { searchNotes } from "@/lib/memory/notes";
import { getArticle, listNews } from "@/lib/news/service";
import { techNewsArticlePath } from "@/lib/routes";
import { getProgressPayload } from "@/lib/progress";
import { getActiveRoadmap } from "@/lib/roadmap/active";
import { getDb } from "@/lib/db/client";
import { and, eq } from "drizzle-orm";
import { roadmapProgress } from "@/lib/db/schema";
import type { RoadmapNode } from "@/types/roadmap";
import type { ProgressRange } from "@/lib/progress/types";

export const COPILOT_READ_TOOLS = [
  "get_progress",
  "get_roadmap",
  "search_problems",
  "search_notes",
  "list_news",
  "get_article",
] as const;

export type CopilotReadTool = (typeof COPILOT_READ_TOOLS)[number];

export function isReadTool(name: string): name is CopilotReadTool {
  return (COPILOT_READ_TOOLS as readonly string[]).includes(name);
}

function asNodes(raw: unknown): RoadmapNode[] {
  return Array.isArray(raw) ? (raw as RoadmapNode[]) : [];
}

function compactProblems(query: string, limit = 8) {
  const q = query.trim().toLowerCase();
  const catalog = listCatalog();
  const matched = q
    ? catalog.filter((item) => {
        const hay = [
          item.title,
          item.slug,
          item.category,
          item.type,
          ...item.topics,
          ...item.careerTags,
          ...item.companyTags,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
    : catalog.slice(0, limit);
  return matched.slice(0, limit).map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    type: item.type,
    difficulty: item.difficulty,
    topics: item.topics.slice(0, 6),
    xp: item.xp,
    estMinutes: item.estMinutes,
    category: item.category,
  }));
}

export async function executeCopilotReadTool(
  userId: string,
  name: CopilotReadTool,
  args: Record<string, unknown>,
): Promise<unknown> {
  if (name === "get_progress") {
    const range: ProgressRange =
      args.range === "week" || args.range === "month" || args.range === "all"
        ? args.range
        : "month";
    const payload = await getProgressPayload(userId, range);
    return {
      range: payload.range,
      summary: payload.summary,
      nextAction: payload.nextAction,
      assessments: payload.assessments.slice(0, 6).map((a) => ({
        name: a.name,
        status: a.status,
        completion: a.completion,
        href: a.href,
      })),
    };
  }

  if (name === "get_roadmap") {
    const db = getDb();
    const roadmap = await getActiveRoadmap(db, userId);
    if (!roadmap) return { roadmap: null };
    const nodes = asNodes(roadmap.nodes);
    const progressRows = await db
      .select({ nodeId: roadmapProgress.nodeId, status: roadmapProgress.status })
      .from(roadmapProgress)
      .where(
        and(
          eq(roadmapProgress.userId, userId),
          eq(roadmapProgress.roadmapId, roadmap.id),
        ),
      );
    const statusById = new Map(progressRows.map((p) => [p.nodeId, p.status]));
    return {
      title: roadmap.title,
      targetRole: roadmap.targetRole,
      targetCompany: roadmap.targetCompany,
      nodes: nodes.slice(0, 40).map((n) => ({
        id: n.id,
        title: n.title,
        type: n.type,
        status: statusById.get(n.id) || n.status,
      })),
    };
  }

  if (name === "search_problems") {
    const query = typeof args.query === "string" ? args.query : "";
    const exact =
      typeof args.slug === "string" ? getChallengeById(args.slug) : undefined;
    if (exact) {
      return {
        problems: compactProblems(exact.title, 1),
      };
    }
    return { problems: compactProblems(query) };
  }

  if (name === "search_notes") {
    const settings = await getMemorySettings(userId);
    if (!settings.allowAiNotes) {
      return {
        error:
          "Notes are private. The student has not enabled “Allow AI to use notes”.",
      };
    }
    const query = typeof args.query === "string" ? args.query.trim() : "";
    if (!query) return { notes: [] };
    const rows = await searchNotes(userId, query, 8);
    return {
      notes: rows.map((n) => ({
        id: n.id,
        title: n.title,
        excerpt: n.content.slice(0, 280),
        updatedAt: n.updatedAt,
      })),
    };
  }

  if (name === "list_news") {
    const query = typeof args.query === "string" ? args.query : undefined;
    const savedOnly = args.savedOnly === true;
    const data = await listNews(userId, {
      search: query,
      savedOnly,
      limit: 8,
      sort: "latest",
    });
    return {
      page: "/dashboard/tech-news",
      featured: (data.featured || []).slice(0, 4).map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        summary: a.summary.slice(0, 220),
        href: techNewsArticlePath(a.id),
        featured: true,
      })),
      items: data.items.map((a) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        summary: a.summary.slice(0, 220),
        href: techNewsArticlePath(a.id),
        bookmarked: a.bookmarked,
        publishedAt: a.publishedAt,
      })),
    };
  }

  if (name === "get_article") {
    const articleId = typeof args.articleId === "string" ? args.articleId.trim() : "";
    if (!articleId) return { error: "articleId required" };
    const article = await getArticle(userId, articleId);
    if (!article) return { error: "Article not found in PathED tech news." };
    return {
      id: article.id,
      title: article.title,
      category: article.category,
      summary: article.summary,
      excerpt: (article.content || article.summary).slice(0, 1200),
      href: techNewsArticlePath(article.id),
      bookmarked: article.bookmarked,
      publishedAt: article.publishedAt,
      sourceName: article.sourceName,
    };
  }

  return { error: "Unknown tool" };
}
