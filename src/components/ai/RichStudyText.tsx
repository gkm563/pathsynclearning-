"use client";

import React from "react";

const INLINE_TOKEN =
  /```[\s\S]*?```|`[^`\n]+`|\*\*[^*\n]+?\*\*|__[^_\n]+?__|==[^=\n]+==|\*[^*\n]+?\*/g;

export function normalizeStudyText(text: string) {
  let t = text.replace(/\r\n/g, "\n").replace(/\\n/g, "\n").replace(/\\t/g, "  ");
  t = t.replace(/([.!?])\s+(?=\d+\.\s)/g, "$1\n");
  t = t.replace(/([^\n])\s+(?=[-•]\s)/g, "$1\n");
  t = t.replace(/\n{3,}/g, "\n\n");
  return t.trim();
}

function StudyInline({ text, invert }: { text: string; invert?: boolean }) {
  const src = text.replace(/\r\n/g, "\n");
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of src.matchAll(INLINE_TOKEN)) {
    const idx = match.index ?? 0;
    if (idx > last) nodes.push(src.slice(last, idx));
    const token = match[0];
    if (token.startsWith("```")) {
      const inner = token.replace(/^```[a-zA-Z0-9_-]*\n?/, "").replace(/```$/, "");
      nodes.push(
        <pre key={key++} className="study-pre">
          {inner}
        </pre>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key++} className="study-code">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**") || token.startsWith("__")) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("==")) {
      nodes.push(
        <mark key={key++} className={invert ? "study-mark-invert" : "study-mark"}>
          {token.slice(2, -2)}
        </mark>,
      );
    } else {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    last = idx + token.length;
  }
  if (last < src.length) nodes.push(src.slice(last));
  return <>{nodes}</>;
}

export function RichStudyText({
  text,
  invert = false,
  compact = false,
}: {
  text: string;
  invert?: boolean;
  compact?: boolean;
}) {
  const blocks = normalizeStudyText(text).split(/\n\n+/).filter(Boolean);
  return (
    <div
      className={
        invert
          ? "study-rich study-rich-invert"
          : compact
            ? "study-rich study-rich-compact"
            : "study-rich"
      }
    >
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.trim().length > 0);
        const listish =
          lines.length > 1 &&
          lines.filter((l) => /^\s*(\d+\.|[-•])\s+/.test(l)).length >=
            Math.ceil(lines.length * 0.6);
        if (listish) {
          return (
            <ul key={i} className="study-list">
              {lines.map((line, j) => (
                <li key={j}>
                  <StudyInline
                    text={line.replace(/^\s*(\d+\.|[-•])\s+/, "")}
                    invert={invert}
                  />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((line, j) => (
              <React.Fragment key={j}>
                {j > 0 ? <br /> : null}
                <StudyInline text={line} invert={invert} />
              </React.Fragment>
            ))}
          </p>
        );
      })}
      <style>{`
        .study-rich { font-family: Inter, sans-serif; font-size: 14px; line-height: 1.7; color: inherit; }
        .study-rich-compact {
          max-height: 6.8em;
          overflow: hidden;
          mask-image: linear-gradient(180deg, #000 70%, transparent);
        }
        .study-rich p { margin: 0 0 0.75em; }
        .study-rich p:last-child { margin-bottom: 0; }
        .study-rich strong { font-weight: 800; }
        .study-rich em { font-style: italic; }
        .study-list {
          margin: 0 0 0.7em;
          padding-left: 1.15em;
        }
        .study-list:last-child { margin-bottom: 0; }
        .study-list li { margin: 0 0 0.35em; }
        .study-list li:last-child { margin-bottom: 0; }
        .study-code {
          font-family: "Fira Code", ui-monospace, monospace;
          font-size: 12px;
          padding: 1px 5px;
          border-radius: 5px;
          background: rgba(15, 23, 42, 0.08);
        }
        .study-rich-invert .study-code { background: rgba(255,255,255,0.22); color: #fff; }
        .study-pre {
          margin: 8px 0 0;
          padding: 8px 10px;
          border-radius: 8px;
          background: rgba(15, 23, 42, 0.08);
          font-family: "Fira Code", ui-monospace, monospace;
          font-size: 12px;
          white-space: pre-wrap;
        }
        .study-rich-invert .study-pre { background: rgba(255,255,255,0.16); color: #fff; }
        .study-mark {
          background: #fde68a;
          color: #1e293b;
          padding: 0 4px;
          border-radius: 4px;
          font-weight: 700;
        }
        .study-mark-invert {
          background: rgba(253, 230, 138, 0.95);
          color: #1e293b;
          padding: 0 4px;
          border-radius: 4px;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
