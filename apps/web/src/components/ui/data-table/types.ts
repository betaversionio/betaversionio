import { RowData } from '@tanstack/react-table'

// Extend TanStack Table's ColumnMeta
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    title?: string
    defaultHidden?: boolean
  }
}
