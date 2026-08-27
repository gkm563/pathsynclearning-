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

function toBase64(str: string): string {
  return Buffer.from(str, "utf8").toString("base64");
}

function fromBase64(str: string | null | undefined): string {
  if (!str) return "";
  try {
    return Buffer.from(str, "base64").toString("utf8");
  } catch {
    return str;
  }
}

function toCppLiteral(v: unknown): string {
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return `${v}`;
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v) && v.every((x) => typeof x === "number")) {
    return `vector<int>{${v.join(",")}}`;
  }
  return "/*unsupported*/0";
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
          const args = t.args.map(toCppLiteral).join(", ");
          const exp = t.expected;
          // C++ string literal whose contents are the JSON encoding of `exp`
          // Streamed AFTER ",\"expected\":" so quotes never break the C++ string.
          const expectedLit = JSON.stringify(JSON.stringify(exp));
          const comma =
            i + 1 < tests.length ? `    if (${i} + 1 < ${tests.length}) cout << ",";` : "";

          if (Array.isArray(exp) && exp.every((x) => typeof x === "number")) {
            return `
  {
    auto actual = ${fn}(${args});
    vector<int> expected{${(exp as number[]).join(",")}};
    bool ok = actual == expected;
    cout << "{\\"index\\":${i},\\"ok\\":" << (ok ? "true" : "false")
         << ",\\"expected\\":" << ${expectedLit}
         << ",\\"actual\\":[";
    for (size_t k = 0; k < actual.size(); k++) {
      if (k) cout << ",";
      cout << actual[k];
    }
    cout << "]}";
${comma}
  }`;
          }
          if (typeof exp === "boolean") {
            return `
  {
    auto actual = ${fn}(${args});
    bool expected = ${exp ? "true" : "false"};
    bool ok = static_cast<bool>(actual) == expected;
    cout << "{\\"index\\":${i},\\"ok\\":" << (ok ? "true" : "false")
         << ",\\"expected\\":" << ${expectedLit}
         << ",\\"actual\\":" << (static_cast<bool>(actual) ? "true" : "false")
         << "}";
${comma}
  }`;
          }
          if (typeof exp === "string") {
            return `
  {
    auto actual = ${fn}(${args});
    string expected = ${JSON.stringify(exp)};
    bool ok = actual == expected;
    cout << "{\\"index\\":${i},\\"ok\\":" << (ok ? "true" : "false")
         << ",\\"expected\\":" << ${expectedLit}
         << ",\\"actual\\":\\"";
    for (char ch : actual) {
      if (ch == '\\\\' || ch == '"') cout << '\\\\';
      else if (ch == '\\n') cout << "\\\\n";
      else cout << ch;
    }
    cout << "\\"}";
${comma}
  }`;
          }
          return `
  {
    auto actual = ${fn}(${args});
    auto expected = ${typeof exp === "number" ? exp : 0};
    bool ok = actual == expected;
    cout << "{\\"index\\":${i},\\"ok\\":" << (ok ? "true" : "false")
         << ",\\"expected\\":" << ${expectedLit}
         << ",\\"actual\\":" << actual << "}";
${comma}
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

    // C: scalar int / string (const char*) returning int (0/1 for bools)
    const cases = tests
      .map((t, i) => {
        const args = t.args
          .map((a) => {
            if (typeof a === "number") return `${a}`;
            if (typeof a === "string") return JSON.stringify(a);
            return "0";
          })
          .join(", ");
        const exp =
          typeof t.expected === "boolean"
            ? t.expected
              ? 1
              : 0
            : typeof t.expected === "number"
              ? t.expected
              : 0;
        // Build printf format with expected JSON embedded safely as a C string fragment
        const expectedJson = JSON.stringify(t.expected); // true / false / 4 / "hi"
        return `
  {
    int actual = ${fn}(${args});
    int expected = ${exp};
    int ok = actual == expected;
    printf("{\\"index\\":${i},\\"ok\\":%s,\\"expected\\":%s,\\"actual\\":%d}", ok ? "true" : "false", ${JSON.stringify(expectedJson)}, actual);
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
    `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        source_code: toBase64(source),
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
  const stdout = fromBase64(data.stdout);
  const stderr = fromBase64(data.stderr);
  const compileOutput = fromBase64(data.compile_output);
  const message = fromBase64(data.message);
  const statusId = data.status?.id ?? 0;
  // 3 = Accepted
  if (statusId !== 3) {
    const err =
      stderr ||
      compileOutput ||
      message ||
      data.status?.description ||
      "Execution failed";
    return { ok: false, stdout, error: err };
  }
  return { ok: true, stdout };
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
