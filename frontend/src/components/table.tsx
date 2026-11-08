import type { ReactNode } from 'react'

import { cn } from 'cn'

export interface TableColumn {
  /** Header text. */
  label: string
  /** Right-align the column (numbers, prices). */
  num?: boolean
}

export type TableRow =
  | ReactNode[]
  | ({ cells: ReactNode[]; [key: `data-${string}`]: string } & Omit<React.ComponentProps<'tr'>, 'children'>)

export interface TableProps {
  /** Column definitions; `num` right-aligns the header and its cells. */
  columns: TableColumn[]
  /** One row per entry: cells in column order, or an object with `cells` plus
      extra attributes for the `<tr>` (e.g. to highlight it). */
  rows: TableRow[]
  /** Extra classes on the wrapping box. */
  className?: string
}

/** Data table from the mockup (MK.ui.table → .table): header plus body cells
    inside a rounded, scrollable wrapper with zebra hover on the rows. */
export function Table({ columns, rows, className }: TableProps) {
  const cellClass = (num: boolean | undefined) => cn(num && 'text-right tabular-nums')

  return (
    <div
      data-slot="table-wrap"
      className={cn('overflow-x-auto rounded-[var(--radius-lg)] border bg-surface', className)}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={cn(
                  'whitespace-nowrap bg-surface-2 px-4 py-3 text-left font-medium text-text-muted',
                  cellClass(column.num),
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const { cells, ...attrs } = Array.isArray(row) ? { cells: row } : row
            return (
              <tr key={i} {...attrs}>
                {cells.map((cell, j) => (
                  <td
                    key={j}
                    className={cn('border-t border-border px-4 py-3 align-middle', cellClass(columns[j]?.num))}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
