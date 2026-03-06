'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Markdown } from '@/components/ui/markdown';
import { Edit2, Trash } from 'iconsax-react';

interface ItemCardProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  meta?: string;
  dateRange?: string;
  description?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ItemCard({
  icon,
  title,
  subtitle,
  meta,
  dateRange,
  description,
  onEdit,
  onDelete,
}: ItemCardProps) {
  return (
    <div
      className={cn(
        'group flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50',
      )}
    >
      {icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-sm font-medium leading-tight">{title}</h4>
            {(subtitle || meta) && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {subtitle}
                {subtitle && meta && (
                  <span className="mx-1.5 text-muted-foreground/50">·</span>
                )}
                {meta}
              </p>
            )}
          </div>

          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onEdit}
              >
                <Edit2 size={16} color="currentColor" variant="Linear" />
              </Button>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={onDelete}
              >
                <Trash size={16} color="currentColor" variant="Linear" />
              </Button>
            )}
          </div>
        </div>

        {dateRange && (
          <p className="mt-1 text-xs text-muted-foreground">{dateRange}</p>
        )}

        {description && (
          <div className="mt-1.5 line-clamp-2">
            <Markdown content={description} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
