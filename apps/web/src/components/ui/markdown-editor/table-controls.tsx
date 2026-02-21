import * as React from 'react'
import { Columns, Rows, Table as TableIcon, Trash2 } from 'lucide-react'
import { Button } from '../button'
import { Input } from '../input'
import { Label } from '../label'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '../tooltip'
import type { TableControlsDropdownProps } from './types'

export function TableControlsDropdown({ editor, disabled }: TableControlsDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [rows, setRows] = React.useState(3)
  const [cols, setCols] = React.useState(3)

  const isInTable = editor?.isActive('table') ?? false

  const handleInsertTable = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    setOpen(false)
    setRows(3)
    setCols(3)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={isInTable ? 'secondary' : 'ghost'}
              size="icon-sm"
              disabled={disabled}
              className="h-8 w-8"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Table</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-52 p-0">
        {!isInTable ? (
          <form onSubmit={handleInsertTable} onClick={(e) => e.stopPropagation()} className="p-3 space-y-3">
            <div className="text-sm font-medium">Insert Table</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="table-rows" className="text-xs">
                  Rows
                </Label>
                <Input
                  id="table-rows"
                  type="number"
                  min={1}
                  max={20}
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="table-cols" className="text-xs">
                  Columns
                </Label>
                <Input
                  id="table-cols"
                  type="number"
                  min={1}
                  max={10}
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="h-8"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              className="w-full"
              onClick={(e) => e.stopPropagation()}
            >
              Insert
            </Button>
          </form>
        ) : (
          <div className="p-1">
            <button
              type="button"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                editor?.chain().focus().addRowBefore().run()
                setOpen(false)
              }}
            >
              <Rows className="mr-2 h-4 w-4" />
              Add Row Above
            </button>
            <button
              type="button"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                editor?.chain().focus().addRowAfter().run()
                setOpen(false)
              }}
            >
              <Rows className="mr-2 h-4 w-4" />
              Add Row Below
            </button>
            <button
              type="button"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                editor?.chain().focus().deleteRow().run()
                setOpen(false)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Row
            </button>

            <div className="my-1 h-px bg-border" />

            <button
              type="button"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                editor?.chain().focus().addColumnBefore().run()
                setOpen(false)
              }}
            >
              <Columns className="mr-2 h-4 w-4" />
              Add Column Left
            </button>
            <button
              type="button"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                editor?.chain().focus().addColumnAfter().run()
                setOpen(false)
              }}
            >
              <Columns className="mr-2 h-4 w-4" />
              Add Column Right
            </button>
            <button
              type="button"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                editor?.chain().focus().deleteColumn().run()
                setOpen(false)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Column
            </button>

            <div className="my-1 h-px bg-border" />

            <button
              type="button"
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              onClick={() => {
                editor?.chain().focus().deleteTable().run()
                setOpen(false)
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Table
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
