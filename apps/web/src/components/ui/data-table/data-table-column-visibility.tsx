import { Column } from '@tanstack/react-table';
import { Columns3 } from 'lucide-react';

import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';

interface DataTableColumnVisibilityProps<TData> {
  columns: Column<TData, unknown>[];
}

function getColumnDisplayName<TData>(column: Column<TData, unknown>): string {
  const meta = column.columnDef.meta as { title?: string } | undefined;
  if (meta?.title) return meta.title;
  const header = column.columnDef.header;
  return typeof header === 'string'
    ? header
    : column.id
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .trim();
}

export function DataTableColumnVisibility<TData>({
  columns,
}: DataTableColumnVisibilityProps<TData>) {
  const hideableColumns = columns.filter((column) => column.getCanHide());

  if (hideableColumns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Columns3 className="mr-2 h-4 w-4" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {getColumnDisplayName(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
