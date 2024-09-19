"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import React from "react";

interface DataProposalTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataProposalTable<TData, TValue>({
  columns,
  data,
}: DataProposalTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Procurar por cliente..."
            value={
              (table.getColumn("customer_name")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("customer_name")
                ?.setFilterValue(event.target.value)
            }
            className="pl-10 w-full"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="bg-slate-200 text-right"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="overflow-y-auto">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-12"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`${
                        cell.column.id === "customer_name"
                          ? "text-left"
                          : "text-right"
                      } whitespace-nowrap overflow-hidden text-ellipsis`}
                    >
                      <div>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-12 text-center"
                >
                  <span className="text-secondary-foreground">
                    Propostas não encontradas.
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getFilteredRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <span className="text-sm text-secondary-foreground">
            {table.getFilteredRowModel().rows.length === 1
              ? `01 proposta`
              : `${table
                  .getFilteredRowModel()
                  .rows.length.toString()
                  .padStart(2, "0")} propostas`}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-foreground">
              {`(${
                table.getState().pagination.pageIndex + 1
              } de ${table.getPageCount()})`}
            </span>
            <Button
              variant="default"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={`${!table.getCanPreviousPage() && "hidden"}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={`${!table.getCanNextPage() && "hidden"} align-middle`}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
