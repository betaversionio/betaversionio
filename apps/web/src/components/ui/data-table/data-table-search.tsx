import { Search, X } from 'lucide-react'
import { useCallback, useRef } from 'react'

import { Input } from '../input'

interface DataTableSearchProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
}

export function DataTableSearch({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
}: DataTableSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = useCallback(() => {
    onClear()
    inputRef.current?.focus()
  }, [onClear])

  return (
    <div className="relative flex-1 sm:max-w-sm">
      <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
