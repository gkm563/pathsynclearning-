import { errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getChallengeById } from "@/lib/challenges/catalog";
import {
  getOrCreateProjectRun,
  loadRunBundle,
} from "@/lib/projects/service";
import { requireDbUser } from "@/lib/db/users";

export async function GET(request: Request) {
  try {
    const user = await requireDbUser();
    const questionId = new URL(request.url).searchParams.get("questionId") || "";
    if (!questionId) throw AppError.badRequest("questionId required");

    const question = getChallengeById(questionId);
    if (!question?.project) {
      throw AppError.notFound("Project challenge not found");
    }

    const run = await getOrCreateProjectRun({
      userId: user.id,
      source: "challenge",
      refId: questionId,
    });
    const bundle = await loadRunBundle(run.id);
    const passed = run.status === "passed";

    return jsonResponse({
      questionId,
      title: question.title,
      xp: question.xp,
      coins: question.coins,
      spec: question.project,
      run: {
        id: run.id,
        status: run.status,
        score: run.score,
        checklistPct: run.checklistPct,
        repoUrl: run.repoUrl,
        reflection: run.reflection,
        stepsDone: bundle.steps.filter((s) => s.done).map((s) => s.stepId),
        evidence: bundle.evidence.map((e) => ({
          kind: e.kind,
          ...(e.url ? { url: e.url } : {}),
          ...(e.text ? { text: e.text } : {}),
          ...(e.stepId ? { stepId: e.stepId } : {}),
        })),
        rubricBreakdown: passed ? run.rubricBreakdown : [],
        solution: passed ? question.solution : null,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
