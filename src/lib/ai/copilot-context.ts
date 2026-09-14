import "server-only";
import { and, eq } from "drizzle-orm";
import { getChallengeById } from "@/lib/challenges/catalog";
import { loadChallengeContext } from "@/lib/challenges/service";
import { getDb } from "@/lib/db/client";
import { profiles, roadmapProgress, userSettings, wallets } from "@/lib/db/schema";
import { getActiveRoadmap } from "@/lib/roadmap/active";
import type { RoadmapNode } from "@/types/roadmap";
import { parseCopilotPageEntity } from "./copilot-href";
import type { CopilotPageEntity } from "./copilot-types";
import {
  firstNameFrom,
  isCopilotMemorySource,
  resolveCopilotName,
} from "./copilot-identity";

export type CopilotStudentContext = {
  page: string;
  pageEntity: CopilotPageEntity;
  companion: {
    name: string;
    memory: string;
    memorySource: string | null;
  };
  student: {
    name: string;
    firstName: string;
    cri: number;
    xp: number;
    coins: number;
    streak: number;
    level: number;
    plan: string;
    institute: string | null;
    degree: string | null;
    goal: string | null;
  };
  roadmap: {
    title: string;
    targetRole: string;
    targetCompany: string | null;
    estimatedWeeks: number | null;
    completed: number;
    total: number;
    next: Array<{ id: string; title: string; status: string }>;
  } | null;
  today: {
    featured: { title: string; slug: string; difficulty: string } | null;
    side: Array<{ title: string; slug: string; difficulty: string }>;
  };
};

function asNodes(raw: unknown): RoadmapNode[] {
  return Array.isArray(raw) ? (raw as RoadmapNode[]) : [];
}

function compactProblem(id: string | undefined | null) {
  if (!id) return null;
  const q = getChallengeById(id);
  if (!q) return null;
  return { title: q.title, slug: q.slug, difficulty: q.difficulty };
}

export async function buildCopilotContext(
  user: { id: string; full_name: string | null },
  pathname: string,
): Promise<CopilotStudentContext> {
  const db = getDb();
  const page = (pathname || "/dashboard").split("?")[0] || "/dashboard";
  const { entity } = parseCopilotPageEntity(page);

  const [profileRow, walletRow, settingsRow, roadmap] = await Promise.all([
    db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, user.id))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1)
      .then((r) => r[0] ?? null),
    getActiveRoadmap(db, user.id),
  ]);

  let roadmapCtx: CopilotStudentContext["roadmap"] = null;
  if (roadmap) {
    const nodes = asNodes(roadmap.nodes);
    const progressRows = await db
      .select({ nodeId: roadmapProgress.nodeId, status: roadmapProgress.status })
      .from(roadmapProgress)
      .where(
        and(
          eq(roadmapProgress.userId, user.id),
          eq(roadmapProgress.roadmapId, roadmap.id),
        ),
      );
    const statusById = new Map(progressRows.map((p) => [p.nodeId, p.status]));
    const withStatus = nodes.map((n) => ({
      id: n.id,
      title: n.title,
      status: statusById.get(n.id) || n.status || "locked",
    }));
    const completed = withStatus.filter((n) => n.status === "completed").length;
    const next = withStatus
      .filter((n) => n.status === "in_progress" || n.status === "available")
      .slice(0, 3);

    roadmapCtx = {
      title: roadmap.title,
      targetRole: roadmap.targetRole,
      targetCompany: roadmap.targetCompany,
      estimatedWeeks: roadmap.estimatedWeeks,
      completed,
      total: withStatus.length,
      next,
    };
  }

  let today: CopilotStudentContext["today"] = { featured: null, side: [] };
  try {
    const ctx = await loadChallengeContext(user.id);
    today = {
      featured: compactProblem(ctx.windows.daily.problem.id),
      side: (ctx.state.daily.sideIds || [])
        .map((id) => compactProblem(id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .slice(0, 4),
    };
  } catch {
    // snapshot still useful without daily pack
  }

  const degree = [profileRow?.degree, profileRow?.branch].filter(Boolean).join(" · ") || null;
  const fullName = user.full_name || profileRow?.username || "Student";

  return {
    page,
    pageEntity: entity,
    companion: {
      name: resolveCopilotName(settingsRow?.copilotName),
      memory: settingsRow?.copilotMemory || "",
      memorySource: isCopilotMemorySource(settingsRow?.copilotMemorySource)
        ? settingsRow.copilotMemorySource
        : null,
    },
    student: {
      name: fullName,
      firstName: firstNameFrom(fullName),
      cri: profileRow?.cri ?? 0,
      xp: profileRow?.xp ?? 0,
      coins: walletRow?.coins ?? 0,
      streak: profileRow?.streak ?? 0,
      level: profileRow?.level ?? 1,
      plan: settingsRow?.plan || "free",
      institute: profileRow?.institute ?? null,
      degree,
      goal: profileRow?.objective || profileRow?.passion || null,
    },
    roadmap: roadmapCtx,
    today,
  };
}
