import type { CodingLanguageId } from "@/lib/roadmap/coding-languages";
import type { CodingTestCase } from "@/types/roadmap";
import type { CodingGradeResult, CodingTestResult } from "@/lib/roadmap/coding-client";

const JUDGE0_URL =
  process.env.JUDGE0_API_URL?.replace(/\/$/, "") || "https://ce.judge0.com";

/** Judge0 language_id map (CE). */
export const JUDGE0_LANGUAGE_IDS: Record<CodingLanguageId, number> = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // Java (OpenJDK)
  c: 50, // C (GCC)
  cpp: 54, // C++ (GCC)
};

function deepEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}

function toPy(v: unknown): string {
  if (v === null) return "None";
  if (typeof v === "boolean") return v ? "True" : "False";
  return JSON.stringify(v);
}

function toJavaExpr(v: unknown): string {
  if (typeof v === "number") return Number.isInteger(v) ? `${v}` : `${v}d`;
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) {
    if (v.every((x) => typeof x === "number" && Number.isInteger(x))) {
      return `new int[]{${v.join(",")}}`;
    }
    if (v.every((x) => typeof x === "string")) {
      return `new String[]{${v.map((x) => JSON.stringify(x)).join(",")}}`;
    }
  }
  return `null /* unsupported literal ${JSON.stringify(v)} */`;
}

function javaCompare(expected: unknown): string {
  if (Array.isArray(expected) && expected.every((x) => typeof x === "number")) {
    return `java.util.Arrays.equals((int[]) actual, ${toJavaExpr(expected)})`;
  }
  if (typeof expected === "number" || typeof expected === "boolean" || typeof expected === "string") {
    return `java.util.Objects.equals(actual, ${toJavaExpr(expected)})`;
  }
  return `String.valueOf(actual).equals(${JSON.stringify(JSON.stringify(expected))})`;
}

function javaActualJson(expected: unknown): string {
  if (Array.isArray(expected) && expected.every((x) => typeof x === "number")) {
    return `java.util.Arrays.toString((int[]) actual)`;
  }
  return `String.valueOf(actual)`;
}

