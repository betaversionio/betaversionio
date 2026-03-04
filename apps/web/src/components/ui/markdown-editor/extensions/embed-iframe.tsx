import { mergeAttributes, Node } from '@tiptap/core'
import type { ReactNodeViewProps } from '@tiptap/react'
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'

function EmbedIframeView({ node }: ReactNodeViewProps) {
  const src = (node.attrs.src as string) || ''

  if (!src.startsWith('/embed/')) {
    return null
  }

  return (
    <NodeViewWrapper className="my-2">
      <iframe
        src={src}
        className="w-full rounded-lg"
        style={{ border: 'none' }}
        height={160}
        loading="lazy"
      />
    </NodeViewWrapper>
  )
}

export const EmbedIframe = Node.create({
  name: 'embedIframe',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: '' },
      width: { default: '100%' },
      height: { default: '160' },
      loading: { default: 'lazy' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
        getAttrs: (dom) => {
          const src = (dom as HTMLElement).getAttribute('src') || ''
          if (!src.startsWith('/embed/')) return false
          return {
            src,
            width: (dom as HTMLElement).getAttribute('width') || '100%',
            height: (dom as HTMLElement).getAttribute('height') || '160',
            loading: (dom as HTMLElement).getAttribute('loading') || 'lazy',
          }
        },
      },
    ]
  },

  renderHTML({ node }) {
    return [
      'iframe',
      mergeAttributes({
        src: node.attrs.src,
        width: node.attrs.width,
        height: node.attrs.height,
        loading: node.attrs.loading,
        style: 'border:none; border-radius:8px;',
      }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedIframeView)
  },
})
