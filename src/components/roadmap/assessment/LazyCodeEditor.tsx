"use client";

import React, { useEffect, useState } from "react";
import type CodeEditorComponent from "./CodeEditor";

type CodeEditorProps = React.ComponentProps<typeof CodeEditorComponent>;

const loadingStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 200,
  height: "100%",
  background: "#1e1e1e",
  color: "#9ca3af",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Outfit",
  fontSize: 13,
};

/**
 * Monaco cannot SSR. Load it only after mount, and keep it in this parent
 * chunk (`webpackMode: "eager"`) so a stale `_CodeEditor_tsx.js` file
 * cannot 404 after HMR / next.config restarts.
 */
export default function LazyCodeEditor(props: CodeEditorProps) {
  const [Editor, setEditor] = useState<typeof CodeEditorComponent | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void import(
      /* webpackMode: "eager" */
      "./CodeEditor"
    )
      .then((mod) => {
        if (!cancelled) setEditor(() => mod.default);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <div style={{ ...loadingStyle, flexDirection: "column", gap: 10 }}>
        <span>Editor failed to load.</span>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #3e3e3e",
            background: "#373737",
            color: "#eff1f6",
            cursor: "pointer",
            fontFamily: "Outfit",
            fontWeight: 600,
          }}
        >
          Reload page
        </button>
      </div>
    );
  }

  if (!Editor) {
    return <div style={loadingStyle}>Loading editor…</div>;
  }

  return <Editor {...props} />;
}
