import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { flexRender, type Row } from '@tanstack/react-table';
import { GripVertical } from 'lucide-react';
import { TableCell, TableRow } from '../table';

interface DraggableRowProps<TData> {
  row: Row<TData>;
  rowId: string | number;
  /** Row height in pixels */
  rowHeight?: number;
}

export function DraggableRow<TData>({ row, rowId, rowHeight }: DraggableRowProps<TData>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rowId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...(rowHeight ? { height: rowHeight } : {}),
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && 'selected'}
      className={isDragging ? 'bg-muted' : ''}
    >
      {/* Drag handle cell */}
      <TableCell className="w-10 pr-2 pl-3">
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      {/* Regular cells */}
      {row.getVisibleCells().map((cell) => {
        const hasMaxSize = cell.column.columnDef.maxSize !== undefined;
        return (
          <TableCell
            key={cell.id}
            className={hasMaxSize ? 'whitespace-normal' : ''}
            style={{
              minWidth: cell.column.getSize(),
              ...(hasMaxSize ? { maxWidth: cell.column.columnDef.maxSize, overflow: 'hidden' } : {}),
            }}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
