import {
  Bold,
  Code,
  Eye,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Radical,
  Redo,
  Sigma,
  Strikethrough,
  Undo,
  Workflow,
} from 'lucide-react'
import { Button } from '../button'
import { Separator } from '../separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip'
import { ImageInsertPopover } from './image-popover'
import { LinkInsertPopover } from './link-popover'
import { TableControlsDropdown } from './table-controls'
import { ToolbarButton } from './toolbar-button'
import type { EditorToolbarProps } from './types'

export function EditorToolbar({ editor, viewMode, onViewModeChange, extraToolbarActions }: EditorToolbarProps) {
  const handleInsertImage = (url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const isWysiwyg = viewMode === 'wysiwyg'

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-muted/30 p-2">
      {/* View mode toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={isWysiwyg ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => onViewModeChange('wysiwyg')}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>WYSIWYG Editor</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={!isWysiwyg ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => onViewModeChange('markdown')}
            className="h-8 w-8"
          >
            <FileCode className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Raw Markdown</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Formatting buttons - disabled in markdown mode */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleBold().run()}
        isActive={editor?.isActive('bold')}
        disabled={!isWysiwyg}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        isActive={editor?.isActive('italic')}
        disabled={!isWysiwyg}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        isActive={editor?.isActive('strike')}
        disabled={!isWysiwyg}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleCode().run()}
        isActive={editor?.isActive('code')}
        disabled={!isWysiwyg}
        title="Inline Code"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor?.isActive('heading', { level: 1 })}
        disabled={!isWysiwyg}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor?.isActive('heading', { level: 2 })}
        disabled={!isWysiwyg}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor?.isActive('heading', { level: 3 })}
        disabled={!isWysiwyg}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        isActive={editor?.isActive('bulletList')}
        disabled={!isWysiwyg}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        isActive={editor?.isActive('orderedList')}
        disabled={!isWysiwyg}
        title="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        isActive={editor?.isActive('blockquote')}
        disabled={!isWysiwyg}
        title="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        isActive={editor?.isActive('codeBlock')}
        disabled={!isWysiwyg}
        title="Code Block"
      >
        <Code className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <LinkInsertPopover editor={editor} disabled={!isWysiwyg} />
      <ImageInsertPopover
        onInsert={handleInsertImage}
        disabled={!isWysiwyg}
      />
      <TableControlsDropdown editor={editor} disabled={!isWysiwyg} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() =>
          editor
            ?.chain()
            .focus()
            .insertContent({ type: 'mathInline', attrs: { latex: '' } })
            .run()
        }
        disabled={!isWysiwyg}
        title="Inline Math ($...$)"
      >
        <Sigma className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor
            ?.chain()
            .focus()
            .insertContent({ type: 'mathBlock', attrs: { latex: '' } })
            .run()
        }
        disabled={!isWysiwyg}
        title="Block Math ($$...$$)"
      >
        <Radical className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor
            ?.chain()
            .focus()
            .insertContent({ type: 'mermaidBlock', attrs: { code: '' } })
            .run()
        }
        disabled={!isWysiwyg}
        title="Mermaid Diagram"
      >
        <Workflow className="h-4 w-4" />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={!isWysiwyg || !editor?.can().undo()}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={!isWysiwyg || !editor?.can().redo()}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </ToolbarButton>

      {extraToolbarActions && (
        <>
          <Separator orientation="vertical" className="mx-1 h-6" />
          {extraToolbarActions}
        </>
      )}
    </div>
  )
}
