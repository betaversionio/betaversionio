import { cn } from '@/lib/utils'
import { mergeAttributes, Node } from '@tiptap/core'
import type { ReactNodeViewProps } from '@tiptap/react'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import katex from 'katex'
import { useCallback, useEffect, useRef, useState } from 'react'

function getLatex(node: ReactNodeViewProps['node']): string {
  return (node.attrs.latex as string) || ''
}

function MathBlockView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const latexAttr = getLatex(node)
  const [editing, setEditing] = useState(!latexAttr)
  const [latex, setLatex] = useState(latexAttr)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Sync local state when node attrs change externally
  useEffect(() => {
    setLatex(getLatex(node))
  }, [node])

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
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
      <NodeViewWrapper className="my-4">
        <div className="border-primary/50 bg-muted rounded-md border p-3">
          <div className="text-muted-foreground mb-1 text-xs font-medium">
            LaTeX (display mode)
          </div>
          <textarea
            ref={textareaRef}
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                save()
              }
              if (e.key === 'Escape') {
                setLatex(getLatex(node))
                setEditing(false)
              }
            }}
            className="bg-background w-full resize-none rounded border p-2 font-mono text-sm outline-none"
            rows={3}
            placeholder="LaTeX expression..."
          />
          <div className="text-muted-foreground mt-1 text-xs">
            Ctrl+Enter to save, Escape to cancel
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  // Use local state as fallback — node.attrs may lag behind updateAttributes
  const displayLatex = getLatex(node) || latex

  let html = ''
  try {
    html = katex.renderToString(displayLatex, {
      throwOnError: false,
      displayMode: true,
    })
  } catch {
    html = `<span class="text-destructive">${displayLatex}</span>`
  }

  return (
    <NodeViewWrapper
      className={cn(
        'my-4 cursor-pointer rounded-md p-2 text-center',
        selected && 'bg-primary/5 ring-primary/50 ring-1'
      )}
      onDoubleClick={() => setEditing(true)}
      title="Double-click to edit"
    >
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </NodeViewWrapper>
  )
}

export const MathBlock = Node.create({
  name: 'mathBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      latex: { default: '', rendered: false },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-math-block]',
        getAttrs: (dom) => ({
          latex: (dom as HTMLElement).getAttribute('data-latex') || '',
        }),
      },
    ]
  },

  renderHTML({ node }) {
    // Include text content so Turndown doesn't treat this as a blank node
    return [
      'div',
      mergeAttributes({
        'data-math-block': '',
        'data-latex': node.attrs.latex,
      }),
      (node.attrs.latex as string) || '\u200B',
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView)
  },
})
