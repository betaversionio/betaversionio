'use client';

import { useState, useMemo, useRef } from 'react';
import { ALIASES } from '@/lib/tech-icons';
import { TechBadge } from '@/components/shared/tech-badge';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

const ALL_TECHS = Object.keys(ALIASES);

interface TechStackInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function TechStackInput({ value, onChange }: TechStackInputProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_TECHS.filter(
      (t) => t.includes(q) && !value.includes(t),
    ).slice(0, 8);
  }, [query, value]);

  function addTech(tech: string) {
    if (!value.includes(tech)) {
      onChange([...value, tech]);
    }
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  function removeTech(tech: string) {
    onChange(value.filter((t) => t !== tech));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = query.trim().toLowerCase();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setQuery('');
      setOpen(false);
    }
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tech) => (
            <Badge key={tech} variant="secondary" className="gap-1 pr-1">
              <TechBadge name={tech} variant="secondary" className="border-0 bg-transparent p-0 shadow-none" />
              <button
                type="button"
                onClick={() => removeTech(tech)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Search technologies..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => query.trim() && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          onKeyDown={handleKeyDown}
        />

        {open && suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
            {suggestions.map((tech) => (
              <button
                key={tech}
                type="button"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addTech(tech);
                }}
              >
                <TechBadge
                  name={tech}
                  variant="outline"
                  className="border-0 bg-transparent p-0 shadow-none text-xs"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
