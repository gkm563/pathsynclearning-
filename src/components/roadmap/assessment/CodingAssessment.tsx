"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Braces,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  History,
  Maximize2,
  Minimize2,
  Play,
  RotateCcw,
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
  loadCodeHistory,
  loadDraft,
  pushCodeHistory,
  saveDraft,
  starterForLanguage,
  type CodeHistoryEntry,
} from "@/lib/roadmap/coding-languages";
import { apiSend } from "@/lib/api";
import { AddNoteButton } from "@/components/memory-lane/AddNoteButton";
import { RichStudyText } from "@/components/ai/RichStudyText";

/** LeetCode-inspired dark palette for the coding workspace */
const LC = {
  bg: "#1a1a1a",
  panel: "#262626",
  panelAlt: "#2c2c2c",
  border: "#3e3e3e",
  borderSoft: "#333333",
  text: "#eff1f6",
  muted: "#eff2f699",
  muted2: "#8a8a8a",
  accent: "#ffa116",
  green: "#2cbb5d",
  greenDim: "rgba(44,187,93,0.15)",
  red: "#ef4743",
  redDim: "rgba(239,71,67,0.12)",
  blue: "#2db4ff",
  editorBg: "#1e1e1e",
  chip: "#373737",
  chipActive: "#3e3e3e",
  inputBg: "#2a2a2a",
};

const CodeEditor = dynamic(
  () => import("@/components/roadmap/assessment/CodeEditor"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          flex: 1,
          minHeight: 200,
          background: LC.editorBg,
          color: "#9ca3af",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Outfit",
          fontSize: 13,
        }}
      >
        Loading editor…
      </div>
    ),
  },
);

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

