import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { flexRender, type Table as TanstackTable } from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../table';
import { DraggableRow } from './draggable-row';

interface ServerDataTableContentProps<TData> {
  table: TanstackTable<TData>;
  columnCount: number;
  isLoading?: boolean;
  /** Enable drag-and-drop row reordering */
  draggable?: boolean;
  /** Callback when rows are reordered */
  onReorder?: (activeId: number | string, overId: number | string) => void;
  /** Function to get the unique ID from a row */
  getRowId?: (row: TData) => number | string;
  /** Row height in pixels */
  rowHeight?: number;
}

/**
 * Loading overlay component
 */
function DataTableLoadingOverlay() {
  return (
    <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
      <Loader2 className="text-primary h-6 w-6 animate-spin" />
    </div>
  );
}

/**
 * Column resize handle component
 */
function ColumnResizeHandle({
  onMouseDown,
  onTouchStart,
  isResizing,
}: {
  onMouseDown: React.MouseEventHandler<HTMLDivElement>;
  onTouchStart: React.TouchEventHandler<HTMLDivElement>;
  isResizing: boolean;
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className={`absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize touch-none select-none ${
        isResizing ? 'bg-primary' : 'hover:bg-primary/50 bg-transparent'
      }`}
    />
  );
}

/**
 * Empty state component
 */
function DataTableEmptyState({
  columnCount,
  isLoading,
}: {
  columnCount: number;
  isLoading: boolean;
}) {
  return (
    <TableRow>
      <TableCell colSpan={columnCount} className="h-24 text-center">
        {isLoading ? 'Loading...' : 'No results.'}
      </TableCell>
    </TableRow>
  );
}

/**
 * Default row ID getter - expects objects with 'id' property
 */
function defaultGetRowId<TData>(row: TData): number | string {
  return (row as { id: number | string }).id;
}

/**
 * Table content component for ServerDataTable
 */
export function ServerDataTableContent<TData>({
  table,
  columnCount,
  isLoading = false,
  draggable = false,
  onReorder,
  getRowId = defaultGetRowId,
  rowHeight,
}: ServerDataTableContentProps<TData>) {
  const rows = table.getRowModel().rows;
  const hasRows = rows?.length > 0;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Get row IDs for sortable context
  const rowIds = rows.map((row) => getRowId(row.original));

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && onReorder) {
      onReorder(active.id, over.id);
    }
  };

  // Regular table row rendering (non-draggable)
  const renderRegularRows = () =>
    rows.map((row) => (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && 'selected'}
        style={rowHeight ? { height: rowHeight } : undefined}
      >
        {row.getVisibleCells().map((cell) => {
          const hasMaxSize = cell.column.columnDef.maxSize !== undefined;
          return (
            <TableCell
              key={cell.id}
              className={hasMaxSize ? 'whitespace-normal' : ''}
              style={{
                minWidth: cell.column.getSize(),
                ...(hasMaxSize
                  ? { maxWidth: cell.column.columnDef.maxSize, overflow: 'hidden' }
                  : {}),
              }}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          );
        })}
      </TableRow>
    ));

  // Draggable table row rendering
  const renderDraggableRows = () =>
    rows.map((row) => (
      <DraggableRow key={row.id} row={row} rowId={getRowId(row.original)} rowHeight={rowHeight} />
    ));

  const tableContent = (
    <Table>
      <TableHeader className="bg-card h-12">
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="hover:bg-foreground/5">
            {/* Add empty header for drag handle column */}
            {draggable && <TableHead className="w-10" />}
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                style={{ minWidth: header.getSize() }}
                className="relative"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
                {header.column.getCanResize() && (
                  <ColumnResizeHandle
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    isResizing={header.column.getIsResizing()}
                  />
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {hasRows ? (
          draggable ? (
            renderDraggableRows()
          ) : (
            renderRegularRows()
          )
        ) : (
          <DataTableEmptyState
            columnCount={columnCount + (draggable ? 1 : 0)}
            isLoading={isLoading}
          />
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="relative overflow-x-auto rounded-md border">
      {isLoading && <DataTableLoadingOverlay />}
      {draggable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
            {tableContent}
          </SortableContext>
        </DndContext>
      ) : (
        tableContent
      )}
    </div>
  );
}
