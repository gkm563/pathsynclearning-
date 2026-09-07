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
    monaco: "javascript",
    executable: true,
    formatSupport: "prettier",
  },
  {
    id: "python",
    label: "Python",
    version: "3.8+ (Judge0)",
    ext: "py",
    monaco: "python",
    executable: true,
    formatSupport: "indent",
  },
  {
    id: "java",
    label: "Java",
    version: "OpenJDK 13 (Judge0)",
    ext: "java",
    monaco: "java",
    executable: true,
    formatSupport: "indent",
  },
  {
    id: "c",
    label: "C",
    version: "GCC 9.2 (Judge0)",
    ext: "c",
    monaco: "c",
    executable: true,
    formatSupport: "indent",
  },
  {
    id: "cpp",
    label: "C++",
    version: "GCC 9.2 (Judge0)",
    ext: "cpp",
    monaco: "cpp",
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

type InferredType = "int" | "int[]" | "string" | "bool" | "unknown";

function inferType(v: unknown): InferredType {
  if (typeof v === "boolean") return "bool";
  if (typeof v === "number") return "int";
  if (typeof v === "string") return "string";
  if (Array.isArray(v) && v.every((x) => typeof x === "number")) return "int[]";
  return "unknown";
}

function parseJsParams(jsStarter: string, functionName: string): string[] {
  const re = new RegExp(
    `function\\s+${functionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\(([^)]*)\\)`,
  );
  const m = jsStarter.match(re);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export type StarterSample = { args: unknown[]; expected: unknown };

/** Generate language-specific starter from the JS starter / sample test types. */
export function starterForLanguage(
  language: CodingLanguageId,
  functionName: string,
  jsStarter: string,
  sample?: StarterSample,
): string {
  if (language === "javascript") return jsStarter;

  const fn = functionName || "solve";
  const params = parseJsParams(jsStarter, fn);
  const argTypes = (sample?.args || []).map(inferType);
  const retType = sample ? inferType(sample.expected) : "unknown";
  const names =
    params.length > 0
      ? params
      : argTypes.map((_, i) => `arg${i + 1}`);

  const pyParams =
    names.length > 0
      ? names.join(", ")
      : "*args";

  const javaParams = names
    .map((name, i) => {
      const t = argTypes[i] || "unknown";
      if (t === "int[]") return `int[] ${name}`;
      if (t === "string") return `String ${name}`;
      if (t === "bool") return `boolean ${name}`;
      if (t === "int") return `int ${name}`;
      return `Object ${name}`;
    })
    .join(", ");

  const javaRet =
    retType === "int[]"
      ? "int[]"
      : retType === "string"
        ? "String"
        : retType === "bool"
          ? "boolean"
          : retType === "int"
            ? "int"
            : "Object";

  const javaDefault =
    retType === "int[]"
      ? "return new int[]{};"
      : retType === "string"
        ? 'return "";'
        : retType === "bool"
          ? "return false;"
          : retType === "int"
            ? "return 0;"
            : "return null;";

  const cppParams = names
    .map((name, i) => {
      const t = argTypes[i] || "unknown";
      if (t === "int[]") return `vector<int> ${name}`;
      if (t === "string") return `string ${name}`;
      if (t === "bool") return `bool ${name}`;
      if (t === "int") return `int ${name}`;
      return `auto ${name}`;
    })
    .join(", ");

  const cppRet =
    retType === "int[]"
      ? "vector<int>"
      : retType === "string"
        ? "string"
        : retType === "bool"
          ? "bool"
          : retType === "int"
            ? "int"
            : "auto";

  const cppDefault =
    retType === "int[]"
      ? "return {};"
      : retType === "string"
        ? 'return "";'
        : retType === "bool"
          ? "return false;"
          : retType === "int"
            ? "return 0;"
            : "return {};";

  const cppIncludes = new Set<string>();
  if (argTypes.includes("int[]") || retType === "int[]") cppIncludes.add("vector");
  if (argTypes.includes("string") || retType === "string") cppIncludes.add("string");
  const cppIncludeLines =
    cppIncludes.size > 0
      ? [...cppIncludes].map((h) => `#include <${h}>`).join("\n") + "\n"
      : "";

  const cParams = names
    .map((name, i) => {
      const t = argTypes[i] || "unknown";
      if (t === "string") return `const char* ${name}`;
      if (t === "int") return `int ${name}`;
      return `int ${name}`;
    })
    .join(", ");

  const cRet = retType === "bool" || retType === "int" ? "int" : "int";
  const cDefault = "return 0;";

  switch (language) {
    case "python":
      return [
        `# Python 3 — implement ${fn}`,
        `def ${fn}(${pyParams}):`,
        `    # Write your solution`,
        `    pass`,
        ``,
      ].join("\n");
    case "java":
      return [
        `// Java — keep class name Solution`,
        `class Solution {`,
        `    public ${javaRet} ${fn}(${javaParams || "Object... args"}) {`,
        `        // Write your solution`,
        `        ${javaDefault}`,
        `    }`,
        `}`,
        ``,
      ].join("\n");
    case "c":
      return [
        `/* C — implement ${fn} */`,
        `${cRet} ${fn}(${cParams || "int a"}) {`,
        `    /* Write your solution */`,
        `    ${cDefault}`,
        `}`,
        ``,
      ].join("\n");
    case "cpp":
      return [
        `// C++ — implement ${fn}`,
        cppIncludeLines + `using namespace std;`,
        ``,
        `${cppRet} ${fn}(${cppParams || ""}) {`,
        `    // Write your solution`,
        `    ${cppDefault}`,
        `}`,
        ``,
      ].join("\n");
    default:
      return jsStarter;
  }
}

const DRAFT_PREFIX = "pathed:coding-draft:v2:";
const HISTORY_PREFIX = "pathed:coding-history:v2:";

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

const FONT_KEY = "pathed:coding-font-size:v1";
export const IDE_FONT_MIN = 10;
export const IDE_FONT_MAX = 20;
export const IDE_FONT_DEFAULT = 14;
export const IDE_FONT_COMPACT_DEFAULT = 12;

export function loadIdeFontSize(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const n = Number(localStorage.getItem(FONT_KEY));
    if (Number.isFinite(n) && n >= IDE_FONT_MIN && n <= IDE_FONT_MAX) return n;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveIdeFontSize(size: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FONT_KEY, String(size));
  } catch {
    /* ignore */
  }
}

/** Format code with language-aware indentation (brace languages + Python). */
export function formatByIndent(
  code: string,
  language: CodingLanguageId = "javascript",
): string {
  const normalized = code.replace(/\r\n/g, "\n").replace(/\t/g, "  ");
  if (language === "python") return formatPythonIndent(normalized);
  return formatBraceIndent(normalized);
}

function stripLineComment(line: string, language: "c-like" | "python"): string {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const prev = line[i - 1];
    if (ch === "'" && !inDouble && prev !== "\\") inSingle = !inSingle;
    else if (ch === '"' && !inSingle && prev !== "\\") inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (language === "python" && ch === "#") return line.slice(0, i);
      if (
        language === "c-like" &&
        ch === "/" &&
        line[i + 1] === "/"
      ) {
        return line.slice(0, i);
      }
    }
  }
  return line;
}

