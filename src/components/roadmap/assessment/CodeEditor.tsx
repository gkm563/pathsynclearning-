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
        { token: "comment", foreground: "64748B", fontStyle: "italic" },
        { token: "keyword", foreground: "066BD3" },
        { token: "string", foreground: "0F766E" },
        { token: "number", foreground: "14B8A6" },
        { token: "type", foreground: "0A4193" },
        { token: "function", foreground: "0554B0" },
        { token: "identifier", foreground: "0F172A" },
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#0F172A",
        "editorLineNumber.foreground": "#94A3B8",
        "editorLineNumber.activeForeground": "#475569",
        "editor.selectionBackground": "#066BD326",
        "editor.inactiveSelectionBackground": "#066BD314",
        "editorCursor.foreground": "#066BD3",
        "editor.lineHighlightBackground": "#F8FAFC",
        "editorBracketMatch.background": "#066BD314",
        "editorBracketMatch.border": "#066BD3",
        "editorIndentGuide.background1": "#E2E8F0",
        "editorIndentGuide.activeBackground1": "#CBD5E1",
        "editorWidget.background": "#FFFFFF",
        "editorSuggestWidget.background": "#FFFFFF",
        "editorSuggestWidget.border": "#E2E8F0",
        "editorSuggestWidget.foreground": "#0F172A",
        "editorSuggestWidget.selectedBackground": "#EFF6FF",
        "scrollbarSlider.background": "#066BD328",
        "scrollbarSlider.hoverBackground": "#066BD348",
      },
    });

    monaco.editor.defineTheme("pathed-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "94A3B8", fontStyle: "italic" },
        { token: "keyword", foreground: "5B9FEF" },
        { token: "string", foreground: "2DD4BF" },
        { token: "number", foreground: "5EEAD4" },
        { token: "type", foreground: "93C5FD" },
        { token: "function", foreground: "7EB6F5" },
        { token: "identifier", foreground: "F8FAFC" },
      ],
      colors: {
        "editor.background": "#101522",
        "editor.foreground": "#F8FAFC",
        "editorLineNumber.foreground": "#64748B",
        "editorLineNumber.activeForeground": "#CBD5E1",
        "editor.selectionBackground": "#5B9FEF33",
        "editor.inactiveSelectionBackground": "#5B9FEF1a",
        "editorCursor.foreground": "#5B9FEF",
        "editor.lineHighlightBackground": "#0F172A",
        "editorBracketMatch.background": "#5B9FEF14",
        "editorBracketMatch.border": "#5B9FEF",
        "editorIndentGuide.background1": "#ffffff14",
        "editorIndentGuide.activeBackground1": "#ffffff29",
        "editorWidget.background": "#101522",
        "editorSuggestWidget.background": "#101522",
        "editorSuggestWidget.border": "#ffffff14",
        "editorSuggestWidget.foreground": "#F8FAFC",
        "editorSuggestWidget.selectedBackground": "#5B9FEF24",
        "scrollbarSlider.background": "#5B9FEF34",
        "scrollbarSlider.hoverBackground": "#5B9FEF55",
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
