'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useState } from 'react';

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  idFieldName?: string;
  isLoading?: boolean;
  noDataText?: string;
  onClick?: (id: unknown) => void;
};

export default function DataTable<TData, TValue>({
  columns,
  data,
  idFieldName = 'id',
  isLoading,
  noDataText = 'No items',
  onClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => {
      const rowWithPossibleId: { [id: string]: string } = row as unknown as {
        [id: string]: string;
      };

      return rowWithPossibleId?.[idFieldName] ?? index.toString();
    },
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const tableBody = isLoading ? (
    <TableRow className="hover:!bg-transparent">
      <TableCell colSpan={columns.length} className="h-24">
        <div className="flex flex-col gap-1 w-full">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </TableCell>
    </TableRow>
  ) : (
    <>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={row.getIsSelected() && 'selected'}
            onClick={() => onClick?.(row.id)}
            className={clsx(onClick && 'cursor-pointer')}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : (
        <TableRow className="hover:!bg-transparent">
          <TableCell colSpan={columns.length} className="h-24 text-center">
            {noDataText}
          </TableCell>
        </TableRow>
      )}
    </>
  );

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>{tableBody}</TableBody>
      </Table>
    </div>
  );
}
