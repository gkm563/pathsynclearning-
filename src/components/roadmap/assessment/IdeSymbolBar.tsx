"use client";

import React, { useState } from "react";

export type IdeKeyAction =
  | { type: "insert"; text: string }
  | { type: "tab" }
  | { type: "outdent" }
  | { type: "left" }
  | { type: "right" };

type IdeSymbolBarProps = {
  onAction: (action: IdeKeyAction) => void;
};

type SymbolKey =
  | { kind: "insert"; text: string; label: string }
  | { kind: "tab"; label: string }
  | { kind: "left"; label: string }
  | { kind: "right"; label: string };

type ClusterDef = {
  id: string;
  keys: SymbolKey[];
};

const CLUSTERS: ClusterDef[] = [
  {
    id: "nav",
    keys: [
      { kind: "tab", label: "⇥" },
      { kind: "left", label: "←" },
      { kind: "right", label: "→" },
    ],
  },
  {
    id: "hash",
    keys: chars("#", "$", "^", "%"),
  },
  {
    id: "meta",
    keys: chars("\\", "@", "~", "_"),
  },
  {
    id: "logic",
    keys: chars("&", "|", "?", "!"),
  },
  {
    id: "math",
    keys: chars("+", "-", "*", "/"),
  },
  {
    id: "quotes",
    keys: chars("'", '"', "`", "="),
  },
  {
    id: "brackets",
    keys: chars("{", "}", "[", "]"),
  },
  {
    id: "parens",
    keys: chars("(", ")", "<", ">"),
  },
  {
    id: "punct",
    keys: chars(".", ":", ",", ";"),
  },
];

function chars(...texts: string[]): SymbolKey[] {
  return texts.map((text) => ({ kind: "insert", text, label: text }));
}

function toAction(key: SymbolKey): IdeKeyAction {
  if (key.kind === "insert") return { type: "insert", text: key.text };
  if (key.kind === "tab") return { type: "tab" };
  if (key.kind === "left") return { type: "left" };
  return { type: "right" };
}

/**
 * Mobile IDE accessory row. Clusters start collapsed; tapping one expands
 * into large single keys (plus close). Styled with the app surface, not a
 * dark keyboard chrome.
 */
export default function IdeSymbolBar({ onAction }: IdeSymbolBarProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = CLUSTERS.find((c) => c.id === openId) ?? null;

  return (
    <div
      role="toolbar"
      aria-label="Code symbols"
      style={barStyle}
    >
      {open ? (
        <>
          {open.keys.map((key) => (
            <Pad
              key={key.label}
              label={key.label}
              onAction={() => onAction(toAction(key))}
            >
              {key.kind === "tab" ? <TabGlyph /> : key.label}
            </Pad>
          ))}
          <Pad label="Close symbol pad" onAction={() => setOpenId(null)}>
            ×
          </Pad>
        </>
      ) : (
        CLUSTERS.map((cluster) => (
          <button
            key={cluster.id}
            type="button"
            tabIndex={-1}
            aria-label={`Expand ${cluster.keys.map((k) => k.label).join(" ")}`}
            aria-expanded={false}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setOpenId(cluster.id);
            }}
            style={clusterStyle}
            className="active:bg-sunken"
          >
            {cluster.keys.map((key) => (
              <span key={key.label} style={previewStyle}>
                {key.kind === "tab" ? <TabGlyph /> : key.label}
              </span>
            ))}
          </button>
        ))
      )}
    </div>
  );
}

function Pad({
  label,
  onAction,
  children,
}: {
  label: string;
  onAction: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onAction();
      }}
      style={padStyle}
      className="active:bg-sunken"
    >
      {children}
    </button>
  );
}

const barStyle: React.CSSProperties = {
  flexShrink: 0,
  display: "flex",
  alignItems: "stretch",
  gap: 6,
  padding: "6px 8px 7px",
  background: "var(--bg-alt)",
  color: "var(--ink)",
  borderTop: "1px solid var(--line)",
  touchAction: "manipulation",
  WebkitUserSelect: "none",
  userSelect: "none",
  overflowX: "auto",
  scrollbarWidth: "none",
};

const clusterStyle: React.CSSProperties = {
  flex: "1 1 0",
  minWidth: 36,
  height: 52,
  margin: 0,
  padding: 2,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridTemplateRows: "1fr 1fr",
  background: "var(--surface)",
  color: "var(--ink)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  cursor: "pointer",
  WebkitUserSelect: "none",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
};

const previewStyle: React.CSSProperties = {
  display: "grid",
  placeItems: "center",
  fontFamily: "var(--font-code), ui-monospace, monospace",
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1,
  minWidth: 0,
};

const padStyle: React.CSSProperties = {
  flex: "1 1 0",
  minWidth: 44,
  height: 48,
  margin: 0,
  padding: 0,
  display: "grid",
  placeItems: "center",
  background: "var(--surface)",
  color: "var(--ink)",
  border: "1px solid var(--line)",
  borderRadius: 12,
  fontFamily: "var(--font-code), ui-monospace, monospace",
  fontSize: 18,
  fontWeight: 600,
  lineHeight: 1,
  cursor: "pointer",
  WebkitUserSelect: "none",
  userSelect: "none",
  WebkitTapHighlightColor: "transparent",
};

function TabGlyph() {
  return (
    <svg
      width="18"
      height="10"
      viewBox="0 0 18 10"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 5h11.5" />
      <path d="M9.5 1.5 13.5 5l-4 3.5" />
      <path d="M16.5 1v8" />
    </svg>
  );
}
