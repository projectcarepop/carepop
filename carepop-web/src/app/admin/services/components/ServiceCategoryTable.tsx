'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { deleteServiceCategory, getAllServiceCategories } from '@/lib/actions/service-categories.admin.actions';
import { useToast } from '@/components/ui/use-toast';
import { AppError } from '@/lib/utils/errors';
import { TServiceCategory } from '@/lib/types/service-category.types';
import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

const ActionsCell = ({ category, onDeleted }: { category: TServiceCategory; onDeleted: () => void }) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this service category?')) return;
    if (!category.id) return;

    try {
      await deleteServiceCategory(category.id);
      toast({
        title: 'Success',
        description: `Service category "${category.name}" deleted successfully.`,
      });
      onDeleted();
    } catch (error) {
      const errorMessage = error instanceof AppError ? error.message : 'An unexpected error occurred.';
      toast({
        title: 'Error',
        description: `Failed to delete category: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/service-categories/${category.id}/edit`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function ServiceCategoryTable() {
  const [data, setData] = useState<TServiceCategory[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const swrKey = useMemo(() => ({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    search: debouncedSearchTerm,
  }), [pagination, debouncedSearchTerm]);

  const { data: result, error, isLoading, mutate } = useSWR(swrKey, getAllServiceCategories);

  const columns: ColumnDef<TServiceCategory>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
      },
      {
        id: 'actions',
        cell: ({ row }) => <ActionsCell category={row.original} onDeleted={mutate} />,
      },
    ],
    [mutate]
  );

  useEffect(() => {
    if (result?.success && result.data) {
      setData(result.data.categories);
      setTotalPages(Math.ceil(result.data.total / pagination.pageSize));
    }
  }, [result, pagination.pageSize]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: totalPages,
    state: {
      sorting,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input
          placeholder="Filter by category name..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-destructive">{error.message}</TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.original.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
} 