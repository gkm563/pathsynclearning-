"use client";

import React, { useEffect, useRef } from "react";
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

export type CodeEditorApi = {
  undo: () => void;
  redo: () => void;
  insert: (text: string) => void;
  tab: () => void;
  outdent: () => void;
  cursorLeft: () => void;
  cursorRight: () => void;
  focus: () => void;
};

type CodeEditorProps = {
  value: string;
  language: CodingLanguageId;
  onChange: (value: string) => void;
  onSave?: () => void;
  onFormat?: () => void;
  onCursorChange?: (pos: { line: number; col: number }) => void;
  onFocusChange?: (focused: boolean) => void;
  onReady?: (api: CodeEditorApi) => void;
  readOnly?: boolean;
  minHeight?: number;
  /** Flat LeetCode-style embedding (no outer chrome) */
  variant?: "default" | "leetcode";
  /** Phone density — smaller gutters, no wheel-zoom. */
  compact?: boolean;
  fontSize?: number;
};

export default function CodeEditor({
  value,
  language,
  onChange,
  onSave,
  onFormat,
  onCursorChange,
  onFocusChange,
  onReady,
  readOnly = false,
  minHeight = 280,
  variant = "default",
  compact = false,
  fontSize,
}: CodeEditorProps) {
  const saveRef = useRef(onSave);
  saveRef.current = onSave;
  const formatRef = useRef(onFormat);
  formatRef.current = onFormat;
  const cursorRef = useRef(onCursorChange);
  cursorRef.current = onCursorChange;
  const focusRef = useRef(onFocusChange);
  focusRef.current = onFocusChange;
  const readyRef = useRef(onReady);
  readyRef.current = onReady;
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);

  const resolvedSize = fontSize ?? (compact ? 12 : 14);
  const lineHeight = Math.round(resolvedSize * 1.5);

  const langMeta = getLanguageOption(language);
  const monacoLang = langMeta.monaco || MONACO_LANG[language] || "javascript";
  const isLc = variant === "leetcode";

  const handleMount: OnMount = (ed, monaco) => {
    monaco.editor.defineTheme("pathed-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "5d616a", fontStyle: "italic" },
        { token: "keyword", foreground: "1b4540" },
        { token: "string", foreground: "c45c26" },
        { token: "number", foreground: "1f6b48" },
        { token: "type", foreground: "2a5478" },
        { token: "function", foreground: "143632" },
        { token: "identifier", foreground: "16181d" },
      ],
      colors: {
        "editor.background": "#fffcf6",
        "editor.foreground": "#16181d",
        "editorLineNumber.foreground": "#8a8e97",
        "editorLineNumber.activeForeground": "#5d616a",
        "editor.selectionBackground": "#1b454026",
        "editor.inactiveSelectionBackground": "#1b454014",
        "editorCursor.foreground": "#1b4540",
        "editor.lineHighlightBackground": "#f4f1ea",
        "editorBracketMatch.background": "#1b454014",
        "editorBracketMatch.border": "#1b4540",
        "editorIndentGuide.background1": "#e4dfd4",
        "editorIndentGuide.activeBackground1": "#cfc8ba",
        "editorWidget.background": "#fffcf6",
        "editorSuggestWidget.background": "#fffcf6",
        "editorSuggestWidget.border": "#e4dfd4",
        "editorSuggestWidget.foreground": "#16181d",
        "editorSuggestWidget.selectedBackground": "#1b45401a",
        "scrollbarSlider.background": "#1b454028",
        "scrollbarSlider.hoverBackground": "#1b454048",
      },
    });

    monaco.editor.defineTheme("pathed-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "7d847f", fontStyle: "italic" },
        { token: "keyword", foreground: "8fb8b1" },
        { token: "string", foreground: "e08a52" },
        { token: "number", foreground: "6dba94" },
        { token: "type", foreground: "8fb4d4" },
        { token: "function", foreground: "a4c7c1" },
        { token: "identifier", foreground: "eeeae2" },
      ],
      colors: {
        "editor.background": "#171c1a",
        "editor.foreground": "#eeeae2",
        "editorLineNumber.foreground": "#7d847f",
        "editorLineNumber.activeForeground": "#a8ada8",
        "editor.selectionBackground": "#8fb8b133",
        "editor.inactiveSelectionBackground": "#8fb8b11a",
        "editorCursor.foreground": "#8fb8b1",
        "editor.lineHighlightBackground": "#1c2220",
        "editorBracketMatch.background": "#8fb8b114",
        "editorBracketMatch.border": "#8fb8b1",
        "editorIndentGuide.background1": "#ffffff14",
        "editorIndentGuide.activeBackground1": "#ffffff29",
        "editorWidget.background": "#171c1a",
        "editorSuggestWidget.background": "#171c1a",
        "editorSuggestWidget.border": "#ffffff14",
        "editorSuggestWidget.foreground": "#eeeae2",
        "editorSuggestWidget.selectedBackground": "#8fb8b124",
        "scrollbarSlider.background": "#8fb8b134",
        "scrollbarSlider.hoverBackground": "#8fb8b155",
      },
    });

    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    monaco.editor.setTheme(dark ? "pathed-dark" : "pathed-light");
    editorRef.current = ed;
    monacoRef.current = monaco;

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

    ed.onDidFocusEditorText(() => focusRef.current?.(true));
    ed.onDidBlurEditorText(() => focusRef.current?.(false));
    if (ed.hasTextFocus()) focusRef.current?.(true);

    const run = (handler: string, payload: unknown = null) => {
      ed.focus();
      ed.trigger("keyboard", handler, payload);
    };

    readyRef.current?.({
      undo: () => run("undo"),
      redo: () => run("redo"),
      insert: (text) => run("type", { text }),
      tab: () => run("tab"),
      outdent: () => {
        ed.focus();
        ed.trigger("editor", "editor.action.outdentLines", null);
      },
      cursorLeft: () => run("cursorLeft"),
      cursorRight: () => run("cursorRight"),
      focus: () => ed.focus(),
    });

    ed.focus();
  };

  useEffect(() => {
    const apply = () => {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      monacoRef.current?.editor.setTheme(dark ? "pathed-dark" : "pathed-light");
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    editorRef.current?.updateOptions({
      fontSize: resolvedSize,
      lineHeight,
    });
  }, [resolvedSize, lineHeight]);

  useEffect(() => {
    editorRef.current?.updateOptions({
      lineNumbersMinChars: compact ? 2 : 3,
      lineDecorationsWidth: compact ? 4 : 10,
      folding: !compact,
      showFoldingControls: compact ? "never" : "mouseover",
      mouseWheelZoom: !compact,
      padding: { top: compact ? 4 : 10, bottom: compact ? 4 : 10 },
    });
  }, [compact]);

  useEffect(() => {
    const vv = window.visualViewport;
    const layout = () => editorRef.current?.layout();
    window.addEventListener("resize", layout);
    vv?.addEventListener("resize", layout);
    vv?.addEventListener("scroll", layout);
    return () => {
      window.removeEventListener("resize", layout);
      vv?.removeEventListener("resize", layout);
      vv?.removeEventListener("scroll", layout);
    };
  }, []);

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
        background: "var(--surface)",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <Editor
          height="100%"
          language={monacoLang}
          value={value}
          theme="pathed-light"
          loading={
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--muted)",
                fontSize: 13,
                background: "var(--surface)",
              }}
            >
              Loading editor…
            </div>
          }
          onChange={(v) => onChange(v ?? "")}
          onMount={handleMount}
          options={{
            readOnly,
            fontSize: resolvedSize,
            fontFamily: "var(--font-code), ui-monospace, monospace",
            fontLigatures: true,
            lineHeight,
            letterSpacing: compact ? 0 : 0.2,
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
              verticalScrollbarSize: compact ? 6 : 10,
              horizontalScrollbarSize: compact ? 6 : 10,
            },
            padding: { top: compact ? 4 : 10, bottom: compact ? 4 : 10 },
            folding: !compact,
            foldingHighlight: !compact,
            showFoldingControls: compact ? "never" : "mouseover",
            lineNumbers: "on",
            lineNumbersMinChars: compact ? 2 : 3,
            lineDecorationsWidth: compact ? 4 : 10,
            glyphMargin: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            contextmenu: false,
            mouseWheelZoom: !compact,
            accessibilitySupport: "auto",
          }}
        />
      </div>
    </div>
  );
}
