import type { CodingAssessment, CodingTestCase, NodeAssessment } from "@/types/roadmap";

export type CodingTestResult = {
  index: number;
  ok: boolean;
  error?: string;
  args?: unknown[];
  expected?: unknown;
  actual?: unknown;
};

export type CodingGradeResult = {
  score: number;
  passed: boolean;
  passedCount: number;
  total: number;
  results: CodingTestResult[];
};

function deepEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

function formatValue(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2) ?? String(v);
  } catch {
    return String(v);
  }
}

export function formatDiff(expected: unknown, actual: unknown): string {
  const e = formatValue(expected);
  const a = formatValue(actual);
  if (e === a) return "No difference";
  return `Expected:\n${e}\n\nGot:\n${a}`;
}

/** Client-side public test runner (no hidden tests). */
export function runPublicTestsInBrowser(
  code: string,
  functionName: string,
  publicTests: CodingTestCase[],
): CodingGradeResult {
  const results: CodingTestResult[] = [];
  let passedCount = 0;

  let fn: (...args: unknown[]) => unknown;
  try {
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
      results.push({
        index: i,
        ok,
        args: t.args,
        expected: t.expected,
        actual: got,
      });
    } catch (err) {
      results.push({
        index: i,
        ok: false,
        args: t.args,
        expected: t.expected,
        actual: undefined,
        error: err instanceof Error ? err.message : "Runtime error",
      });
    }
  }

  const total = publicTests.length || 1;
  const score = Math.round((passedCount / total) * 100);
  return { score, passed: passedCount === total, passedCount, total, results };
}

export type { CodingAssessment, NodeAssessment };