/** Build a single self-contained program that runs all tests and prints JSON results. */
export function buildHarness(
  language: CodingLanguageId,
  userCode: string,
  functionName: string,
  tests: CodingTestCase[],
): string {
  const fn = functionName || "solve";

  if (language === "python") {
    const cases = tests
      .map((t, i) => {
        const args = t.args.map(toPy).join(", ");
        return `_run(${i}, lambda: ${fn}(${args}), ${toPy(t.expected)})`;
      })
      .join("\n");
    return `${userCode}

import json
_results = []
def _run(i, call, expected):
    try:
        actual = call()
        ok = actual == expected
        _results.append({"index": i, "ok": ok, "expected": expected, "actual": actual})
    except Exception as e:
        _results.append({"index": i, "ok": False, "expected": expected, "error": str(e)})
${cases}
print(json.dumps(_results))
`;
  }

  if (language === "javascript") {
    const casesJson = JSON.stringify(
      tests.map((t) => ({ args: t.args, expected: t.expected })),
    );
    return `${userCode}

const __tests = ${casesJson};
const __results = [];
for (let i = 0; i < __tests.length; i++) {
  const t = __tests[i];
  try {
    if (typeof ${fn} !== "function") throw new Error("Function ${fn} not found");
    const actual = ${fn}(...t.args);
    const ok = JSON.stringify(actual) === JSON.stringify(t.expected);
    __results.push({ index: i, ok, expected: t.expected, actual });
  } catch (e) {
    __results.push({ index: i, ok: false, expected: t.expected, error: String(e && e.message || e) });
  }
}
console.log(JSON.stringify(__results));
`;
  }

  if (language === "java") {
    // Expect user code to define `class Solution { ... public ... fn(...) }`
    // We inject a Main that instantiates Solution and runs tests.
    const stripped = userCode.replace(/\bpublic\s+class\s+Solution\b/, "class Solution");
    const cases = tests
      .map((t, i) => {
        const args = t.args.map(toJavaExpr).join(", ");
        return `
        try {
            Object actual = sol.${fn}(${args});
            boolean ok = ${javaCompare(t.expected)};
            results.add(String.format("{\\"index\\":${i},\\"ok\\":%s,\\"expected\\":%s,\\"actual\\":%s}",
                ok ? "true" : "false",
                ${JSON.stringify(JSON.stringify(t.expected))},
                quote(${javaActualJson(t.expected)})));
        } catch (Exception e) {
            results.add(String.format("{\\"index\\":${i},\\"ok\\":false,\\"expected\\":%s,\\"error\\":%s}",
                ${JSON.stringify(JSON.stringify(t.expected))},
                quote(e.getMessage())));
        }`;
      })
      .join("\n");

    return `
import java.util.*;
${stripped}

public class Main {
    static String quote(String s) {
        if (s == null) return "null";
        StringBuilder sb = new StringBuilder("\\"");
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '\\\\' || c == '"') sb.append('\\\\');
            if (c == '\\n') { sb.append("\\\\n"); continue; }
            sb.append(c);
        }
        sb.append('"');
        return sb.toString();
    }
    public static void main(String[] args) {
        Solution sol = new Solution();
        List<String> results = new ArrayList<>();
        ${cases}
        System.out.println("[" + String.join(",", results) + "]");
    }
}
`;
  }

  if (language === "cpp" || language === "c") {
    // Limited: only int / int-array style problems. User implements fn; we call with literals.
    const isCpp = language === "cpp";
    const header = isCpp
      ? `#include <bits/stdc++.h>
using namespace std;
`
      : `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
`;

    // For C/C++ we print a simple JSON array using printf; support int returns and int* + size pattern is too complex.
    // Expect user function returning int or using a convention: for arrays, compare via printed format.
    // Practical approach: embed tests that call fn and compare scalar / print array results as JSON via helper.

    if (isCpp) {
      const cases = tests
        .map((t, i) => {
          const args = t.args
            .map((a) => {
              if (Array.isArray(a) && a.every((x) => typeof x === "number")) {
                return `vector<int>{${a.join(",")}}`;
              }
              if (typeof a === "number") return `${a}`;
              if (typeof a === "string") return JSON.stringify(a);
              return "/*unsupported*/0";
            })
            .join(", ");
          const exp = t.expected;
          if (Array.isArray(exp) && exp.every((x) => typeof x === "number")) {
            return `
  {
    auto actual = ${fn}(${args});
    vector<int> expected{${(exp as number[]).join(",")}};
    bool ok = actual == expected;
    cout << "{\\"index\\":${i},\\"ok\\":" << (ok?"true":"false")
         << ",\\"expected\\":${JSON.stringify(JSON.stringify(exp))}
         << ",\\"actual\\":\\"" << "[";
    for (size_t k=0;k<actual.size();k++){ if(k) cout<<","; cout<<actual[k]; }
    cout << "]" << "\\"}";
    if (${i} + 1 < ${tests.length}) cout << ",";
  }`;
          }
          return `
  {
    auto actual = ${fn}(${args});
    auto expected = ${typeof exp === "number" ? exp : 0};
    bool ok = actual == expected;
    cout << "{\\"index\\":${i},\\"ok\\":" << (ok?"true":"false")
         << ",\\"expected\\":${JSON.stringify(JSON.stringify(exp))}
         << ",\\"actual\\":" << actual << "}";
    if (${i} + 1 < ${tests.length}) cout << ",";
  }`;
        })
        .join("\n");

      return `${header}
${userCode}

int main() {
  cout << "[";
${cases}
  cout << "]" << endl;
  return 0;
}
`;
    }

    // C: scalar int only for harness simplicity; array problems should use C++
    const cases = tests
      .map((t, i) => {
        const args = t.args
          .map((a) => (typeof a === "number" ? `${a}` : "0"))
          .join(", ");
        const exp = typeof t.expected === "number" ? t.expected : 0;
        return `
  {
    int actual = ${fn}(${args});
    int expected = ${exp};
    int ok = actual == expected;
    printf("{\\"index\\":${i},\\"ok\\":%s,\\"expected\\":${exp},\\"actual\\":%d}", ok ? "true" : "false", actual);
    if (${i} + 1 < ${tests.length}) printf(",");
  }`;
      })
      .join("\n");

    return `${header}
${userCode}

int main() {
  printf("[");
${cases}
  printf("]\\n");
  return 0;
}
`;
  }

  return userCode;
}

