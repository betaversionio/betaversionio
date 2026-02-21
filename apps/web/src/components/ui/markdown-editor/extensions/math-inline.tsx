import { cn } from '@/lib/utils'
import { mergeAttributes, Node } from '@tiptap/core'
import type { ReactNodeViewProps } from '@tiptap/react'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import katex from 'katex'
import { useCallback, useEffect, useRef, useState } from 'react'

function getLatex(node: ReactNodeViewProps['node']): string {
  return (node.attrs.latex as string) || ''
}

function MathInlineView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const latexAttr = getLatex(node)
  const [editing, setEditing] = useState(!latexAttr)
  const [latex, setLatex] = useState(latexAttr)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync local state when node attrs change externally
  useEffect(() => {
    setLatex(getLatex(node))
  }, [node])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const save = useCallback(() => {
    const trimmed = latex.trim()
    if (trimmed) {
      updateAttributes({ latex: trimmed })
      setLatex(trimmed)
    }
    setEditing(false)
  }, [latex, updateAttributes])

  if (editing) {
    return (
      <NodeViewWrapper as="span" className="inline">
        <input
          ref={inputRef}
          value={latex}
          onChange={(e) => setLatex(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              save()
            }
            if (e.key === 'Escape') {
              setLatex(getLatex(node))
              setEditing(false)
            }
          }}
          className="border-primary/50 bg-muted rounded border px-1.5 py-0.5 font-mono text-sm outline-none"
          placeholder="LaTeX..."
          style={{ width: Math.max(80, latex.length * 8) }}
        />
      </NodeViewWrapper>
    )
  }

  // Use local state as fallback — node.attrs may lag behind updateAttributes
  const displayLatex = getLatex(node) || latex

  let html = ''
  try {
    html = katex.renderToString(displayLatex, {
      throwOnError: false,
      displayMode: false,
    })
  } catch {
    html = displayLatex
  }

  return (
    <NodeViewWrapper
      as="span"
      className={cn(
        'inline cursor-pointer rounded px-0.5',
        selected && 'bg-primary/10 ring-primary/50 ring-1'
      )}
      onDoubleClick={() => setEditing(true)}
      title="Double-click to edit"
    >
      <span dangerouslySetInnerHTML={{ __html: html }} />
    </NodeViewWrapper>
  )
}

export const MathInline = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      latex: { default: '', rendered: false },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-math-inline]',
        getAttrs: (dom) => ({
          latex: (dom as HTMLElement).getAttribute('data-latex') || '',
        }),
      },
    ]
  },

  renderHTML({ node }) {
    // Include text content so Turndown doesn't treat this as a blank node
    return [
      'span',
      mergeAttributes({
        'data-math-inline': '',
        'data-latex': node.attrs.latex,
      }),
      (node.attrs.latex as string) || '\u200B',
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView)
  },
})
