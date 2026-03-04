import { cn } from '@/lib/utils';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import 'katex/dist/katex.min.css';
import * as React from 'react';
import { Textarea } from '../textarea';
import { MathBlock } from './extensions/math-block';
import { MathInline } from './extensions/math-inline';
import { MermaidBlock } from './extensions/mermaid-block';
import { EmbedIframe } from './extensions/embed-iframe';
import { EditorToolbar } from './toolbar';
import type { MarkdownEditorProps, ViewMode } from './types';
import { htmlToMarkdown, lowlight, markdownToHtml } from './utils';

export type { MarkdownEditorProps, OutputFormat } from './types';

export function MarkdownEditor({
  value = '',
  onChange,
  placeholder = 'Write something...',
  className,
  editorClassName,
  disabled = false,
  height = 200,
  maxHeight,
  outputFormat = 'html',
  extraToolbarActions,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('wysiwyg');

  // Track internal state to avoid re-converting on every render
  const lastValueRef = React.useRef<string>(value);
  const isInternalUpdate = React.useRef(false);

  // Track raw markdown for the textarea
  const [rawMarkdown, setRawMarkdown] = React.useState(() => {
    if (outputFormat === 'markdown') {
      return value;
    }
    return htmlToMarkdown(value);
  });

  // Convert initial value to HTML if it's markdown
  const initialContent = React.useMemo(() => {
    if (outputFormat === 'markdown') {
      return markdownToHtml(value);
    }
    return value;
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        gapcursor: false,
      }),
      Gapcursor,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-md',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-muted font-semibold',
        },
      }),
      TableCell,
      MathInline,
      MathBlock,
      MermaidBlock,
      EmbedIframe,
    ],
    content: initialContent,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const html = editor.getHTML();
      const md = htmlToMarkdown(html);
      setRawMarkdown(md);
      const output = outputFormat === 'markdown' ? md : html;
      lastValueRef.current = output;
      onChange?.(output);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none w-full p-4 focus:outline-none',
          '[&_p]:my-2',
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4',
          '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-3',
          '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2',
          '[&_ul]:my-2 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:ml-4 [&_ol]:list-decimal [&_li]:my-1 [&_li]:pl-1',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic',
          '[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto',
          '[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm',
          '[&_img]:my-4',
          '[&_table]:w-full [&_table]:border-collapse [&_table]:my-4',
          '[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold',
          '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2',
          '[&_.ProseMirror-gapcursor]:relative [&_.ProseMirror-gapcursor]:after:absolute [&_.ProseMirror-gapcursor]:after:h-5 [&_.ProseMirror-gapcursor]:after:w-px [&_.ProseMirror-gapcursor]:after:bg-foreground [&_.ProseMirror-gapcursor]:after:animate-pulse',
          editorClassName
        ),
      },
    },
  });

  // Handle view mode change
  const handleViewModeChange = React.useCallback(
    (mode: ViewMode) => {
      if (mode === viewMode) return;

      if (mode === 'wysiwyg' && editor) {
        const html = markdownToHtml(rawMarkdown);
        editor.commands.setContent(html);
      }

      setViewMode(mode);
    },
    [viewMode, editor, rawMarkdown]
  );

  // Handle raw markdown change
  const handleRawMarkdownChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const md = e.target.value;
      setRawMarkdown(md);
      isInternalUpdate.current = true;

      if (outputFormat === 'markdown') {
        lastValueRef.current = md;
        onChange?.(md);
      } else {
        const html = markdownToHtml(md);
        lastValueRef.current = html;
        onChange?.(html);
      }
    },
    [onChange, outputFormat]
  );

  // Sync external value changes to editor
  React.useEffect(() => {
    if (!editor) return;

    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    if (value === lastValueRef.current) return;

    lastValueRef.current = value;

    const md = outputFormat === 'markdown' ? value : htmlToMarkdown(value);
    setRawMarkdown(md);

    const htmlContent = outputFormat === 'markdown' ? markdownToHtml(value) : value;

    if (htmlContent !== editor.getHTML()) {
      editor.commands.setContent(htmlContent);
    }
  }, [value, editor, outputFormat]);

  return (
    <div
      className={cn(
        'bg-background overflow-hidden rounded-md border',
        disabled && 'opacity-50',
        className
      )}
    >
      <EditorToolbar
        editor={editor}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        extraToolbarActions={extraToolbarActions}
      />
      {viewMode === 'wysiwyg' ? (
        <div
          className="overflow-y-auto text-[15px]"
          style={{
            minHeight: `${height}px`,
            maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          }}
        >
          <EditorContent editor={editor} />
        </div>
      ) : (
        <Textarea
          value={rawMarkdown}
          onChange={handleRawMarkdownChange}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-0 resize-none rounded-none border-0 font-mono text-sm focus-visible:ring-0"
          style={{
            minHeight: `${height}px`,
            maxHeight: maxHeight ? `${maxHeight}px` : undefined,
          }}
        />
      )}
    </div>
  );
}