function iconBtn(active?: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 6,
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
}) {
  const coding = assessment.coding!;
  const assessmentId = assessment.id;
  const draftKey = assessmentId ? `${nodeId}:${assessmentId}` : nodeId;
  const problemTitle = coding.title || coding.functionName;
  const difficulty = coding.difficulty || "easy";
  const statement = coding.statement || coding.prompt;
  const constraints =
    coding.constraints && coding.constraints.length
      ? coding.constraints
      : [
          "Pass all public test cases before submit",
          "Hidden tests are graded on submit",
          "Time limit applies to the full attempt",
        ];
  const [hintsOpen, setHintsOpen] = useState(false);
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
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [leftWidth, setLeftWidth] = useState(42);
  const [bottomHeight, setBottomHeight] = useState(240);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
  const dragMode = useRef<"none" | "left" | "bottom">("none");
  const rightPaneRef = useRef<HTMLElement | null>(null);

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
  };

  const restoreHistory = (entry: CodeHistoryEntry) => {
    saveDraft(draftKey, language, code);
    setLanguage(entry.language);
    setCode(entry.code);
    setHistoryOpen(false);
    setResults(null);
  };

  const runPublic = useCallback(async () => {
    setRunning(true);
    setBottomTab("result");
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
        setSummary(
          `${result.passedCount}/${result.total} testcases passed`,
        );
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
      setSummary(
        `${result.passedCount}/${result.total} testcases passed`,
      );
    } catch (err) {
      setResults(null);
      setSummary(
        err instanceof Error ? err.message : "Failed to run public tests",
      );
    } finally {
      setRunning(false);
    }
  }, [code, coding, language, nodeId, assessmentId, runSource]);

  const activeTest = coding.publicTests[activeCase];
  const activeResult = results?.find((r) => r.index === activeCase);
  const passedCount = results?.filter((r) => r.ok).length ?? 0;
  const allPassed = results && results.length > 0 && passedCount === results.length;

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        height: "100%",
        minHeight: 0,
        background: LC.bg,
        color: LC.text,
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* ── Left: Description ── */}
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
            <div
              style={{
                display: "flex",
                gap: 4,
                padding: "8px 12px",
                borderBottom: `1px solid ${LC.border}`,
                background: LC.panelAlt,
              }}
            >
              <TabChip active>Description</TabChip>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "18px 22px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 600,
                    fontFamily: "Outfit, Inter, sans-serif",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {problemTitle}
                </h2>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
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
                          ? "rgba(255,161,22,0.16)"
                          : LC.greenDim,
                    padding: "2px 10px",
                    borderRadius: 999,
                    textTransform: "capitalize",
                  }}
                >
                  {difficulty}
                </span>
              </div>

              <div style={{ color: LC.muted, marginBottom: 22 }}>
                <RichStudyText text={statement} invert />
              </div>

              {coding.examples.map((ex, i) => (
                <div key={i} style={{ marginBottom: 22 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14,
                      marginBottom: 10,
                      color: LC.text,
                    }}
                  >
                    Example {i + 1}:
                  </div>
                  <div
                    style={{
                      background: LC.inputBg,
                      borderRadius: 8,
                      padding: "12px 14px",
                      fontFamily: "'Fira Code', Consolas, monospace",
                      fontSize: 13,
                      lineHeight: 1.65,
                      border: `1px solid ${LC.borderSoft}`,
                    }}
                  >
                    <div>
                      <span style={{ color: LC.muted2, fontWeight: 600 }}>Input: </span>
                      <span style={{ color: LC.text }}>{ex.input}</span>
                    </div>
                    <div>
                      <span style={{ color: LC.muted2, fontWeight: 600 }}>Output: </span>
                      <span style={{ color: LC.text }}>{ex.output}</span>
                    </div>
                    {ex.explanation ? (
                      <div style={{ marginTop: 8, color: LC.muted, fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.6 }}>
                        <span style={{ color: LC.muted2, fontWeight: 600 }}>Explanation: </span>
                        {ex.explanation}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                  Constraints:
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: LC.muted,
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  {constraints.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>

              {coding.followUp ? (
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                    Follow-up:
                  </div>
                  <p style={{ margin: 0, color: LC.muted, fontSize: 13, lineHeight: 1.7 }}>
                    {coding.followUp}
                  </p>
                </div>
              ) : null}

              {coding.hints && coding.hints.length > 0 ? (
                <div style={{ marginTop: 22 }}>
                  <button
                    type="button"
                    onClick={() => setHintsOpen((v) => !v)}
                    style={{
                      background: "none",
                      border: "none",
                      color: LC.blue,
                      fontWeight: 700,
                      fontSize: 14,
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    {hintsOpen ? "Hide hints" : `Show ${coding.hints.length} hint${coding.hints.length === 1 ? "" : "s"}`}
                  </button>
                  {hintsOpen
                    ? coding.hints.map((h, i) => (
                        <p key={i} style={{ margin: "10px 0 0", color: LC.muted, fontSize: 13, lineHeight: 1.7 }}>
                          Hint {i + 1}: {h}
                        </p>
                      ))
                    : null}
                </div>
              ) : null}
            </div>
          </aside>

          {/* Resize handle */}
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

      {/* ── Right: Code + Testcase ── */}
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
        {/* Editor chrome */}
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
            <div style={{ position: "relative" }}>
              <select
                value={language}
                onChange={(e) =>
                  switchLanguage(e.target.value as CodingLanguageId)
                }
                style={{
                  appearance: "none",
                  padding: "6px 28px 6px 10px",
                  borderRadius: 6,
                  border: `1px solid ${LC.border}`,
                  background: LC.panel,
                  color: LC.text,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {CODING_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: LC.muted2,
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: LC.muted2 }}>
              {langMeta.version}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <AddNoteButton
              variant="ide"
              sourceType={
                runSource === "challenge" ? "coding_session" : "roadmap_node"
              }
              sourceId={nodeId}
              defaultTitle={
                noteTitle
                  ? `${noteTitle} — coding notes`
                  : "Coding IDE notes"
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
              {editorExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
          </div>
        </div>

        {historyOpen && (
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
        )}

        {/* Monaco */}
        <div style={{ flex: 1, minHeight: 120, display: "flex", flexDirection: "column" }}>
          <CodeEditor
            value={code}
            language={language}
            onChange={setCode}
            onSave={handleSave}
            onFormat={() => void handleFormat()}
            onCursorChange={setCursor}
            variant="leetcode"
            minHeight={120}
          />
        </div>

        {/* Status strip */}
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

        {/* Vertical resize handle for testcase panel */}
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

        {/* Bottom: Testcase / Result */}
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
                {bottomCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button
                type="button"
                onClick={() => void runPublic()}
                disabled={running}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: `1px solid ${LC.border}`,
                  background: LC.chip,
                  color: LC.text,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: running ? "not-allowed" : "pointer",
                  opacity: running ? 0.7 : 1,
                }}
              >
                <Play size={14} fill="currentColor" />
                {running ? "Running…" : "Run"}
              </button>
              <button
                type="button"
                disabled={submitting || running}
                onClick={() => {
                  void (async () => {
                    pushCodeHistory(draftKey, language, code);
                    setBottomTab("result");
                    setSummary("Submitting…");
                    try {
                      const maybe = await Promise.resolve(
                        onSubmit({ code, language }),
                      );
                      if (
                        maybe &&
                        typeof maybe === "object" &&
                        Array.isArray(maybe.results)
                      ) {
                        setResults(maybe.results);
                        setSummary(
                          `${maybe.passedCount}/${maybe.total} testcases passed · score ${maybe.score}%`,
                        );
                      }
                    } catch (err) {
                      setSummary(
                        err instanceof Error
                          ? err.message
                          : "Submit failed",
                      );
                    }
                  })();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: LC.green,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: submitting || running ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                <CloudUpload size={14} />
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>

          {!bottomCollapsed && (
          <div style={{ flex: 1, overflow: "auto", padding: "12px 14px" }}>
            {/* Case pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {coding.publicTests.map((_, i) => {
                const r = results?.find((x) => x.index === i);
                const selected = activeCase === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveCase(i)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "none",
                      background: selected ? LC.chipActive : LC.chip,
                      color: LC.text,
                      fontSize: 13,
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
                        fontSize: 13,
                        color: LC.muted2,
                        marginBottom: 6,
                        fontFamily: "'Fira Code', monospace",
                      }}
                    >
                      {paramNames[i] || `arg${i + 1}`} =
                    </div>
                    <div
                      style={{
                        background: LC.inputBg,
                        border: `1px solid ${LC.border}`,
                        borderRadius: 8,
                        padding: "10px 12px",
                        fontFamily: "'Fira Code', monospace",
                        fontSize: 13,
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
                      fontSize: 13,
                      color: LC.muted2,
                      marginBottom: 6,
                      fontFamily: "'Fira Code', monospace",
                    }}
                  >
                    expected =
                  </div>
                  <div
                    style={{
                      background: LC.inputBg,
                      border: `1px solid ${LC.border}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 13,
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
                        fontSize: 15,
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
                      <span style={{ color: LC.muted2, fontWeight: 500, fontSize: 13 }}>
                        · {passedCount}/{results.length} passed
                      </span>
                    </div>

                    {activeResult && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <ResultBlock label="Input" value={JSON.stringify(activeTest?.args)} />
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
                              fontFamily: "'Fira Code', monospace",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {formatDiff(activeResult.expected, activeResult.actual)}
                          </pre>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          )}
        </div>
      </section>
    </div>
  );
}

function TabChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 12px",
        borderRadius: 6,
        border: "none",
        background: active ? LC.chipActive : "transparent",
        color: active ? LC.text : LC.muted2,
        fontWeight: 600,
        fontSize: 13,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {children}
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
          fontFamily: "'Fira Code', monospace",
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
