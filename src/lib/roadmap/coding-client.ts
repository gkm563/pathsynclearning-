import type { CodingAssessment, CodingTestCase, NodeAssessment } from "@/types/roadmap";

export type CodingGradeResult = {
  score: number;
  passed: boolean;
  passedCount: number;
  total: number;
  results: Array<{ index: number; ok: boolean; error?: string }>;
};

function deepEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

/** Client-side public test runner (no hidden tests). */
export function runPublicTestsInBrowser(
  code: string,
  functionName: string,
  publicTests: CodingTestCase[],
): CodingGradeResult {
  const results: CodingGradeResult["results"] = [];
  let passedCount = 0;

  let fn: (...args: unknown[]) => unknown;
  try {
    // eslint-disable-next-line no-new-func
    const factory = new Function(
      `${code}\n; if (typeof ${functionName} !== "function") throw new Error("Function not found"); return ${functionName};`,
    );
    fn = factory() as (...args: unknown[]) => unknown;
  } catch (err) {
    return {
      score: 0,
      passed: false,
      passedCount: 0,
      total: publicTests.length || 1,
      results: [
        {
          index: 0,
          ok: false,
          error: err instanceof Error ? err.message : "Compile error",
        },
      ],
    };
  }

  for (let i = 0; i < publicTests.length; i++) {
    const t = publicTests[i];
    try {
      const got = fn(...t.args);
      const ok = deepEqual(got, t.expected);
      if (ok) passedCount += 1;
      results.push({ index: i, ok });
    } catch (err) {
      results.push({
        index: i,
        ok: false,
        error: err instanceof Error ? err.message : "Runtime error",
      });
    }
  }

  const total = publicTests.length || 1;
  const score = Math.round((passedCount / total) * 100);
  return { score, passed: passedCount === total, passedCount, total, results };
}

export type { CodingAssessment, NodeAssessment };
