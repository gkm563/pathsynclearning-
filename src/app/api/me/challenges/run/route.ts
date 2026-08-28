import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getChallengeById } from "@/lib/challenges/catalog";
import { runPublicTestsInBrowser } from "@/lib/roadmap/coding-client";
import { gradeCodingMulti } from "@/lib/roadmap/code-runner";
import type { CodingLanguageId } from "@/lib/roadmap/coding-languages";
import { requireDbUser } from "@/lib/db/users";
import { z } from "zod";

const bodySchema = z.object({
  questionId: z.string().min(1).max(128),
  code: z.string().max(50000),
  language: z.enum(["javascript", "python", "java", "c", "cpp"]),
  /** public = sample tests only; submit = public + hidden */
  mode: z.enum(["public", "submit"]).default("public"),
});

export async function POST(request: Request) {
  try {
    await requireDbUser();
    const body = await parseJson(request, bodySchema);
    const question = getChallengeById(body.questionId);
    if (!question?.coding) {
      throw AppError.badRequest("Coding harness not found for this challenge");
    }

    const harness = question.coding;
    const language = body.language as CodingLanguageId;
    const tests =
      body.mode === "submit"
        ? [...harness.publicTests, ...(harness.hiddenTests || [])]
        : harness.publicTests;

    if (!tests.length) {
      throw AppError.badRequest("No tests configured for this challenge");
    }

    if (language === "javascript") {
      const graded = runPublicTestsInBrowser(
        body.code,
        harness.functionName,
        tests,
      );
      return jsonResponse({
        ...graded,
        language,
        mode: body.mode,
        scope: body.mode === "submit" ? "all" : "public",
      });
    }

    const graded = await gradeCodingMulti(
      language,
      body.code,
      harness.functionName,
      tests,
      100,
    );

    return jsonResponse({
      ...graded,
      language,
      mode: body.mode,
      scope: body.mode === "submit" ? "all" : "public",
    });
  } catch (e) {
    return errorResponse(e);
  }
}
