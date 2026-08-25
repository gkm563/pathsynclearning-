/** Supported coding assessment languages + IDE metadata. */

export type CodingLanguageId = "javascript" | "python" | "java" | "c" | "cpp";

export type CodingLanguageOption = {
  id: CodingLanguageId;
  label: string;
  version: string;
  ext: string;
  monaco?: string;
  executable: boolean;
  formatSupport: "prettier" | "indent" | "none";
};

export const CODING_LANGUAGES: CodingLanguageOption[] = [
  {
    id: "javascript",
    label: "JavaScript",
    version: "Node.js 12+ (Judge / local)",
    ext: "js",
    executable: true,
    formatSupport: "prettier",
  },
  {
    id: "python",
    label: "Python",
    version: "3.8+ (Judge0)",
    ext: "py",
    executable: true,
    formatSupport: "indent",
  },
  {
    id: "java",
    label: "Java",
    version: "OpenJDK 13 (Judge0)",
    ext: "java",
    executable: true,
    formatSupport: "indent",
  },
  {
    id: "c",
    label: "C",
    version: "GCC 9.2 (Judge0)",
    ext: "c",
    executable: true,
    formatSupport: "indent",
  },
  {
    id: "cpp",
    label: "C++",
    version: "GCC 9.2 (Judge0)",
    ext: "cpp",
    executable: true,
    formatSupport: "indent",
  },
];

export function getLanguageOption(id: string): CodingLanguageOption {
  return (
    CODING_LANGUAGES.find((l) => l.id === id) ||
    CODING_LANGUAGES[0]
  );
}

/** Generate language-specific starter from the JS starter / function name. */
export function starterForLanguage(
  language: CodingLanguageId,
  functionName: string,
  jsStarter: string,
): string {
  if (language === "javascript") return jsStarter;

  const fn = functionName || "solve";

  switch (language) {
    case "python":
      return [
        `# Python 3 — implement ${fn}`,
        `def ${fn}(*args):`,
        `    # Write your solution`,
        `    pass`,
        ``,
      ].join("\n");
    case "java":
      return [
        `// Java — keep class name Solution`,
        `class Solution {`,
        `    public Object ${fn}(Object... args) {`,
        `        // Prefer typed params matching the problem (e.g. int[] nums, int target)`,
        `        return null;`,
        `    }`,
        `}`,
        ``,
      ].join("\n");
    case "c":
      return [
        `/* C — implement ${fn}; scalar int problems work best */`,
        `int ${fn}(int a, int b) {`,
        `    /* Write your solution */`,
        `    return 0;`,
        `}`,
        ``,
      ].join("\n");
    case "cpp":
      return [
        `// C++ — implement ${fn}`,
        `#include <vector>`,
        `using namespace std;`,
        ``,
        `vector<int> ${fn}(vector<int> nums, int target) {`,
        `    // Write your solution`,
        `    return {};`,
        `}`,
        ``,
      ].join("\n");
    default:
      return jsStarter;
  }
}

const DRAFT_PREFIX = "pathed:coding-draft:";
const HISTORY_PREFIX = "pathed:coding-history:";

export type CodeDraft = {
  code: string;
  language: CodingLanguageId;
  updatedAt: string;
};

export type CodeHistoryEntry = CodeDraft & { id: string };

function draftKey(nodeId: string, language: CodingLanguageId) {
  return `${DRAFT_PREFIX}${nodeId}:${language}`;
}

function historyKey(nodeId: string) {
  return `${HISTORY_PREFIX}${nodeId}`;
}

export function loadDraft(
  nodeId: string,
  language: CodingLanguageId,
): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(draftKey(nodeId, language));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CodeDraft;
    return typeof parsed.code === "string" ? parsed.code : null;
  } catch {
    return null;
  }
}

export function saveDraft(
  nodeId: string,
  language: CodingLanguageId,
  code: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const payload: CodeDraft = {
      code,
      language,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(draftKey(nodeId, language), JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function pushCodeHistory(
  nodeId: string,
  language: CodingLanguageId,
  code: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const key = historyKey(nodeId);
    const prev: CodeHistoryEntry[] = JSON.parse(localStorage.getItem(key) || "[]");
    const next: CodeHistoryEntry[] = [
      {
        id: `${Date.now()}`,
        code,
        language,
        updatedAt: new Date().toISOString(),
      },
      ...prev.filter((e) => e.code !== code || e.language !== language),
    ].slice(0, 8);
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function loadCodeHistory(nodeId: string): CodeHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(historyKey(nodeId));
    return raw ? (JSON.parse(raw) as CodeHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

/** Light indent formatter for non-JS languages. */
export function formatByIndent(code: string): string {
  const lines = code.replace(/\t/g, "    ").split("\n");
  return lines.map((l) => l.replace(/\s+$/g, "")).join("\n").trimEnd() + "\n";
}