type Judge0Response = {
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  message?: string | null;
  status?: { id: number; description: string };
};

async function executeOnJudge0(
  language: CodingLanguageId,
  source: string,
): Promise<{ ok: boolean; stdout: string; error?: string }> {
  const language_id = JUDGE0_LANGUAGE_IDS[language];
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (process.env.JUDGE0_API_KEY) {
    headers["X-Auth-Token"] = process.env.JUDGE0_API_KEY;
  }
  if (process.env.JUDGE0_RAPIDAPI_KEY) {
    headers["X-RapidAPI-Key"] = process.env.JUDGE0_RAPIDAPI_KEY;
    headers["X-RapidAPI-Host"] =
      process.env.JUDGE0_RAPIDAPI_HOST || "judge0-ce.p.rapidapi.com";
  }

  const res = await fetch(
    `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_code: source,
        language_id,
        cpu_time_limit: 3,
        wall_time_limit: 8,
        memory_limit: 128000,
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      stdout: "",
      error: `Judge0 HTTP ${res.status}: ${text.slice(0, 200)}`,
    };
  }

  const data = (await res.json()) as Judge0Response;
  const statusId = data.status?.id ?? 0;
  // 3 = Accepted
  if (statusId !== 3) {
    const err =
      data.stderr ||
      data.compile_output ||
      data.message ||
      data.status?.description ||
      "Execution failed";
    return { ok: false, stdout: data.stdout || "", error: err };
  }
  return { ok: true, stdout: data.stdout || "" };
}

function parseResultsJson(stdout: string): CodingTestResult[] | null {
  const text = stdout.trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start < 0 || end < start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1)) as CodingTestResult[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function gradeCodingMulti(
  language: CodingLanguageId,
  code: string,
  functionName: string,
  tests: CodingTestCase[],
  passScore: number,
): Promise<CodingGradeResult> {
  const harness = buildHarness(language, code, functionName, tests);
  const run = await executeOnJudge0(language, harness);

  if (!run.ok && !run.stdout) {
    return {
      score: 0,
      passed: false,
      passedCount: 0,
      total: tests.length || 1,
      results: tests.map((t, i) => ({
        index: i,
        ok: false,
        args: t.args,
        expected: t.expected,
        error: run.error || "Execution failed",
      })),
    };
  }

  const parsed = parseResultsJson(run.stdout);
  if (!parsed) {
    return {
      score: 0,
      passed: false,
      passedCount: 0,
      total: tests.length || 1,
      results: [
        {
          index: 0,
          ok: false,
          error:
            run.error ||
            `Could not parse judge output: ${(run.stdout || "").slice(0, 300)}`,
        },
      ],
    };
  }

  const results: CodingTestResult[] = tests.map((t, i) => {
    const r = parsed.find((p) => p.index === i) || parsed[i];
    if (!r) {
      return {
        index: i,
        ok: false,
        args: t.args,
        expected: t.expected,
        error: "Missing result",
      };
    }
    const ok =
      typeof r.ok === "boolean"
        ? r.ok
        : deepEqual(r.actual, t.expected);
    return {
      index: i,
      ok,
      args: t.args,
      expected: t.expected,
      actual: r.actual,
      error: r.error,
    };
  });

  const passedCount = results.filter((r) => r.ok).length;
  const total = tests.length || 1;
  const score = Math.round((passedCount / total) * 100);
  const needAll = passScore >= 100;
  const passed = needAll ? passedCount === total : score >= passScore;

  return { score, passed, passedCount, total, results };
}
