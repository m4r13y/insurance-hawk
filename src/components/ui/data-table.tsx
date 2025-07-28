"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDownIcon, MagnifyingGlassIcon, GearIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { EmptyState } from "@/components/ui/empty-state"
import { Spinner } from "@/components/ui/spinner"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: keyof TData
  searchPlaceholder?: string
  onRowSelect?: (rows: TData[]) => void
  loading?: boolean
  pagination?: boolean
  pageSize?: number
  className?: string
  emptyState?: {
    title: string
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  onRowSelect,
  loading = false,
  pagination = true,
  pageSize = 10,
  className,
  emptyState = {
    title: "No data available",
    description: "There are no items to display."
  }
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState("")

  // Add selection column if onRowSelect is provided
  const selectColumn: ColumnDef<TData> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  }

  const tableColumns = onRowSelect ? [selectColumn, ...columns] : columns

  const table = useReactTable({
    data,
    columns: tableColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  // Notify parent of selected rows
  React.useEffect(() => {
    if (onRowSelect) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
      onRowSelect(selectedRows)
    }
  }, [rowSelection, onRowSelect, table])

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="h-9 w-[300px] animate-pulse rounded-md bg-muted" />
          </div>
          <div className="h-9 w-[100px] animate-pulse rounded-md bg-muted" />
        </div>
        <div className="rounded-md border">
          <div className="p-8">
            <div className="flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const showEmptyState = !loading && table.getRowModel().rows?.length === 0

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {searchKey && (
            <div className="relative w-full max-w-sm">
              <MagnifyingGlassIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-8"
              />
            </div>
          )}
          {onRowSelect && table.getFilteredSelectedRowModel().rows.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected
            </div>
          )}
        </div>
        
        {/* Column visibility toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <GearIcon className="mr-2 h-4 w-4" />
              View
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[150px]">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {showEmptyState ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 p-0">
                  <EmptyState
                    title={emptyState.title}
                    description={emptyState.description}
                    action={emptyState.action}
                    size="sm"
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && !showEmptyState && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Pagination
            currentPage={table.getState().pagination.pageIndex + 1}
            totalPages={table.getPageCount()}
            onPageChange={(page) => table.setPageIndex(page - 1)}
          />
        </div>
      )}
    </div>
  )
}

export type { ColumnDef } from "@tanstack/react-table"
