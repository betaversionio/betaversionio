import * as React from 'react'
import { Link as LinkIcon } from 'lucide-react'
import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip'
import type { LinkInsertPopoverProps } from './types'

export function LinkInsertPopover({ editor, disabled }: LinkInsertPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const [url, setUrl] = React.useState('')
  const [text, setText] = React.useState('')

  const isActive = editor?.isActive('link') ?? false

  // Get selected text when popover opens
  React.useEffect(() => {
    if (open && editor) {
      const { from, to } = editor.state.selection
      const selectedText = editor.state.doc.textBetween(from, to, '')
      setText(selectedText)

      // If link is active, get the href
      if (isActive) {
        const attrs = editor.getAttributes('link')
        setUrl(attrs.href || '')
      }
    }
  }, [open, editor, isActive])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!editor || !url.trim()) return

    if (text.trim()) {
      // Insert link with custom text
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url.trim()}">${text.trim()}</a>`)
        .run()
    } else {
      // Set link on selection or insert URL as link
      editor
        .chain()
        .focus()
        .setLink({ href: url.trim() })
        .run()
    }

    setUrl('')
    setText('')
    setOpen(false)
  }

  const handleRemoveLink = () => {
    editor?.chain().focus().unsetLink().run()
    setOpen(false)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setUrl('')
      setText('')
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={isActive ? 'secondary' : 'ghost'}
              size="icon-sm"
              disabled={disabled}
              className="h-8 w-8"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Add Link</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-72">
        <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className="space-y-3">
          <div className="text-sm font-medium">{isActive ? 'Edit Link' : 'Insert Link'}</div>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="link-url" className="text-xs">
                URL
              </Label>
              <Input
                id="link-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="link-text" className="text-xs">
                Text (optional)
              </Label>
              <Input
                id="link-text"
                type="text"
                placeholder="Link text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {isActive && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemoveLink()
                }}
              >
                Remove
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="flex-1"
              disabled={!url.trim()}
              onClick={(e) => e.stopPropagation()}
            >
              {isActive ? 'Update' : 'Insert'}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