function formatBraceIndent(code: string): string {
  const lines = code.split("\n");
  const out: string[] = [];
  let indent = 0;
  const size = 2;

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }

    const codePart = stripLineComment(trimmed, "c-like");
    const startsWithClose = /^[}\])]/.test(codePart.trimStart());
    const printIndent = startsWithClose ? Math.max(0, indent - 1) : indent;
    out.push(`${" ".repeat(printIndent * size)}${trimmed}`);

    let opens = 0;
    let closes = 0;
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i < codePart.length; i++) {
      const ch = codePart[i];
      const prev = codePart[i - 1];
      if (ch === "'" && !inDouble && prev !== "\\") inSingle = !inSingle;
      else if (ch === '"' && !inSingle && prev !== "\\") inDouble = !inDouble;
      else if (!inSingle && !inDouble) {
        if (ch === "{" || ch === "(" || ch === "[") opens += 1;
        if (ch === "}" || ch === ")" || ch === "]") closes += 1;
      }
    }
    indent = Math.max(0, indent + opens - closes);
  }

  return `${out.map((l) => l.replace(/[ \t]+$/g, "")).join("\n").trimEnd()}\n`;
}

function formatPythonIndent(code: string): string {
  const lines = code.split("\n");
  const out: string[] = [];
  let indent = 0;
  const size = 2;
  const dedentKeywords =
    /^(else|elif|except|finally|case)\b/;

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }

    if (dedentKeywords.test(trimmed) || trimmed === "else:" || trimmed.startsWith("elif ")) {
      indent = Math.max(0, indent - 1);
    }

    out.push(`${" ".repeat(indent * size)}${trimmed}`);

    const codePart = stripLineComment(trimmed, "python").trimEnd();
    if (codePart.endsWith(":")) {
      indent += 1;
    } else if (
      /^(return|pass|break|continue|raise)\b/.test(codePart) &&
      indent > 0
    ) {
      // keep indent; next block may dedent via keywords
    }
  }

  return `${out.map((l) => l.replace(/[ \t]+$/g, "")).join("\n").trimEnd()}\n`;
}
