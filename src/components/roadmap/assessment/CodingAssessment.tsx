"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Braces,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  History,
  Maximize2,
  Minimize2,
  Minus,
  Play,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Tag,
  Terminal,
  Undo2,
  Video,
  X,
  XCircle,
} from "lucide-react";
import type { NodeAssessment } from "@/types/roadmap";
import {
  formatDiff,
  runPublicTestsInBrowser,
  type CodingGradeResult,
  type CodingTestResult,
} from "@/lib/roadmap/coding-client";
import {
  CODING_LANGUAGES,
  type CodingLanguageId,
  formatByIndent,
  getLanguageOption,
  IDE_FONT_COMPACT_DEFAULT,
  IDE_FONT_DEFAULT,
  IDE_FONT_MAX,
  IDE_FONT_MIN,
  loadCodeHistory,
  loadDraft,
  loadIdeFontSize,
  pushCodeHistory,
  saveDraft,
  saveIdeFontSize,
  starterForLanguage,
  type CodeHistoryEntry,
} from "@/lib/roadmap/coding-languages";
import { apiSend } from "@/lib/api";
import { AddNoteButton } from "@/components/memory-lane/AddNoteButton";
import { RichStudyText } from "@/components/ai/RichStudyText";
import LazyCodeEditor from "@/components/roadmap/assessment/LazyCodeEditor";

/** Coding workspace chrome — same semantic tokens as the rest of PathED. */
const LC = {
  bg: "var(--bg)",
  panel: "var(--surface)",
  panelAlt: "var(--bg-elevated)",
  border: "var(--line)",
  borderSoft: "var(--line-strong)",
  text: "var(--ink)",
  muted: "var(--muted)",
  muted2: "var(--subtle)",
  accent: "var(--accent)",
  green: "var(--success)",
  greenDim: "var(--success-soft)",
  red: "var(--error)",
  redDim: "var(--error-soft)",
  blue: "var(--info)",
  primary: "var(--primary)",
  onPrimary: "var(--text-on-primary)",
  editorBg: "var(--surface)",
  chip: "var(--bg-alt)",
  chipActive: "var(--primary-soft)",
  inputBg: "var(--surface)",
};

const WIDE_MQ = "(min-width: 900px)";

type DescTab = "description" | "editorial" | "submissions";
type EditorApi = { undo: () => void; redo: () => void };

function useWideLayout() {
  const [wide, setWide] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(WIDE_MQ);
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return wide;
}

