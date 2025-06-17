'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { ColumnDef, useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, SortingState, getSortedRowModel } from '@tanstack/react-table';
import { ISupplier } from './suppliers-list';
import { DeleteSupplierDialog } from './DeleteSupplierDialog';

interface SuppliersListClientProps {
  data: ISupplier[];
  totalRecords: number;
}

export function SuppliersListClient({ data, totalRecords }: SuppliersListClientProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = React.useState<string | null>(null);

    const currentPage = Number(searchParams.get('page')) || 1;
    const currentPerPage = Number(searchParams.get('per_page')) || 10;
    const currentSearch = searchParams.get('search') || '';
    const currentSort = searchParams.get('sort') || 'name.asc';

    const [sorting, setSorting] = React.useState<SortingState>([
        { id: currentSort.split('.')[0], desc: currentSort.split('.')[1] === 'desc' },
    ]);

    const createQueryString = React.useCallback(
        (params: Record<string, string | number | null>) => {
        const newSearchParams = new URLSearchParams(searchParams?.toString());
        for (const [key, value] of Object.entries(params)) {
            if (value === null) {
            newSearchParams.delete(key);
            } else {
            newSearchParams.set(key, String(value));
            }
        }
        return newSearchParams.toString();
        },
        [searchParams]
    );

    const handleSearch = useDebouncedCallback((term: string) => {
        const newParams = createQueryString({ search: term || null, page: 1 });
        replace(`${pathname}?${newParams}`);
    }, 300);

    const handlePageChange = (pageIndex: number) => {
        replace(`${pathname}?${createQueryString({ page: pageIndex + 1 })}`);
    };

    const handlePageSizeChange = (pageSize: number) => {
        replace(`${pathname}?${createQueryString({ per_page: pageSize, page: 1 })}`);
    };

    React.useEffect(() => {
        if (sorting.length > 0) {
        const sort = sorting[0];
        const sortString = `${sort.id}.${sort.desc ? 'desc' : 'asc'}`;
        if (sortString !== currentSort) {
            replace(`${pathname}?${createQueryString({ sort: sortString, page: 1 })}`);
        }
        }
    }, [sorting, pathname, replace, createQueryString, currentSort]);

  const columns = React.useMemo<ColumnDef<ISupplier>[]>(() => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'contact_person', header: 'Contact Person' },
    { accessorKey: 'contact_email', header: 'Contact Email' },
    { 
      accessorKey: 'is_active', 
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/admin/inventory/suppliers/${row.original.id}/edit`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedSupplierId(row.original.id);
                  setDialogOpen(true);
                }} 
                className="text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalRecords / currentPerPage),
    state: {
      sorting,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: currentPerPage,
      },
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
        if (typeof updater === 'function') {
            const newPaginationState = updater({ pageIndex: currentPage - 1, pageSize: currentPerPage });
            if (newPaginationState.pageIndex !== currentPage - 1) {
                handlePageChange(newPaginationState.pageIndex);
            }
            if (newPaginationState.pageSize !== currentPerPage) {
                handlePageSizeChange(newPaginationState.pageSize);
            }
        }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
  });
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Input 
            placeholder="Search by name or contact..."
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                 {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No suppliers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      {selectedSupplierId && (
        <DeleteSupplierDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            supplierId={selectedSupplierId}
        />
      )}
    </div>
  );
} 