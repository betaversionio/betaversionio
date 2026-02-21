import { Image as ImageIcon } from 'lucide-react'
import * as React from 'react'
import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip'
import type { ImageInsertPopoverProps } from './types'

export function ImageInsertPopover({
  onInsert,
  disabled,
}: ImageInsertPopoverProps) {
  const [open, setOpen] = React.useState(false)
  const [urlValue, setUrlValue] = React.useState('')

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (urlValue.trim()) {
      onInsert(urlValue.trim())
      setUrlValue('')
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              className="h-8 w-8"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Add Image</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-72" align="start">
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div className="text-sm font-medium">Insert Image</div>
          <div className="space-y-1.5">
            <Label htmlFor="image-url" className="text-xs">
              Image URL
            </Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              className="h-9"
            />
          </div>
          <Button type="submit" size="sm" className="w-full" disabled={!urlValue.trim()}>
            Insert Image
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
