import { errorResponse, jsonResponse } from "@/lib/api/http";
import {
  buildChallengesResponse,
  loadChallengeContext,
  persistChallengeState,
} from "@/lib/challenges/service";
import { requireDbUser } from "@/lib/db/users";

export async function GET() {
  try {
    const user = await requireDbUser();
    const ctx = await loadChallengeContext(user.id);
    if (ctx.needsPersist) {
      await persistChallengeState(user.id, ctx.state, ctx.progressExists);
    }
    return jsonResponse(
      buildChallengesResponse({
        state: ctx.state,
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
