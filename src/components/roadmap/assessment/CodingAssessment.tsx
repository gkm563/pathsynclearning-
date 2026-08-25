"use client";

import React, { useState } from "react";
import { Play, Send } from "lucide-react";
import type { NodeAssessment } from "@/types/roadmap";
import { runPublicTestsInBrowser } from "@/lib/roadmap/coding-client";

export default function CodingAssessment({
  assessment,
  onSubmit,
  submitting,
}: {
  assessment: NodeAssessment;
  onSubmit: (code: string) => void;
  submitting: boolean;
}) {
  const coding = assessment.coding!;
  const [code, setCode] = useState(coding.starterCode);
  const [runLog, setRunLog] = useState<string>("");

  const runPublic = () => {
    const result = runPublicTestsInBrowser(
      code,
      coding.functionName,
      coding.publicTests,
    );
    const lines = result.results.map((r) =>
      r.ok
        ? `✓ Public test #${r.index + 1} passed`
        : `✗ Public test #${r.index + 1} failed${r.error ? `: ${r.error}` : ""}`,
    );
    lines.push(
      `Score on public tests: ${result.passedCount}/${result.total} (${result.score}%)`,
    );
    setRunLog(lines.join("\n"));
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.2fr)",
        gap: 16,
        height: "100%",
        minHeight: 480,
      }}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 12,
          padding: 20,
          overflow: "auto",
        }}
      >
        <h2 style={{ fontFamily: "Outfit", marginTop: 0 }}>Problem</h2>
        <p
          style={{
            fontFamily: "Inter",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--text-muted)",
            whiteSpace: "pre-wrap",
          }}
        >
          {coding.prompt}
        </p>
        <h3 style={{ fontFamily: "Outfit", fontSize: 15 }}>Examples</h3>
        <ul style={{ paddingLeft: 18, color: "var(--text-muted)", fontSize: 13 }}>
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
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Language: JavaScript. Hidden tests run on the server after Submit.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          style={{
            flex: 1,
            minHeight: 280,
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
            onClick={runPublic}
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
              cursor: "pointer",
            }}
          >
            <Play size={16} /> Run public tests
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => onSubmit(code)}
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
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <Send size={16} /> {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 12,
            borderRadius: 10,
            background: "var(--bg-alt)",
            border: "1px solid var(--border-light)",
            fontFamily: "Fira Code",
            fontSize: 12,
            minHeight: 80,
            whiteSpace: "pre-wrap",
            color: "var(--text-main)",
          }}
        >
          {runLog || "Public test console — Run before Submit."}
        </pre>
      </div>
    </div>
  );
}