function prettyTag(s: string) {
  return s
    .split(/[-_/\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatClock(total: number) {
  const mm = String(Math.max(0, Math.floor(total / 60))).padStart(2, "0");
  const ss = String(Math.max(0, total % 60)).padStart(2, "0");
  return `${mm}:${ss}`;
}

async function formatWithPrettier(code: string): Promise<string> {
  const prettierMod = await import("prettier/standalone");
  const babelMod = await import("prettier/plugins/babel");
  const estreeMod = await import("prettier/plugins/estree");

  const prettier =
    ("format" in prettierMod
      ? prettierMod
      : (prettierMod as { default: typeof prettierMod }).default) as {
      format: (
        source: string,
        options: {
          parser: string;
          plugins: unknown[];
          semi: boolean;
          singleQuote: boolean;
          tabWidth: number;
          trailingComma: string;
        },
      ) => Promise<string>;
    };

  const babel =
    "parsers" in babelMod
      ? babelMod
      : (babelMod as { default: unknown }).default;
  const estree =
    "printers" in estreeMod || "languages" in estreeMod
      ? estreeMod
      : (estreeMod as { default: unknown }).default;

  return prettier.format(code, {
    parser: "babel",
    plugins: [babel, estree],
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
  });
}

function parseParamNames(starter: string, functionName: string): string[] {
  const re = new RegExp(
    `function\\s+${functionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\(([^)]*)\\)`,
  );
  const m = starter.match(re);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function IdeLanguageSelect({
  value,
  compact,
  onChange,
}: {
  value: CodingLanguageId;
  compact?: boolean;
  onChange: (id: CodingLanguageId) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const current = getLanguageOption(value);

  useEffect(() => {
    if (!open) {
      setMenuBox(null);
      return;
    }
    const place = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const width = Math.max(rect.width, 136);
      const left = compact
        ? Math.max(8, rect.right - width)
        : Math.min(rect.left, window.innerWidth - width - 8);
      setMenuBox({
        top: rect.bottom + 4,
        left,
        width,
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open, compact, value]);

  return (
    <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Language"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          height: compact ? 32 : 34,
          padding: compact ? "0 8px" : "0 10px",
          borderRadius: 8,
          border: compact ? "none" : `1px solid ${LC.border}`,
          background: compact ? "transparent" : LC.panel,
          color: LC.text,
          fontSize: compact ? 13 : 14,
          fontWeight: 600,
          lineHeight: 1,
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
      >
        {current.label}
        <ChevronDown
          size={14}
          aria-hidden
          style={{ flexShrink: 0, color: LC.muted2, maxWidth: "none" }}
        />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close language menu"
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 7,
              border: "none",
              background: "transparent",
              cursor: "default",
            }}
          />
          <div
            role="listbox"
            aria-label="Language"
            style={{
              position: "fixed",
              top: menuBox?.top ?? 0,
              left: menuBox?.left ?? 0,
              width: menuBox?.width ?? 136,
              zIndex: 8,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              boxSizing: "border-box",
              padding: 4,
              borderRadius: 10,
              border: `1px solid ${LC.border}`,
              background: LC.panel,
              boxShadow: "var(--shadow-lg)",
              color: LC.text,
              visibility: menuBox ? "visible" : "hidden",
            }}
          >
            {CODING_LANGUAGES.map((lang) => {
              const selected = lang.id === value;
              return (
                <button
                  key={lang.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(lang.id);
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    boxSizing: "border-box",
                    width: "100%",
                    minHeight: 34,
                    margin: 0,
                    padding: "0 10px",
                    border: "none",
                    borderRadius: 8,
                    background: selected ? LC.chipActive : "transparent",
                    color: LC.text,
                    fontSize: 13,
                    fontWeight: selected ? 650 : 500,
                    lineHeight: 1.2,
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

function iconBtn(active?: boolean, size = 36): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size,
    height: size,
    borderRadius: 8,
    border: "none",
    background: active ? LC.chipActive : "transparent",
    color: LC.muted,
    cursor: "pointer",
  };
}

export default function CodingAssessment({
  assessment,
  nodeId,
  onSubmit,
  submitting,
  runSource = "roadmap",
  noteTitle,
  secondsLeft,
  onClose,
}: {
  assessment: NodeAssessment;
  nodeId: string;
  onSubmit: (payload: {
    code: string;
    language: CodingLanguageId;
  }) =>
    | void
    | Promise<void>
    | Promise<CodingGradeResult | void>
    | CodingGradeResult;
  submitting: boolean;
  /** Use challenges judge API instead of roadmap node assessment run */
  runSource?: "roadmap" | "challenge";
  /** Optional display title for Notes context */
  noteTitle?: string;
  secondsLeft?: number;
  onClose?: () => void;
}) {
  const coding = assessment.coding!;
  const assessmentId = assessment.id;
  const draftKey = assessmentId ? `${nodeId}:${assessmentId}` : nodeId;
  const problemTitle = coding.title || noteTitle || coding.functionName;
  const difficulty = coding.difficulty || "easy";
  const statement = coding.statement || coding.prompt;
  const topics = coding.topics || [];
  const companies = coding.companies || [];
  const constraints =
    coding.constraints && coding.constraints.length
      ? coding.constraints
      : [
          "Pass all public test cases before submit",
          "Hidden tests are graded on submit",
          "Time limit applies to the full attempt",
        ];
  const wide = useWideLayout();
  const isWide = wide === true;
  const dense = !isWide;
  const [mobileView, setMobileView] = useState<"description" | "code">(
    "description",
  );
  const [descTab, setDescTab] = useState<DescTab>("description");
  const [hintsOpen, setHintsOpen] = useState(false);
  const [openMeta, setOpenMeta] = useState<null | "topics" | "companies">(null);
  const [language, setLanguage] = useState<CodingLanguageId>("javascript");
  const [code, setCode] = useState(() => {
    const saved = loadDraft(draftKey, "javascript");
    return saved ?? coding.starterCode;
  });
  const [results, setResults] = useState<CodingTestResult[] | null>(null);
  const [summary, setSummary] = useState("");
  const [formatting, setFormatting] = useState(false);
  const [running, setRunning] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<CodeHistoryEntry[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);
  const [bottomTab, setBottomTab] = useState<"testcase" | "result">("testcase");
  const [activeCase, setActiveCase] = useState(0);
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [fontSize, setFontSize] = useState(IDE_FONT_DEFAULT);
  const [leftWidth, setLeftWidth] = useState(42);
  const [bottomHeight, setBottomHeight] = useState(240);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
  const dragMode = useRef<"none" | "left" | "bottom">("none");
  const rightPaneRef = useRef<HTMLElement | null>(null);
  const editorApiRef = useRef<EditorApi | null>(null);

  const langMeta = useMemo(() => getLanguageOption(language), [language]);
  const paramNames = useMemo(
    () => parseParamNames(coding.starterCode, coding.functionName),
    [coding.starterCode, coding.functionName],
  );

  const starterSnapshot = useMemo(
    () =>
      starterForLanguage(
        language,
        coding.functionName,
        coding.starterCode,
        coding.publicTests[0],
      ),
    [language, coding.functionName, coding.starterCode, coding.publicTests],
  );

  useEffect(() => {
    const t = setTimeout(() => {
      saveDraft(draftKey, language, code);
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 900);
    }, 500);
    return () => clearTimeout(t);
  }, [code, language, draftKey]);

  useEffect(() => {
    setHistory(loadCodeHistory(draftKey));
  }, [draftKey, historyOpen]);

  const fontInitRef = useRef(false);
  useEffect(() => {
    if (wide === null || fontInitRef.current) return;
    fontInitRef.current = true;
    setFontSize(
      loadIdeFontSize() ??
        (dense ? IDE_FONT_COMPACT_DEFAULT : IDE_FONT_DEFAULT),
    );
  }, [wide, dense]);

  const bumpFont = (delta: number) => {
    setFontSize((n) => {
      const next = Math.min(IDE_FONT_MAX, Math.max(IDE_FONT_MIN, n + delta));
      saveIdeFontSize(next);
      return next;
    });
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragMode.current === "left") {
        const pct = (e.clientX / window.innerWidth) * 100;
        setLeftWidth(Math.min(60, Math.max(28, pct)));
        return;
      }
      if (dragMode.current === "bottom") {
        const pane = rightPaneRef.current;
        if (!pane) return;
        const rect = pane.getBoundingClientRect();
        const fromBottom = rect.bottom - e.clientY;
        const maxH = Math.max(180, rect.height - 160);
        setBottomCollapsed(false);
        setBottomHeight(Math.min(maxH, Math.max(120, fromBottom)));
      }
    };
    const onUp = () => {
      if (dragMode.current === "none") return;
      dragMode.current = "none";
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  const switchLanguage = (next: CodingLanguageId) => {
    if (next === language) return;
    saveDraft(draftKey, language, code);
    pushCodeHistory(draftKey, language, code);
    const draft = loadDraft(draftKey, next);
    setLanguage(next);
    setCode(
      draft ??
        starterForLanguage(
          next,
          coding.functionName,
          coding.starterCode,
          coding.publicTests[0],
        ),
    );
    setResults(null);
    setSummary("");
    setBottomTab("testcase");
  };

  const handleFormat = async () => {
    setFormatting(true);
    setSettingsOpen(false);
    try {
      let formatted: string;
      if (langMeta.formatSupport === "prettier") {
        try {
          formatted = await formatWithPrettier(code);
        } catch {
          formatted = formatByIndent(code, language);
        }
      } else {
        formatted = formatByIndent(code, language);
      }
      setCode(formatted);
      setSummary(
        formatted.replace(/\r\n/g, "\n") === code.replace(/\r\n/g, "\n")
          ? "Already formatted"
          : "Formatted",
      );
    } catch (err) {
      setSummary(
        `Format failed: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    } finally {
      setFormatting(false);
    }
  };

  const handleSave = () => {
    saveDraft(draftKey, language, code);
    pushCodeHistory(draftKey, language, code);
    setHistory(loadCodeHistory(draftKey));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1200);
  };

  const resetCode = () => {
    setCode(starterSnapshot);
    setResults(null);
    setSummary("Reset to starter");
    setBottomTab("testcase");
    setSettingsOpen(false);
  };

  const restoreHistory = (entry: CodeHistoryEntry) => {
    saveDraft(draftKey, language, code);
    setLanguage(entry.language);
    setCode(entry.code);
    setHistoryOpen(false);
    setResults(null);
    setDescTab("description");
  };

  const runPublic = useCallback(async () => {
    setRunning(true);
    setBottomTab("result");
    setConsoleOpen(true);
    setSummary("Running…");
    try {
      if (runSource === "challenge") {
        const result = await apiSend<CodingGradeResult>(
          "/api/me/challenges/run",
          "POST",
          {
            questionId: nodeId,
            code,
            language,
            mode: "public",
          },
        );
        setResults(result.results || []);
        setSummary(`${result.passedCount}/${result.total} testcases passed`);
        return;
      }

      if (language === "javascript") {
        const result = runPublicTestsInBrowser(
          code,
          coding.functionName,
          coding.publicTests,
        );
        setResults(result.results);
        setSummary(`${result.passedCount}/${result.total} testcases passed`);
        return;
      }

      const result = await apiSend<{
        passedCount: number;
        total: number;
        score: number;
        results: CodingTestResult[];
      }>("/api/roadmap/assessment/run", "POST", {
        nodeId,
        assessmentId,
        code,
        language,
      });
      setResults(result.results || []);
      setSummary(`${result.passedCount}/${result.total} testcases passed`);
    } catch (err) {
      setResults(null);
      setSummary(
        err instanceof Error ? err.message : "Failed to run public tests",
      );
    } finally {
      setRunning(false);
    }
  }, [code, coding, language, nodeId, assessmentId, runSource]);

  const handleSubmit = () => {
    void (async () => {
      pushCodeHistory(draftKey, language, code);
      setBottomTab("result");
      setConsoleOpen(true);
      setSummary("Submitting…");
      try {
        const maybe = await Promise.resolve(onSubmit({ code, language }));
        if (maybe && typeof maybe === "object" && Array.isArray(maybe.results)) {
          setResults(maybe.results);
          setSummary(
            `${maybe.passedCount}/${maybe.total} testcases passed · score ${maybe.score}%`,
          );
        }
      } catch (err) {
        setSummary(err instanceof Error ? err.message : "Submit failed");
      }
    })();
  };

  const activeTest = coding.publicTests[activeCase];
  const activeResult = results?.find((r) => r.index === activeCase);
  const passedCount = results?.filter((r) => r.ok).length ?? 0;
  const allPassed =
    results && results.length > 0 && passedCount === results.length;

  const descTabs = (
    <div
      style={{
        display: "flex",
        gap: 2,
        padding: dense ? "4px 8px" : "8px 12px",
        borderBottom: `1px solid ${LC.border}`,
        background: LC.panelAlt,
        overflowX: "auto",
        flexShrink: 0,
      }}
    >
      <TabChip
        compact={dense}
        active={descTab === "description"}
        onClick={() => setDescTab("description")}
      >
        Description
      </TabChip>
      <TabChip
        compact={dense}
        active={descTab === "editorial"}
        onClick={() => setDescTab("editorial")}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          Editorial
          <Video size={dense ? 11 : 13} color={LC.accent} />
        </span>
      </TabChip>
      <TabChip
        compact={dense}
        active={descTab === "submissions"}
        onClick={() => {
          setDescTab("submissions");
          setHistory(loadCodeHistory(draftKey));
        }}
      >
        Submissions
      </TabChip>
    </div>
  );

  const metaPills = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: dense ? 12 : 18,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: dense ? 11 : 12,
          fontWeight: 700,
          color:
            difficulty === "hard"
              ? LC.red
              : difficulty === "medium"
                ? LC.accent
                : LC.green,
          background:
            difficulty === "hard"
              ? LC.redDim
              : difficulty === "medium"
                ? "var(--accent-soft)"
                : LC.greenDim,
          padding: dense ? "4px 9px" : "5px 12px",
          borderRadius: 999,
          textTransform: "capitalize",
        }}
      >
        {difficulty}
      </span>
      {topics.length > 0 && (
        <button
          type="button"
          onClick={() =>
            setOpenMeta((v) => (v === "topics" ? null : "topics"))
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: dense ? "4px 9px" : "5px 12px",
            borderRadius: 999,
            border: "none",
            background: openMeta === "topics" ? LC.chipActive : LC.chip,
            color: LC.text,
            fontSize: dense ? 11 : 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Tag size={13} />
          Topics
        </button>
      )}
      {companies.length > 0 && (
        <button
          type="button"
          onClick={() =>
            setOpenMeta((v) => (v === "companies" ? null : "companies"))
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: dense ? "4px 9px" : "5px 12px",
            borderRadius: 999,
            border: "none",
            background: openMeta === "companies" ? LC.chipActive : LC.chip,
            color: LC.text,
            fontSize: dense ? 11 : 12,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <Building2 size={13} />
          Companies
        </button>
      )}
    </div>
  );

  const tagRow = (items: string[]) => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        margin: "-6px 0 18px",
      }}
    >
      {items.map((t) => (
        <span
          key={t}
          style={{
            padding: "4px 10px",
            borderRadius: 999,
            background: LC.chip,
            color: LC.muted,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {prettyTag(t)}
        </span>
      ))}
    </div>
  );

  const descriptionBody = (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        padding: isWide ? "20px 22px 28px" : "14px 16px 80px",
      }}
    >
      {descTab === "description" && (
        <>
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: isWide ? 22 : 18,
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              letterSpacing: "-0.03em",
              lineHeight: 1.25,
            }}
          >
            {problemTitle}
          </h2>
          {metaPills}
          {openMeta === "topics" ? tagRow(topics) : null}
          {openMeta === "companies" ? tagRow(companies) : null}

          <div
            style={{
              color: LC.muted,
              marginBottom: dense ? 16 : 22,
              fontSize: isWide ? 15 : 13,
              lineHeight: dense ? 1.55 : 1.7,
            }}
          >
            <RichStudyText text={statement} invert />
          </div>

          {coding.examples.map((ex, i) => (
            <div key={i} style={{ marginBottom: dense ? 16 : 22 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: isWide ? 15 : 13,
                  marginBottom: 8,
                  color: LC.text,
                }}
              >
                Example {i + 1}:
              </div>
              <div
                style={{
                  background: LC.inputBg,
                  borderRadius: 8,
                  padding: dense ? "10px 12px" : "12px 14px",
                  fontFamily: "var(--font-code), ui-monospace, monospace",
                  fontSize: isWide ? 13 : 12,
                  lineHeight: 1.6,
                  border: `1px solid ${LC.borderSoft}`,
                }}
              >
                <div>
                  <span style={{ color: LC.muted2, fontWeight: 600 }}>
                    Input:{" "}
                  </span>
                  <span style={{ color: LC.text }}>{ex.input}</span>
                </div>
                <div>
                  <span style={{ color: LC.muted2, fontWeight: 600 }}>
                    Output:{" "}
                  </span>
                  <span style={{ color: LC.text }}>{ex.output}</span>
                </div>
                {ex.explanation ? (
                  <div
                    style={{
                      marginTop: 8,
                      color: LC.muted,
                      fontSize: isWide ? 13 : 12,
                      lineHeight: 1.6,
                    }}
                  >
                    <span style={{ color: LC.muted2, fontWeight: 600 }}>
                      Explanation:{" "}
                    </span>
                    {ex.explanation}
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <div style={{ fontWeight: 700, fontSize: isWide ? 15 : 13, marginBottom: 8 }}>
              Constraints:
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: 18,
                color: LC.muted,
                fontSize: isWide ? 14 : 12.5,
                lineHeight: 1.65,
              }}
            >
              {constraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          {coding.followUp ? (
            <div style={{ marginTop: 22 }}>
              <div style={{ fontWeight: 700, fontSize: isWide ? 15 : 13, marginBottom: 8 }}>
                Follow-up:
              </div>
              <p
                style={{
                  margin: 0,
                  color: LC.muted,
                  fontSize: isWide ? 14 : 12.5,
                  lineHeight: 1.65,
                }}
              >
                {coding.followUp}
              </p>
            </div>
          ) : null}
        </>
      )}

      {descTab === "editorial" && (
        <div>
          <h3
            style={{
              margin: "0 0 10px",
              fontSize: isWide ? 18 : 16,
              fontWeight: 700,
            }}
          >
            Editorial
          </h3>
          {coding.editorial ? (
            <p
              style={{
                margin: "0 0 16px",
                color: LC.muted,
                fontSize: isWide ? 14 : 13,
                lineHeight: 1.6,
              }}
            >
              {coding.editorial}
            </p>
          ) : (
            <p style={{ color: LC.muted2, fontSize: isWide ? 14 : 13, lineHeight: 1.6 }}>
              Walk through the hints below, then submit a passing solution to
              unlock a fuller write-up where available.
            </p>
          )}
          {coding.hints && coding.hints.length > 0 ? (
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setHintsOpen((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  color: LC.blue,
                  fontWeight: 700,
                  fontSize: isWide ? 14 : 13,
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                {hintsOpen
                  ? "Hide hints"
                  : `Show ${coding.hints.length} hint${coding.hints.length === 1 ? "" : "s"}`}
              </button>
              {hintsOpen
                ? coding.hints.map((h, i) => (
                    <p
                      key={i}
                      style={{
                        margin: "10px 0 0",
                        color: LC.muted,
                        fontSize: isWide ? 14 : 13,
                        lineHeight: 1.6,
                      }}
                    >
                      Hint {i + 1}: {h}
                    </p>
                  ))
                : null}
            </div>
          ) : null}
        </div>
      )}

      {descTab === "submissions" && (
        <div>
          <h3
            style={{
              margin: "0 0 10px",
              fontSize: isWide ? 18 : 16,
              fontWeight: 700,
            }}
          >
            Submissions
          </h3>
          {history.length === 0 ? (
            <p style={{ margin: 0, fontSize: isWide ? 14 : 13, color: LC.muted2 }}>
              No saved versions yet. Run or submit to keep a snapshot here.
            </p>
          ) : (
            history.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => restoreHistory(h)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 12px",
                  marginBottom: 8,
                  border: `1px solid ${LC.borderSoft}`,
                  borderRadius: 10,
                  background: LC.chip,
                  cursor: "pointer",
                  fontSize: 13,
                  color: LC.muted,
                }}
              >
                <strong style={{ color: LC.text }}>
                  {getLanguageOption(h.language).label}
                </strong>{" "}
                · {new Date(h.updatedAt).toLocaleString()} ·{" "}
                {h.code.split("\n").length} lines
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  const languageSelect = (compact?: boolean) => (
    <IdeLanguageSelect
      value={language}
      compact={compact}
      onChange={switchLanguage}
    />
  );

  const historyList = historyOpen && (
    <div
      style={{
        maxHeight: 130,
        overflow: "auto",
        background: LC.panel,
        borderBottom: `1px solid ${LC.border}`,
        padding: 8,
        flexShrink: 0,
      }}
    >
      {history.length === 0 ? (
        <p style={{ margin: 8, fontSize: 12, color: LC.muted2 }}>
          No saved versions yet.
        </p>
      ) : (
        history.map((h) => (
          <button
            key={h.id}
            type="button"
            onClick={() => restoreHistory(h)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "8px 10px",
              border: "none",
              borderRadius: 6,
              background: "transparent",
              cursor: "pointer",
              fontSize: 12,
              color: LC.muted,
            }}
          >
            <strong style={{ color: LC.text }}>
              {getLanguageOption(h.language).label}
            </strong>{" "}
            · {new Date(h.updatedAt).toLocaleString()} ·{" "}
            {h.code.split("\n").length} lines
          </button>
        ))
      )}
    </div>
  );

  const editor = (
    <div
      style={{
        flex: 1,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <LazyCodeEditor
        value={code}
        language={language}
        onChange={setCode}
        onSave={handleSave}
        onFormat={() => void handleFormat()}
        onCursorChange={setCursor}
        onReady={(api) => {
          editorApiRef.current = api;
        }}
        variant="leetcode"
        compact={dense}
        fontSize={fontSize}
        minHeight={120}
      />
    </div>
  );

  const testBody = (
    <div style={{ flex: 1, overflow: "auto", padding: dense ? "10px 12px" : "12px 14px" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        {coding.publicTests.map((_, i) => {
          const r = results?.find((x) => x.index === i);
          const selected = activeCase === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveCase(i)}
              style={{
                padding: dense ? "5px 10px" : "6px 12px",
                borderRadius: 8,
                border: "none",
                background: selected ? LC.chipActive : LC.chip,
                color: LC.text,
                fontSize: dense ? 12 : 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {r &&
                (r.ok ? (
                  <CheckCircle2 size={13} color={LC.green} />
                ) : (
                  <XCircle size={13} color={LC.red} />
                ))}
              Case {i + 1}
            </button>
          );
        })}
      </div>

      {bottomTab === "testcase" && activeTest && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {activeTest.args.map((arg, i) => (
            <div key={i}>
                    <div
                      style={{
                        fontSize: dense ? 12 : 13,
                        color: LC.muted2,
                        marginBottom: 6,
                        fontFamily: "var(--font-code), ui-monospace, monospace",
                      }}
                    >
                      {paramNames[i] || `arg${i + 1}`} =
                    </div>
                    <div
                      style={{
                        background: LC.inputBg,
                        border: `1px solid ${LC.border}`,
                        borderRadius: 8,
                        padding: dense ? "8px 10px" : "10px 12px",
                        fontFamily: "var(--font-code), ui-monospace, monospace",
                        fontSize: dense ? 12 : 13,
                        color: LC.text,
                      }}
                    >
                {JSON.stringify(arg)}
              </div>
            </div>
          ))}
          <div>
            <div
              style={{
                fontSize: dense ? 12 : 13,
                color: LC.muted2,
                marginBottom: 6,
                fontFamily: "var(--font-code), ui-monospace, monospace",
              }}
            >
              expected =
            </div>
            <div
              style={{
                background: LC.inputBg,
                border: `1px solid ${LC.border}`,
                borderRadius: 8,
                padding: dense ? "8px 10px" : "10px 12px",
                fontFamily: "var(--font-code), ui-monospace, monospace",
                fontSize: dense ? 12 : 13,
                color: LC.text,
              }}
            >
              {JSON.stringify(activeTest.expected)}
            </div>
          </div>
        </div>
      )}

      {bottomTab === "result" && (
        <div>
          {!results ? (
            <p style={{ color: LC.muted2, fontSize: 13, margin: 0 }}>
              {running
                ? "Running testcases…"
                : "Click Run to execute public testcases."}
            </p>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                        marginBottom: 14,
                        fontSize: dense ? 14 : 15,
                        fontWeight: 700,
                  color: allPassed ? LC.green : LC.red,
                }}
              >
                {allPassed ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <XCircle size={18} />
                )}
                {allPassed ? "Accepted" : "Wrong Answer"}
                <span
                  style={{
                    color: LC.muted2,
                    fontWeight: 500,
                    fontSize: 13,
                  }}
                >
                  · {passedCount}/{results.length} passed
                </span>
              </div>

              {activeResult && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <ResultBlock
                    label="Input"
                    value={JSON.stringify(activeTest?.args)}
                  />
                  <ResultBlock
                    label="Output"
                    value={
                      activeResult.error
                        ? activeResult.error
                        : JSON.stringify(activeResult.actual)
                    }
                    tone={activeResult.ok ? "ok" : "bad"}
                  />
                  <ResultBlock
                    label="Expected"
                    value={JSON.stringify(activeResult.expected)}
                  />
                  {!activeResult.ok && !activeResult.error && (
                    <pre
                      style={{
                        margin: 0,
                        padding: 10,
                        borderRadius: 8,
                        background: LC.redDim,
                        color: LC.red,
                        fontSize: 12,
                        fontFamily:
                          "var(--font-code), ui-monospace, monospace",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {formatDiff(
                        activeResult.expected,
                        activeResult.actual,
                      )}
                    </pre>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );

  const runBtn = (
    <button
      type="button"
      onClick={() => void runPublic()}
      disabled={running}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 8,
        border: `1px solid ${LC.border}`,
        background: LC.chip,
        color: LC.text,
        fontWeight: 600,
        fontSize: 13,
        cursor: running ? "not-allowed" : "pointer",
        opacity: running ? 0.7 : 1,
        minHeight: 40,
      }}
    >
      <Play size={14} fill="currentColor" />
      {running ? "Running…" : "Run"}
    </button>
  );

  const submitBtn = (
    <button
      type="button"
      disabled={submitting || running}
      onClick={handleSubmit}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 18px",
        borderRadius: 999,
        border: "none",
        background: LC.primary,
        color: LC.onPrimary,
        fontWeight: 700,
        fontSize: dense ? 13 : 14,
        cursor: submitting || running ? "not-allowed" : "pointer",
        opacity: submitting ? 0.7 : 1,
        minHeight: dense ? 36 : 40,
        minWidth: dense ? 84 : 96,
      }}
    >
      <CloudUpload size={14} />
      {submitting ? "Submitting…" : "Submit"}
    </button>
  );

  const notesButton = (compact?: boolean) => (
    <AddNoteButton
      variant="ide"
      compact={compact}
      sourceType={
        runSource === "challenge" ? "coding_session" : "roadmap_node"
      }
      sourceId={nodeId}
      defaultTitle={
        noteTitle ? `${noteTitle} — coding notes` : "Coding IDE notes"
      }
      contextLabel={
        noteTitle
          ? `${runSource === "challenge" ? "Challenge" : "Roadmap"} · ${noteTitle} · ${langMeta.label}`
          : `Coding session · ${langMeta.label}`
      }
      links={[
        {
          entityType:
            runSource === "challenge" ? "challenge" : "roadmap_node",
          entityId: nodeId,
        },
        { entityType: "coding_session", entityId: nodeId },
      ]}
      titleAttr="Notes"
    />
  );

  const rootStyle: React.CSSProperties = {
    display: "flex",
    flex: 1,
    height: "100%",
    minHeight: 0,
    background: LC.bg,
    color: LC.text,
    fontFamily: "var(--font-body)",
    overflow: "hidden",
    WebkitTextSizeAdjust: "100%",
    textSizeAdjust: "100%",
  };

  if (wide === null) {
    return <div style={rootStyle} aria-hidden />;
  }

  if (!isWide) {
    if (mobileView === "description") {
      return (
        <div style={{ ...rootStyle, flexDirection: "column", position: "relative", touchAction: "manipulation" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            padding: "6px 8px",
            flexShrink: 0,
            borderBottom: `1px solid ${LC.border}`,
            background: LC.panelAlt,
          }}
        >
            <button
              type="button"
              aria-label="Close"
              onClick={() => onClose?.()}
              style={iconBtn(false, 32)}
            >
              <X size={18} />
            </button>
            {typeof secondsLeft === "number" ? (
              <span
                style={{
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 700,
                  fontSize: 12,
                  color: secondsLeft < 60 ? LC.red : LC.muted,
                }}
              >
                {formatClock(secondsLeft)}
              </span>
            ) : (
              <span />
            )}
            {notesButton(true)}
          </div>
          {descTabs}
          {descriptionBody}
          <button
            type="button"
            aria-label="Open code editor"
            onClick={() => setMobileView("code")}
            style={{
              position: "absolute",
              right: 14,
              bottom: "calc(12px + env(safe-area-inset-bottom, 0px))",
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "none",
              background: LC.primary,
              color: "var(--text-on-primary)",
              boxShadow:
                "0 8px 20px color-mix(in srgb, var(--primary) 32%, transparent)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              zIndex: 4,
            }}
          >
            <Play size={18} fill="currentColor" />
          </button>
        </div>
      );
    }

    return (
      <div style={{ ...rootStyle, flexDirection: "column", touchAction: "manipulation" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 8px",
            flexShrink: 0,
            background: LC.panelAlt,
            borderBottom: `1px solid ${LC.border}`,
            gap: 8,
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <button
              type="button"
              aria-label="Back to description"
              onClick={() => {
                setMobileView("description");
                setConsoleOpen(false);
                setSettingsOpen(false);
              }}
              style={iconBtn(false, 32)}
            >
              <ChevronDown size={20} />
            </button>
            <button
              type="button"
              aria-label="Undo"
              onClick={() => editorApiRef.current?.undo()}
              style={iconBtn(false, 32)}
            >
              <Undo2 size={16} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {languageSelect(true)}
            {notesButton(true)}
            <button
              type="button"
              aria-label="Editor settings"
              onClick={() => setSettingsOpen((v) => !v)}
              style={iconBtn(settingsOpen, 32)}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
          {settingsOpen && (
            <>
              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setSettingsOpen(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 7,
                  border: "none",
                  background: "transparent",
                  cursor: "default",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 8,
                  zIndex: 8,
                  minWidth: 180,
                  padding: 6,
                  borderRadius: 10,
                  border: `1px solid ${LC.border}`,
                  background: LC.panel,
                  boxShadow: "var(--shadow-lg)",
                }}
              >
              <FontStepper
                size={fontSize}
                onDecrease={() => bumpFont(-1)}
                onIncrease={() => bumpFont(1)}
              />
              <SettingsRow
                icon={<Braces size={15} />}
                label={formatting ? "Formatting…" : "Format"}
                onClick={() => void handleFormat()}
              />
              <SettingsRow
                icon={<History size={15} />}
                label="History"
                onClick={() => {
                  setHistoryOpen((v) => !v);
                  setSettingsOpen(false);
                }}
              />
              <SettingsRow
                icon={<RotateCcw size={15} />}
                label="Reset to starter"
                onClick={resetCode}
              />
              <div style={{ padding: "6px 8px" }}>{notesButton()}</div>
            </div>
            </>
          )}
        </div>
        {historyList}
        {editor}
        {consoleOpen && (
          <div
            style={{
              height: "36%",
              minHeight: 148,
              maxHeight: "48%",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              background: LC.panel,
              borderTop: `1px solid ${LC.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                background: LC.panelAlt,
                borderBottom: `1px solid ${LC.border}`,
              }}
            >
              <div style={{ display: "flex", gap: 4 }}>
                <TabChip
                  compact
                  active={bottomTab === "testcase"}
                  onClick={() => setBottomTab("testcase")}
                >
                  Testcase
                </TabChip>
                <TabChip
                  compact
                  active={bottomTab === "result"}
                  onClick={() => setBottomTab("result")}
                >
                  Test Result
                </TabChip>
              </div>
              <button
                type="button"
                aria-label="Close console"
                onClick={() => setConsoleOpen(false)}
                style={iconBtn(false, 32)}
              >
                <X size={15} />
              </button>
            </div>
            {testBody}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding:
              "6px 10px calc(6px + env(safe-area-inset-bottom, 0px))",
            background: LC.panelAlt,
            borderTop: `1px solid ${LC.border}`,
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={() => {
              setConsoleOpen((v) => !v);
              if (!consoleOpen) setBottomTab(results ? "result" : "testcase");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${LC.border}`,
              background: consoleOpen ? LC.chipActive : LC.chip,
              color: LC.text,
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              minHeight: 36,
            }}
          >
            <Terminal size={14} />
            Console
          </button>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            aria-label="Reset to starter"
            onClick={resetCode}
            style={iconBtn(false, 32)}
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            aria-label={running ? "Running" : "Run"}
            onClick={() => void runPublic()}
            disabled={running}
            style={iconBtn(false, 32)}
          >
            <Play size={15} fill="currentColor" />
          </button>
          {submitBtn}
        </div>
      </div>
    );
  }

  return (
    <div style={rootStyle}>
      {!editorExpanded && (
        <>
          <aside
            style={{
              width: `${leftWidth}%`,
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              background: LC.panel,
              borderRight: `1px solid ${LC.border}`,
              minHeight: 0,
            }}
          >
            {descTabs}
            {descriptionBody}
          </aside>

          <div
            onMouseDown={() => {
              dragMode.current = "left";
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
            style={{
              width: 5,
              cursor: "col-resize",
              background: "transparent",
              flexShrink: 0,
              position: "relative",
            }}
            title="Drag to resize"
          >
            <div
              style={{
                position: "absolute",
                inset: "0 1px",
                background: LC.border,
                opacity: 0.5,
              }}
            />
          </div>
        </>
      )}

      <section
        ref={rightPaneRef}
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: LC.bg,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 10px",
            background: LC.panelAlt,
            borderBottom: `1px solid ${LC.border}`,
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <TabChip active>Code</TabChip>
            {languageSelect()}
            <span style={{ fontSize: 11, color: LC.muted2 }}>
              {langMeta.version}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {notesButton()}
            <FontStepper
              size={fontSize}
              onDecrease={() => bumpFont(-1)}
              onIncrease={() => bumpFont(1)}
              compact
            />
            <button
              type="button"
              title="Format code (Shift+Alt+F)"
              onClick={() => void handleFormat()}
              disabled={formatting}
              style={iconBtn()}
            >
              <Braces size={16} />
            </button>
            <button
              type="button"
              title="Reset to starter"
              onClick={resetCode}
              style={iconBtn()}
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              title="History"
              onClick={() => setHistoryOpen((v) => !v)}
              style={iconBtn(historyOpen)}
            >
              <History size={15} />
            </button>
            <button
              type="button"
              title={editorExpanded ? "Exit focus" : "Focus editor"}
              onClick={() => setEditorExpanded((v) => !v)}
              style={iconBtn(editorExpanded)}
            >
              {editorExpanded ? (
                <Minimize2 size={15} />
              ) : (
                <Maximize2 size={15} />
              )}
            </button>
          </div>
        </div>

        {historyList}
        {editor}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "4px 12px",
            background: LC.panelAlt,
            borderTop: `1px solid ${LC.border}`,
            fontSize: 12,
            color: LC.muted2,
            flexShrink: 0,
          }}
        >
          <span style={{ color: savedFlash ? LC.green : LC.muted2 }}>
            {savedFlash ? "Saved" : "Autosave on"}
          </span>
          <span>
            Ln {cursor.line}, Col {cursor.col}
            {summary ? ` · ${summary}` : ""}
          </span>
        </div>

        <div
          onMouseDown={(e) => {
            e.preventDefault();
            dragMode.current = "bottom";
            document.body.style.cursor = "row-resize";
            document.body.style.userSelect = "none";
          }}
          onDoubleClick={() => setBottomCollapsed((v) => !v)}
          title="Drag to resize · double-click to collapse"
          style={{
            height: 6,
            flexShrink: 0,
            cursor: "row-resize",
            background: LC.panelAlt,
            borderTop: `1px solid ${LC.border}`,
            borderBottom: `1px solid ${LC.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              width: 36,
              height: 3,
              borderRadius: 99,
              background: LC.border,
            }}
          />
        </div>

        <div
          style={{
            height: bottomCollapsed ? 44 : bottomHeight,
            minHeight: bottomCollapsed ? 44 : 120,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            background: LC.panel,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 10px",
              background: LC.panelAlt,
              borderBottom: `1px solid ${LC.border}`,
              gap: 8,
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              <TabChip
                active={bottomTab === "testcase"}
                onClick={() => setBottomTab("testcase")}
              >
                Testcase
              </TabChip>
              <TabChip
                active={bottomTab === "result"}
                onClick={() => setBottomTab("result")}
              >
                Test Result
              </TabChip>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                type="button"
                title={bottomCollapsed ? "Expand panel" : "Collapse panel"}
                onClick={() => setBottomCollapsed((v) => !v)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: "none",
                  background: "transparent",
                  color: LC.muted2,
                  cursor: "pointer",
                }}
              >
                {bottomCollapsed ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              {runBtn}
              {submitBtn}
            </div>
          </div>

          {!bottomCollapsed && testBody}
        </div>
      </section>
    </div>
  );
}

function TabChip({
  children,
  active,
  onClick,
  compact,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: compact ? "5px 10px" : "7px 12px",
        borderRadius: 8,
        border: "none",
        background: active ? LC.chipActive : "transparent",
        color: active ? LC.text : LC.muted2,
        fontWeight: 600,
        fontSize: compact ? 12 : 13,
        cursor: onClick ? "pointer" : "default",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function FontStepper({
  size,
  onDecrease,
  onIncrease,
  compact,
}: {
  size: number;
  onDecrease: () => void;
  onIncrease: () => void;
  compact?: boolean;
}) {
  const btn = (
    label: string,
    disabled: boolean,
    onClick: () => void,
    icon: React.ReactNode,
  ) => (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...iconBtn(false, compact ? 28 : 32),
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {icon}
    </button>
  );

  const controls = (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {btn(
        "Decrease font size",
        size <= IDE_FONT_MIN,
        onDecrease,
        <Minus size={14} />,
      )}
      <span
        style={{
          minWidth: 22,
          textAlign: "center",
          fontSize: 12,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          color: LC.text,
        }}
      >
        {size}
      </span>
      {btn(
        "Increase font size",
        size >= IDE_FONT_MAX,
        onIncrease,
        <Plus size={14} />,
      )}
    </div>
  );

  if (compact) return controls;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 10px",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: LC.text }}>
        Font size
      </span>
      {controls}
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        gap: 10,
        padding: "10px 10px",
        border: "none",
        borderRadius: 8,
        background: "transparent",
        color: LC.text,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span style={{ color: LC.muted }}>{icon}</span>
      {label}
    </button>
  );
}

function ResultBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "bad";
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          color: LC.muted2,
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          background: LC.inputBg,
          border: `1px solid ${
            tone === "ok" ? LC.green : tone === "bad" ? LC.red : LC.border
          }`,
          borderRadius: 8,
          padding: "10px 12px",
          fontFamily: "var(--font-code), ui-monospace, monospace",
          fontSize: 13,
          color: tone === "bad" ? LC.red : LC.text,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}
