import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getChallengeById } from "@/lib/challenges/catalog";
import {
  getOrCreateProjectRun,
  loadRunBundle,
  saveProjectProgress,
} from "@/lib/projects/service";
import { requireDbUser } from "@/lib/db/users";
import { challengesProjectProgressSchema } from "@/lib/validation/schemas";

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, challengesProjectProgressSchema);
    const question = getChallengeById(body.questionId);
    if (!question?.project) throw AppError.notFound("Project challenge not found");

    const run = await getOrCreateProjectRun({
      userId: user.id,
      source: "challenge",
      refId: body.questionId,
    });
    if (run.status === "passed") {
      throw AppError.badRequest("Project already passed");
    }

    await saveProjectProgress({
      runId: run.id,
      stepsDone: body.stepsDone,
      evidence: body.evidence,
      repoUrl: body.repoUrl,
      reflection: body.reflection,
    });

    const bundle = await loadRunBundle(run.id);
    return jsonResponse({
      ok: true,
      runId: run.id,
      stepsDone: bundle.steps.filter((s) => s.done).map((s) => s.stepId),
      evidence: bundle.evidence,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
