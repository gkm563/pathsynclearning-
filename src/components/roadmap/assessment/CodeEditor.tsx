"use client";

import React, { useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { CodingLanguageId } from "@/lib/roadmap/coding-languages";
import { getLanguageOption } from "@/lib/roadmap/coding-languages";

const MONACO_LANG: Record<CodingLanguageId, string> = {
  javascript: "javascript",
  python: "python",
  java: "java",
  c: "c",
  cpp: "cpp",
};

type CodeEditorProps = {
  value: string;
  language: CodingLanguageId;
  onChange: (value: string) => void;
  onSave?: () => void;
  onFormat?: () => void;
  onCursorChange?: (pos: { line: number; col: number }) => void;
  readOnly?: boolean;
  minHeight?: number;
  /** Flat LeetCode-style embedding (no outer chrome) */
  variant?: "default" | "leetcode";
};

export default function CodeEditor({
  value,
  language,
  onChange,
  onSave,
  onFormat,
  onCursorChange,
  readOnly = false,
  minHeight = 280,
  variant = "default",
}: CodeEditorProps) {
  const saveRef = useRef(onSave);
  saveRef.current = onSave;
  const formatRef = useRef(onFormat);
  formatRef.current = onFormat;
  const cursorRef = useRef(onCursorChange);
  cursorRef.current = onCursorChange;

  const langMeta = getLanguageOption(language);
  const monacoLang = langMeta.monaco || MONACO_LANG[language] || "javascript";
  const isLc = variant === "leetcode";

  const handleMount: OnMount = (ed, monaco) => {
    monaco.editor.defineTheme("pathed-leetcode", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "569CD6" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
        { token: "identifier", foreground: "D4D4D4" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#D4D4D4",
        "editorLineNumber.foreground": "#858585",
        "editorLineNumber.activeForeground": "#C6C6C6",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
        "editorCursor.foreground": "#AEAFAD",
        "editor.lineHighlightBackground": "#2A2A2A",
        "editorBracketMatch.background": "#0064001a",
        "editorBracketMatch.border": "#888888",
        "editorIndentGuide.background1": "#404040",
        "editorIndentGuide.activeBackground1": "#707070",
        "editorWidget.background": "#252526",
        "editorSuggestWidget.background": "#252526",
        "editorSuggestWidget.border": "#454545",
        "scrollbarSlider.background": "#42424280",
        "scrollbarSlider.hoverBackground": "#4F4F4F80",
      },
    });

    monaco.editor.defineTheme("pathed-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "C586C0" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "type", foreground: "4EC9B0" },
        { token: "function", foreground: "DCDCAA" },
      ],
      colors: {
        "editor.background": "#0f1117",
        "editor.foreground": "#e6e6e6",
        "editorLineNumber.foreground": "#5c6370",
        "editorLineNumber.activeForeground": "#abb2bf",
        "editor.selectionBackground": "#264f78",
        "editor.inactiveSelectionBackground": "#3a3d41",
        "editorCursor.foreground": "#1f6b48",
        "editor.lineHighlightBackground": "#161b22",
        "editorBracketMatch.background": "#3b4048",
        "editorBracketMatch.border": "#1f6b48",
        "editorIndentGuide.background1": "#2c313a",
        "editorIndentGuide.activeBackground1": "#4b5263",
        "editorWidget.background": "#1a1f2b",
        "editorSuggestWidget.background": "#1a1f2b",
        "editorSuggestWidget.border": "#2c313a",
        "scrollbarSlider.background": "#3a3f4b66",
        "scrollbarSlider.hoverBackground": "#4b526380",
      },
    });

    monaco.editor.setTheme(isLc ? "pathed-leetcode" : "pathed-dark");

    // Hard-disable IntelliSense / suggest widget (stops Ctrl+Space + Space-as-commit)
    ed.updateOptions({
      quickSuggestions: false,
      suggestOnTriggerCharacters: false,
      wordBasedSuggestions: "off",
      snippetSuggestions: "none",
      parameterHints: { enabled: false },
      hover: { enabled: "off" },
      acceptSuggestionOnCommitCharacter: false,
      acceptSuggestionOnEnter: "off",
      tabCompletion: "off",
      contextmenu: false,
    });

    const suggest = ed.getContribution(
      "editor.contrib.suggestController",
    ) as { cancelSuggestWidget?: () => void; triggerSuggest?: () => void } | null;
    if (suggest) {
      suggest.triggerSuggest = () => undefined;
    }

    // Remove default Ctrl/Cmd+Space "Trigger Suggest" binding without touching bare Space
    const kb = (
      ed as unknown as {
        _standaloneKeybindingService?: {
          addDynamicKeybinding: (
            commandId: string,
            keybinding: number,
            handler: () => void,
          ) => unknown;
        };
      }
    )._standaloneKeybindingService;
    kb?.addDynamicKeybinding("-editor.action.triggerSuggest", 0, () => undefined);
    kb?.addDynamicKeybinding("-editor.action.triggerParameterHints", 0, () => undefined);

    ed.onKeyDown((e) => {
      // Block Ctrl/Cmd+Space from opening suggestions
      if (
        e.keyCode === monaco.KeyCode.Space &&
        (e.ctrlKey || e.metaKey) &&
        !e.altKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        e.stopPropagation();
        suggest?.cancelSuggestWidget?.();
        return;
      }
      // If a suggest widget somehow opened, cancel it before Space is treated as commit
      if (
        e.keyCode === monaco.KeyCode.Space &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        suggest?.cancelSuggestWidget?.();
      }
    });

    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveRef.current?.();
    });

    ed.addCommand(
      monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF,
      () => {
        formatRef.current?.();
      },
    );

    // Suppress editor context menu (right-click)
    ed.onContextMenu((e) => {
      e.event.preventDefault();
      e.event.stopPropagation();
    });

    const dom = ed.getDomNode();
    dom?.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
    });

    ed.onDidChangeCursorPosition((e) => {
      cursorRef.current?.({
        line: e.position.lineNumber,
        col: e.position.column,
      });
    });

    const pos = ed.getPosition();
    if (pos) {
      cursorRef.current?.({ line: pos.lineNumber, col: pos.column });
    }

    ed.focus();
  };

  return (
    <div
      style={{
        flex: 1,
        minHeight,
        height: "100%",
        position: "relative",
        borderRadius: isLc ? 0 : 12,
        border: isLc ? "none" : "1px solid var(--border-light)",
        overflow: "hidden",
        background: isLc ? "var(--bg-inverse)" : "var(--bg-inverse)",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <Editor
          height="100%"
          language={monacoLang}
          value={value}
          theme={isLc ? "pathed-leetcode" : "pathed-dark"}
          loading={
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-inverse)",
                fontSize: 13,
                background: isLc ? "var(--bg-inverse)" : "var(--bg-inverse)",
              }}
            >
              Loading editor…
            </div>
          }
          onChange={(v) => onChange(v ?? "")}
          onMount={handleMount}
          options={{
            readOnly,
            fontSize: 14,
            fontFamily: "var(--font-code), ui-monospace, monospace",
            fontLigatures: true,
            lineHeight: 22,
            letterSpacing: 0.2,
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: false,
            autoIndent: "full",
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            autoClosingOvertype: "always",
            autoSurround: "languageDefined",
            matchBrackets: "always",
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
              highlightActiveIndentation: true,
            },
            // No IntelliSense / autocomplete in assessments
            suggestOnTriggerCharacters: false,
            quickSuggestions: false,
            wordBasedSuggestions: "off",
            snippetSuggestions: "none",
            parameterHints: { enabled: false },
            suggest: { showWords: false },
            acceptSuggestionOnCommitCharacter: false,
            acceptSuggestionOnEnter: "off",
            tabCompletion: "off",
            hover: { enabled: "off" },
            formatOnType: false,
            formatOnPaste: false,
            wrappingIndent: "indent",
            wordWrap: "on",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            renderLineHighlight: "line",
            renderWhitespace: "selection",
            minimap: { enabled: false },
            scrollbar: {
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            padding: { top: 10, bottom: 10 },
            folding: true,
            foldingHighlight: true,
            showFoldingControls: "mouseover",
            lineNumbers: "on",
            glyphMargin: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            contextmenu: false,
            mouseWheelZoom: true,
            accessibilitySupport: "auto",
          }}
        />
      </div>
    </div>
  );
}
