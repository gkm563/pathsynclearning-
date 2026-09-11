import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { generateDailyPack } from "@/lib/challenges/daily-pack";
import {
  buildChallengesResponse,
  loadChallengeContext,
  persistChallengeState,
} from "@/lib/challenges/service";
import { requireDbUser } from "@/lib/db/users";
import { challengesSyncSchema } from "@/lib/validation/schemas";

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, challengesSyncSchema);
    const ctx = await loadChallengeContext(user.id);
    const enabled =
      typeof body.enabled === "boolean"
        ? body.enabled
        : ctx.state.sync.enabled;
    const syncChanged = enabled !== ctx.state.sync.enabled;

    let next = {
      ...ctx.state,
      sync: {
        ...ctx.state.sync,
        enabled,
        pinnedNodeIds: body.pinnedNodeIds ?? ctx.state.sync.pinnedNodeIds,
        lastSyncedAt: new Date().toISOString(),
      },
    };

    if (syncChanged) {
      const generated = generateDailyPack({
        userId: user.id,
        dateKey: ctx.dateKey,
        careerGoal: ctx.careerGoal,
        roadmapTopics: ctx.roadmapTopics,
        syncEnabled: enabled,
        excludeIds: [
          ctx.windows.daily.problem.id,
          ctx.windows.weekly.problem.id,
          ctx.windows.monthly.problem.id,
        ],
      });
      next = {
        ...next,
        daily: {
          dateKey: ctx.windows.daily.periodKey,
          featuredId: ctx.windows.daily.problem.id,
          sideIds: generated.sideIds,
          completedIds: ctx.state.daily.completedIds.filter((id) =>
            generated.sideIds.includes(id),
          ),
        },
      };
    }

    await persistChallengeState(user.id, next, ctx.progressExists);
    return jsonResponse(
      buildChallengesResponse({
        state: next,
        careerGoal: ctx.careerGoal,
        roadmapTopics: ctx.roadmapTopics,
        unfinishedNodes: ctx.unfinishedNodes,
        userId: user.id,
        windows: ctx.windows,
      }),
    );
  } catch (e) {
    return errorResponse(e);
  }
}
