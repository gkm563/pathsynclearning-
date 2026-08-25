"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { History, Play, Send, Sparkles, Save } from "lucide-react";
import type { NodeAssessment } from "@/types/roadmap";
import {
  formatDiff,
  runPublicTestsInBrowser,
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

async function formatWithPrettier(code: string): Promise<string> {
  const prettier = await import("prettier/standalone");
  const babel = await import("prettier/plugins/babel");
  const estree = await import("prettier/plugins/estree");
  return prettier.format(code, {
    parser: "babel",
    plugins: [babel, estree],
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
  });
}

export default function CodingAssessment({
  assessment,
  nodeId,
  onSubmit,
  submitting,
}: {
  assessment: NodeAssessment;
  nodeId: string;
  onSubmit: (payload: { code: string; language: CodingLanguageId }) => void;
  submitting: boolean;
}) {
  const coding = assessment.coding!;
  const [language, setLanguage] = useState<CodingLanguageId>("javascript");
  const [code, setCode] = useState(() => {
    const saved = loadDraft(nodeId, "javascript");
    return saved ?? coding.starterCode;
  });
  const [results, setResults] = useState<CodingTestResult[] | null>(null);
  const [summary, setSummary] = useState("");
  const [formatting, setFormatting] = useState(false);
  const [running, setRunning] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<CodeHistoryEntry[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);

  const langMeta = useMemo(() => getLanguageOption(language), [language]);

  // Autosave draft
  useEffect(() => {
    const t = setTimeout(() => saveDraft(nodeId, language, code), 400);
    return () => clearTimeout(t);
  }, [code, language, nodeId]);

  useEffect(() => {
    setHistory(loadCodeHistory(nodeId));
  }, [nodeId, historyOpen]);

  const switchLanguage = (next: CodingLanguageId) => {
    if (next === language) return;
    saveDraft(nodeId, language, code);
    pushCodeHistory(nodeId, language, code);
    const draft = loadDraft(nodeId, next);
    setLanguage(next);
    setCode(draft ?? starterForLanguage(next, coding.functionName, coding.starterCode));
    setResults(null);
    setSummary("");
  };

  const handleFormat = async () => {
    setFormatting(true);
    try {
      if (langMeta.formatSupport === "prettier") {
        const formatted = await formatWithPrettier(code);
        setCode(formatted);
      } else if (langMeta.formatSupport === "indent") {
        setCode(formatByIndent(code));
      }
    } catch (err) {
      setSummary(
        `Format failed: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    } finally {
      setFormatting(false);
    }
  };

  const handleSave = () => {
    saveDraft(nodeId, language, code);
    pushCodeHistory(nodeId, language, code);
    setHistory(loadCodeHistory(nodeId));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1200);
  };

  const restoreHistory = (entry: CodeHistoryEntry) => {
    saveDraft(nodeId, language, code);
    setLanguage(entry.language);
    setCode(entry.code);
    setHistoryOpen(false);
    setResults(null);
  };

  const runPublic = useCallback(async () => {
    setRunning(true);
    setSummary("Running public tests…");
    try {
      if (language === "javascript") {
        const result = runPublicTestsInBrowser(
          code,
          coding.functionName,
          coding.publicTests,
        );
        setResults(result.results);
        setSummary(
          `Public tests: ${result.passedCount}/${result.total} passed (${result.score}%)`,
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
        code,
        language,
      });
      setResults(result.results || []);
      setSummary(
        `Public tests (${langMeta.label}): ${result.passedCount}/${result.total} passed (${result.score}%)`,
      );
    } catch (err) {
      setResults(null);
      setSummary(
        err instanceof Error ? err.message : "Failed to run public tests",
      );
    } finally {
      setRunning(false);
    }
  }, [code, coding, language, langMeta.label, nodeId]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(260px, 0.95fr) minmax(340px, 1.25fr)",
        gap: 16,
        height: "100%",
        minHeight: 480,
      }}
    >
      {/* Problem + test cases */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 12,
          padding: 20,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h2 style={{ fontFamily: "Outfit", margin: 0 }}>Problem</h2>
        <p
          style={{
            fontFamily: "Inter",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--text-muted)",
            whiteSpace: "pre-wrap",
            margin: 0,
          }}
        >
          {coding.prompt}
        </p>

        <h3 style={{ fontFamily: "Outfit", fontSize: 15, margin: "8px 0 0" }}>
          Examples
        </h3>
        <ul style={{ paddingLeft: 18, color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
          {coding.examples.map((ex, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <code style={{ fontFamily: "Fira Code" }}>
                Input: {ex.input}
                <br />
                Output: {ex.output}
              </code>
            </li>
          ))}
        </ul>

        <h3 style={{ fontFamily: "Outfit", fontSize: 15, margin: "8px 0 0" }}>
          Public test cases
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {coding.publicTests.map((t, i) => {
            const r = results?.find((x) => x.index === i);
            return (
              <div
                key={i}
                style={{
                  borderRadius: 10,
                  border: `1px solid ${
                    r ? (r.ok ? "#059669" : "#ef4444") : "var(--border-light)"
                  }`,
                  background: r
                    ? r.ok
                      ? "rgba(5,150,105,0.08)"
                      : "rgba(239,68,68,0.08)"
                    : "var(--bg-alt)",
                  padding: 12,
                  fontFamily: "Fira Code",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    fontFamily: "Outfit",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  <span>Case #{i + 1}</span>
                  <span style={{ color: r ? (r.ok ? "#059669" : "#ef4444") : "var(--text-muted)" }}>
                    {r ? (r.ok ? "Passed" : "Failed") : "Not run"}
                  </span>
                </div>
                <div style={{ color: "var(--text-muted)" }}>
                  Input: {JSON.stringify(t.args)}
                </div>
                <div style={{ color: "var(--text-muted)", marginTop: 4 }}>
                  Expected: {JSON.stringify(t.expected)}
                </div>
                {r && !r.ok && (
                  <pre
                    style={{
                      margin: "8px 0 0",
                      padding: 8,
                      borderRadius: 8,
                      background: "rgba(0,0,0,0.04)",
                      whiteSpace: "pre-wrap",
                      color: "#b91c1c",
                      fontSize: 11,
                    }}
                  >
                    {r.error
                      ? `Error: ${r.error}`
                      : formatDiff(r.expected, r.actual)}
                  </pre>
                )}
                {r?.ok && r.actual !== undefined && (
                  <div style={{ marginTop: 4, color: "#059669" }}>
                    Got: {JSON.stringify(r.actual)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* IDE */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <label style={{ fontFamily: "Outfit", fontSize: 13, fontWeight: 600 }}>
            Language
            <select
              value={language}
              onChange={(e) => switchLanguage(e.target.value as CodingLanguageId)}
              style={{
                marginLeft: 8,
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid var(--border-light)",
                background: "var(--bg-card)",
                color: "var(--text-main)",
                fontFamily: "Inter",
                fontSize: 13,
              }}
            >
              {CODING_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label} · {l.version}
                </option>
              ))}
            </select>
          </label>

          <span
            style={{
              fontSize: 11,
              fontFamily: "Fira Code",
              color: "var(--text-muted)",
              padding: "4px 8px",
              borderRadius: 6,
              background: "var(--bg-alt)",
            }}
          >
            {langMeta.ext} · {langMeta.version}
            {langMeta.executable ? " · runnable" : " · draft"}
          </span>

          <button
            type="button"
            onClick={() => void handleFormat()}
            disabled={formatting || langMeta.formatSupport === "none"}
            title={
              langMeta.formatSupport === "prettier"
                ? "Format with Prettier"
                : "Normalize indentation"
            }
            style={toolBtn}
          >
            <Sparkles size={14} />
            {formatting ? "Formatting…" : langMeta.formatSupport === "prettier" ? "Prettier" : "Format"}
          </button>

          <button type="button" onClick={handleSave} style={toolBtn}>
            <Save size={14} />
            {savedFlash ? "Saved" : "Save"}
          </button>

          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            style={toolBtn}
          >
            <History size={14} /> Previous
          </button>
        </div>

        {historyOpen && (
          <div
            style={{
              border: "1px solid var(--border-light)",
              borderRadius: 10,
              background: "var(--bg-card)",
              maxHeight: 140,
              overflow: "auto",
              padding: 8,
            }}
          >
            {history.length === 0 ? (
              <p style={{ margin: 8, fontSize: 12, color: "var(--text-muted)" }}>
                No saved versions yet. Click Save or switch language to keep history.
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
                    borderRadius: 8,
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "Inter",
                    fontSize: 12,
                    color: "var(--text-main)",
                  }}
                >
                  <strong style={{ fontFamily: "Outfit" }}>
                    {getLanguageOption(h.language).label}
                  </strong>{" "}
                  · {new Date(h.updatedAt).toLocaleString()} ·{" "}
                  {h.code.split("\n").length} lines
                </button>
              ))
            )}
          </div>
        )}

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          style={{
            flex: 1,
            minHeight: 260,
            fontFamily: "'Fira Code', monospace",
            fontSize: 13,
            lineHeight: 1.5,
            padding: 16,
            borderRadius: 12,
            border: "1px solid var(--border-light)",
            background: "#0f1117",
            color: "#e6e6e6",
            resize: "vertical",
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => void runPublic()}
            disabled={running}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 12,
              borderRadius: 10,
              border: "1px solid var(--border-light)",
              background: "var(--bg-alt)",
              color: "var(--text-main)",
              fontFamily: "Outfit",
              fontWeight: 700,
              cursor: running ? "not-allowed" : "pointer",
              opacity: running ? 0.7 : 1,
            }}
          >
            <Play size={16} /> {running ? "Running…" : "Run public tests"}
          </button>
          <button
            type="button"
            disabled={submitting || running}
            title="Submit for grading"
            onClick={() => {
              pushCodeHistory(nodeId, language, code);
              onSubmit({ code, language });
            }}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: 12,
              borderRadius: 10,
              border: "none",
              background: "#00c9a7",
              color: "#fff",
              fontFamily: "Outfit",
              fontWeight: 700,
              cursor: submitting || running ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <Send size={16} /> {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>

        {summary && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--bg-alt)",
              border: "1px solid var(--border-light)",
              fontFamily: "Outfit",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {summary}
          </div>
        )}
      </div>
    </div>
  );
}

const toolBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--border-light)",
  background: "var(--bg-card)",
  color: "var(--text-main)",
  fontFamily: "Outfit",
  fontWeight: 600,
  fontSize: 12,
  cursor: "pointer",
};
