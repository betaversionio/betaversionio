import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '../button';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const isSorted = column.getIsSorted();

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="data-[state=open]:bg-accent -ml-3 h-8 text-sm font-normal">
            <span>{title}</span>
            {isSorted === 'desc' ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : isSorted === 'asc' ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-40 p-1">
          <div className="flex flex-col">
            {column.getCanSort() && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('justify-start', isSorted === 'asc' && 'bg-accent')}
                  onClick={() => column.toggleSorting(false)}
                >
                  <ArrowUp className="text-muted-foreground mr-2 h-4 w-4" />
                  Asc
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn('justify-start', isSorted === 'desc' && 'bg-accent')}
                  onClick={() => column.toggleSorting(true)}
                >
                  <ArrowDown className="text-muted-foreground mr-2 h-4 w-4" />
                  Desc
                </Button>
              </>
            )}
            {column.getCanHide() && (
              <Button
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => column.toggleVisibility(false)}
              >
                <EyeOff className="text-muted-foreground mr-2 h-4 w-4" />
                Hide
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
