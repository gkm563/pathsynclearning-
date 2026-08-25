import vm from "node:vm";
import type { CodingAssessment, CodingTestCase, NodeAssessment } from "@/types/roadmap";
import type { CodingGradeResult } from "@/lib/roadmap/coding-client";
import type { CodingLanguageId } from "@/lib/roadmap/coding-languages";
import { gradeCodingMulti } from "@/lib/roadmap/code-runner";

function deepEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

function runUserFunction(
  code: string,
  functionName: string,
  args: unknown[],
  timeoutMs = 1500,
): unknown {
  const sandbox: Record<string, unknown> = {
    console: { log() {}, warn() {}, error() {} },
  };
  const script = new vm.Script(
    `${code}\n; typeof ${functionName} === "function" ? ${functionName}(...__args) : (() => { throw new Error("Function ${functionName} not found"); })();`,
    { filename: "assessment.js" },
  );
  const context = vm.createContext(sandbox);
  (context as { __args?: unknown[] }).__args = args;
  return script.runInContext(context, { timeout: timeoutMs });
}

function gradeCodingJs(
  assessment: NodeAssessment,
  code: string,
): CodingGradeResult {
  const coding = assessment.coding as CodingAssessment;
  const tests: CodingTestCase[] = [
    ...(coding.publicTests || []),
    ...(coding.hiddenTests || []),
  ];
  const results: CodingGradeResult["results"] = [];
  let passedCount = 0;

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    try {
      const got = runUserFunction(code, coding.functionName, t.args);
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
        error: err instanceof Error ? err.message : "Runtime error",
      });
    }
  }

  const total = tests.length || 1;
  const score = Math.round((passedCount / total) * 100);
  const needAll = (assessment.passScore ?? 100) >= 100;
  const passed = needAll
    ? passedCount === total
    : score >= (assessment.passScore ?? 100);

  return { score, passed, passedCount, total, results };
}

export async function gradeCoding(
  assessment: NodeAssessment,
  code: string,
  language: CodingLanguageId = "javascript",
): Promise<CodingGradeResult> {
  if (language === "javascript") {
    return gradeCodingJs(assessment, code);
  }

  const coding = assessment.coding as CodingAssessment;
  const tests: CodingTestCase[] = [
    ...(coding.publicTests || []),
    ...(coding.hiddenTests || []),
  ];

  return gradeCodingMulti(
    language,
    code,
    coding.functionName,
    tests,
    assessment.passScore ?? 100,
  );
}
