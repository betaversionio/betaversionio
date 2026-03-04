import type { Editor } from '@tiptap/react'

export type ViewMode = 'wysiwyg' | 'markdown'

export type OutputFormat = 'html' | 'markdown'

export interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}

export interface LinkInsertPopoverProps {
  editor: Editor | null
  disabled?: boolean
}

export interface ImageInsertPopoverProps {
  onInsert: (url: string) => void
  disabled?: boolean
}

export interface TableControlsDropdownProps {
  editor: Editor | null
  disabled?: boolean
}

export interface EditorToolbarProps {
  editor: Editor | null
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  extraToolbarActions?: React.ReactNode
}

export interface MarkdownEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  editorClassName?: string
  disabled?: boolean
  /** Minimum height of the editor in pixels */
  height?: number
  /** Maximum height of the editor in pixels. If set, content will scroll when exceeding this height */
  maxHeight?: number
  /** Output format: 'html' (default) or 'markdown' */
  outputFormat?: OutputFormat
  /** Extra toolbar actions rendered after the standard buttons */
  extraToolbarActions?: React.ReactNode
}
