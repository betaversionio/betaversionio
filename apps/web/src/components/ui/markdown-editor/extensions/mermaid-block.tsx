import { cn } from '@/lib/utils'
import { mergeAttributes, Node } from '@tiptap/core'
import type { ReactNodeViewProps } from '@tiptap/react'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

function getCode(node: ReactNodeViewProps['node']): string {
  return (node.attrs.code as string) || ''
}

function MermaidNodeView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const codeAttr = getCode(node)
  const [editing, setEditing] = useState(!codeAttr)
  const [code, setCode] = useState(codeAttr)
  const [svg, setSvg] = useState('')
  const [error, setError] = useState('')
  const id = useId()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync local state when node attrs change externally
  useEffect(() => {
    setCode(getCode(node))
  }, [node])

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editing])

  // Use local state as fallback — node.attrs may lag behind updateAttributes
  const displayCode = getCode(node) || code

  useEffect(() => {
    if (!displayCode || editing) return

    let cancelled = false
    ;(async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'default',
        })
        const result = await mermaid.render(
          `mermaid-editor-${id.replace(/:/g, '')}`,
          displayCode
        )
        if (!cancelled) {
          setSvg(result.svg)
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to render diagram'
          )
          setSvg('')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [displayCode, editing, id])

  const save = useCallback(() => {
    const trimmed = code.trim()
    if (trimmed) {
      updateAttributes({ code: trimmed })
      setCode(trimmed)
    }
    setEditing(false)
  }, [code, updateAttributes])

  if (editing) {
    return (
      <NodeViewWrapper className="my-4">
        <div className="border-primary/50 bg-muted rounded-md border p-3">
          <div className="text-muted-foreground mb-1 text-xs font-medium">
            Mermaid Diagram
          </div>
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                save()
              }
              if (e.key === 'Escape') {
                setCode(getCode(node))
                setEditing(false)
              }
            }}
            className="bg-background w-full resize-none rounded border p-2 font-mono text-sm outline-none"
            rows={6}
            placeholder={'graph LR\n  A --> B'}
          />
          <div className="text-muted-foreground mt-1 text-xs">
            Ctrl+Enter to save, Escape to cancel
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper
      className={cn(
        'my-4 cursor-pointer rounded-md',
        selected && 'ring-primary/50 ring-1'
      )}
      onDoubleClick={() => setEditing(true)}
      title="Double-click to edit"
    >
      {error ? (
        <pre className="bg-destructive/10 text-destructive overflow-x-auto rounded-lg p-4 text-sm">
          <code>{displayCode}</code>
        </pre>
      ) : svg ? (
        <div
          className="flex justify-center overflow-x-auto [&>svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="flex justify-center">
          <div className="bg-muted h-24 w-48 animate-pulse rounded-lg" />
        </div>
      )}
    </NodeViewWrapper>
  )
}

export const MermaidBlock = Node.create({
  name: 'mermaidBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      code: { default: '', rendered: false },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-mermaid]',
        getAttrs: (dom) => ({
          code: (dom as HTMLElement).getAttribute('data-code') || '',
        }),
      },
    ]
  },

  renderHTML({ node }) {
    // Include text content so Turndown doesn't treat this as a blank node
    return [
      'div',
      mergeAttributes({
        'data-mermaid': '',
        'data-code': node.attrs.code,
      }),
      (node.attrs.code as string) || '\u200B',
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidNodeView)
  },
})
