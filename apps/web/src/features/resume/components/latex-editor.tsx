"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import type { OnMount } from "@monaco-editor/react";
import { EditorFormatToolbar } from "./editor-format-toolbar";

const Editor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

interface LatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCompile?: () => void;
  onSave?: () => void;
}

export function LatexEditor({
  value,
  onChange,
  onCompile,
  onSave,
}: LatexEditorProps) {
  const { resolvedTheme } = useTheme();
  type EditorInstance = Parameters<OnMount>[0];
  const editorRef = useRef<EditorInstance | null>(null);
  const onCompileRef = useRef(onCompile);
  const onSaveRef = useRef(onSave);

  // Keep refs up-to-date so keybindings always call latest callbacks
  useEffect(() => { onCompileRef.current = onCompile; }, [onCompile]);
  useEffect(() => { onSaveRef.current = onSave; }, [onSave]);

  function insertSnippet(before: string, after: string) {
    const ed = editorRef.current;
    if (!ed) return;

    const selection = ed.getSelection();
    if (!selection) return;

    const selectedText = ed.getModel()?.getValueInRange(selection) ?? "";
    const replacement = `${before}${selectedText}${after}`;

    ed.executeEdits("snippet", [
      { range: selection, text: replacement },
    ]);

    // Place cursor between before/after if no text was selected
    if (!selectedText) {
      const pos = ed.getPosition();
      if (pos) {
        const newCol = pos.column - after.length;
        ed.setPosition({ lineNumber: pos.lineNumber, column: newCol });
      }
    }

    ed.focus();
  }

  return (
    <div className="flex h-full flex-col">
      <EditorFormatToolbar onInsert={insertSnippet} />
      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          language="latex"
          theme={resolvedTheme === "dark" ? "latex-dark" : "latex-light"}
          value={value}
          onChange={(v) => onChange(v ?? "")}
          beforeMount={(monaco) => {
            // Register LaTeX language with proper tokenization
            if (!monaco.languages.getLanguages().some((l: { id: string }) => l.id === "latex")) {
              monaco.languages.register({ id: "latex" });
            }

            monaco.languages.setMonarchTokensProvider("latex", {
              defaultToken: "",
              tokenPostfix: ".latex",

              brackets: [
                { open: "{", close: "}", token: "delimiter.curly" },
                { open: "[", close: "]", token: "delimiter.bracket" },
                { open: "(", close: ")", token: "delimiter.paren" },
              ],

              tokenizer: {
                root: [
                  // Comments
                  [/%.*$/, "comment"],

                  // Math mode ($$...$$)
                  [/\$\$/, { token: "string.math", next: "@mathDouble" }],
                  // Math mode ($...$)
                  [/\$/, { token: "string.math", next: "@mathInline" }],

                  // Environment begin/end
                  [
                    /\\(begin|end)\s*\{/,
                    [
                      "keyword.control",
                    ],
                  ],

                  // Commands with arguments
                  [
                    /\\[a-zA-Z@]+\*?/,
                    {
                      cases: {
                        "\\\\documentclass": "keyword",
                        "\\\\usepackage": "keyword",
                        "\\\\begin": "keyword.control",
                        "\\\\end": "keyword.control",
                        "\\\\section": "keyword.section",
                        "\\\\subsection": "keyword.section",
                        "\\\\subsubsection": "keyword.section",
                        "\\\\chapter": "keyword.section",
                        "\\\\part": "keyword.section",
                        "\\\\paragraph": "keyword.section",
                        "\\\\textbf": "keyword.format",
                        "\\\\textit": "keyword.format",
                        "\\\\texttt": "keyword.format",
                        "\\\\emph": "keyword.format",
                        "\\\\underline": "keyword.format",
                        "\\\\textsc": "keyword.format",
                        "\\\\bfseries": "keyword.format",
                        "\\\\itshape": "keyword.format",
                        "\\\\scshape": "keyword.format",
                        "\\\\large": "keyword.format",
                        "\\\\Large": "keyword.format",
                        "\\\\LARGE": "keyword.format",
                        "\\\\huge": "keyword.format",
                        "\\\\Huge": "keyword.format",
                        "\\\\small": "keyword.format",
                        "\\\\tiny": "keyword.format",
                        "\\\\footnotesize": "keyword.format",
                        "\\\\normalsize": "keyword.format",
                        "\\\\hfill": "keyword.spacing",
                        "\\\\vspace": "keyword.spacing",
                        "\\\\hspace": "keyword.spacing",
                        "\\\\newline": "keyword.spacing",
                        "\\\\newpage": "keyword.spacing",
                        "\\\\noindent": "keyword.spacing",
                        "\\\\item": "keyword.item",
                        "\\\\label": "keyword.ref",
                        "\\\\ref": "keyword.ref",
                        "\\\\cite": "keyword.ref",
                        "\\\\href": "keyword.ref",
                        "\\\\url": "keyword.ref",
                        "\\\\includegraphics": "keyword.ref",
                        "\\\\input": "keyword.ref",
                        "\\\\include": "keyword.ref",
                        "\\\\definecolor": "keyword",
                        "\\\\color": "keyword.format",
                        "\\\\pagestyle": "keyword",
                        "\\\\titleformat": "keyword",
                        "\\\\titlespacing": "keyword",
                        "@default": "tag",
                      },
                    },
                  ],

                  // Special characters
                  [/\\[{}$&#%_~^\\]/, "string.escape"],

                  // Braces
                  [/[{}]/, "delimiter.curly"],
                  [/[[\]]/, "delimiter.bracket"],
                ],

                mathInline: [
                  [/[^$\\]+/, "string.math"],
                  [/\\[a-zA-Z]+/, "string.math.command"],
                  [/\\./, "string.math"],
                  [/\$/, { token: "string.math", next: "@pop" }],
                ],

                mathDouble: [
                  [/[^$\\]+/, "string.math"],
                  [/\\[a-zA-Z]+/, "string.math.command"],
                  [/\\./, "string.math"],
                  [/\$\$/, { token: "string.math", next: "@pop" }],
                ],
              },
            });

            // Define custom colors for LaTeX tokens
            const isDark = resolvedTheme === "dark";
            monaco.editor.defineTheme("latex-dark", {
              base: "vs-dark",
              inherit: true,
              rules: [
                { token: "comment.latex", foreground: "6A9955", fontStyle: "italic" },
                { token: "keyword.latex", foreground: "C586C0" },
                { token: "keyword.control.latex", foreground: "C586C0", fontStyle: "bold" },
                { token: "keyword.section.latex", foreground: "DCDCAA", fontStyle: "bold" },
                { token: "keyword.format.latex", foreground: "569CD6" },
                { token: "keyword.spacing.latex", foreground: "9CDCFE" },
                { token: "keyword.item.latex", foreground: "C586C0" },
                { token: "keyword.ref.latex", foreground: "4EC9B0" },
                { token: "tag.latex", foreground: "569CD6" },
                { token: "string.escape.latex", foreground: "D7BA7D" },
                { token: "string.math.latex", foreground: "CE9178" },
                { token: "string.math.command.latex", foreground: "DCDCAA" },
                { token: "delimiter.curly.latex", foreground: "FFD700" },
                { token: "delimiter.bracket.latex", foreground: "DA70D6" },
              ],
              colors: {},
            });

            monaco.editor.defineTheme("latex-light", {
              base: "vs",
              inherit: true,
              rules: [
                { token: "comment.latex", foreground: "008000", fontStyle: "italic" },
                { token: "keyword.latex", foreground: "AF00DB" },
                { token: "keyword.control.latex", foreground: "AF00DB", fontStyle: "bold" },
                { token: "keyword.section.latex", foreground: "795E26", fontStyle: "bold" },
                { token: "keyword.format.latex", foreground: "0000FF" },
                { token: "keyword.spacing.latex", foreground: "267F99" },
                { token: "keyword.item.latex", foreground: "AF00DB" },
                { token: "keyword.ref.latex", foreground: "267F99" },
                { token: "tag.latex", foreground: "0000FF" },
                { token: "string.escape.latex", foreground: "EE0000" },
                { token: "string.math.latex", foreground: "A31515" },
                { token: "string.math.command.latex", foreground: "795E26" },
                { token: "delimiter.curly.latex", foreground: "B8860B" },
                { token: "delimiter.bracket.latex", foreground: "800080" },
              ],
              colors: {},
            });
          }}
          onMount={(editor, monaco) => {
            editorRef.current = editor;

            // Ctrl+Enter → compile
            editor.addAction({
              id: "latex-compile",
              label: "Compile LaTeX",
              keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
              ],
              run: () => onCompileRef.current?.(),
            });

            // Ctrl+S → save
            editor.addAction({
              id: "latex-save",
              label: "Save",
              keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
              ],
              run: () => onSaveRef.current?.(),
            });
          }}
          options={{
            minimap: { enabled: false },
            wordWrap: "on",
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 8 },
            renderLineHighlight: "gutter",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true },
          }}
        />
      </div>
    </div>
  );
}
