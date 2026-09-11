import { errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getChallengeById } from "@/lib/challenges/catalog";
import { attemptMap } from "@/lib/challenges/progress";
import { findLinkedNode, toSummary } from "@/lib/challenges/relevance";
import { loadChallengeContext } from "@/lib/challenges/service";
import { toPublicSummary } from "@/lib/problems/public";
import { requireDbUser } from "@/lib/db/users";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const user = await requireDbUser();
    const { slug } = await ctx.params;
    const question = getChallengeById(decodeURIComponent(slug));
    if (!question) throw AppError.notFound("Problem not found");

    const loaded = await loadChallengeContext(user.id);
    const attempts = attemptMap(loaded.state);
    const attempt =
      attempts.get(question.id) || attempts.get(question.slug);
    const linked = findLinkedNode(
      question,
      loaded.unfinishedNodes.map((n) => ({
        id: n.id,
        title: n.title,
        skills: n.skills,
        topics: n.topics,
      })),
    );
    const summary = toPublicSummary(
      toSummary(question, attempt, {
        careerGoal: loaded.careerGoal,
        roadmapTopics: loaded.roadmapTopics,
        unfinishedBoostTopics: loaded.roadmapTopics,
        linkedNodeId: linked?.id,
        linkedNodeTitle: linked?.title,
        hintsUnlocked:
          loaded.state.hintUnlocks.find(
            (h) => h.questionId === question.id || h.questionId === question.slug,
          )?.levels || 0,
        solutionUnlocked:
          attempt?.status === "solved" ||
          loaded.state.solvedIds.includes(question.id) ||
          loaded.state.solvedIds.includes(question.slug),
      }),
    );

    return jsonResponse({
      problem: summary,
      windows: {
        daily: loaded.windows.daily.problem.slug === question.slug,
        weekly: loaded.windows.weekly.problem.slug === question.slug,
        monthly: loaded.windows.monthly.problem.slug === question.slug,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
