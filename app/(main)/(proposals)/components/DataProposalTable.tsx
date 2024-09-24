"use client";
import { createClient } from "@/utils/supabase/client";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [proposalFilter, setProposalFilter] = React.useState("all");
  const [userId, setUserId] = React.useState<string | null>(null);

  const supabase = createClient();

  React.useEffect(() => {
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    getUserId();
  }, [supabase]);

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
      globalFilter: proposalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
    filterFns: {
      myProposals: (row, columnId, filterValue) => {
        if (filterValue === "all") return true;
        const rowCreatedBy: String[] = row.getValue("created_by");
        const isMyProposal = rowCreatedBy[0] === userId;
        return isMyProposal;
      },
    },
    globalFilterFn: ((row, columnId, filterValue) => {
      if (filterValue === "all") return true;
      if (filterValue === "my") {
        const rowCreatedBy: String[] = row.getValue("created_by");
        return rowCreatedBy[0] === userId;
      }
      return false;
    }) as FilterFn<TData>,
  });

  return (
    <div>
      <div className="flex items-center py-4 gap-4">
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

        <RadioGroup
          defaultValue="all"
          onValueChange={(value) => {
            setProposalFilter(value);
          }}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all">Todas</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="my" id="my" />
            <Label htmlFor="my">Minhas Propostas</Label>
          </div>
        </RadioGroup>
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
