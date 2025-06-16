'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import useSWR from 'swr';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { AppError, fetcher } from '@/lib/utils';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { TServiceCategory } from '@/lib/types/service-category.types';

export default function ServiceCategoryTable() {
  const [data, setData] = React.useState<TServiceCategory[]>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = React.useState(0);
  const [token, setToken] = React.useState<string | null>(null);

  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setToken(session?.access_token || null);
    };
    fetchToken();
  }, [supabase.auth]);

  const apiUrl = React.useMemo(() => {
    const params = new URLSearchParams();
    params.append('page', (pagination.pageIndex + 1).toString());
    params.append('limit', pagination.pageSize.toString());
    return `/api/v1/admin/service-categories?${params.toString()}`;
  }, [pagination]);

  const { data: result, error: swrError, isLoading, mutate } = useSWR(
    token ? [apiUrl, token] : null,
    fetcher
  );

  React.useEffect(() => {
    if (result?.data?.data) {
      setData(result.data.data);
      if (result.data.meta) {
        setTotalPages(result.data.meta.totalPages);
      }
    }
  }, [result]);

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new AppError('Not authenticated', {} as Response);

      const response = await fetch(`/api/v1/admin/service-categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new AppError(errorData.message || 'Failed to delete category.', response);
      }

      toast({
        title: 'Success',
        description: 'Service category deleted successfully.',
      });
      mutate(); // Revalidate data
    } catch (err: unknown) {
      const error = err as AppError | Error;
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<TServiceCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.getValue('description') || 'N/A',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const category = row.original;
        if (!category.id) return null;

        return (
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
                  <Link href={`/admin/service-categories/${category.id}/edit`}>Edit Category</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(category.id!)} className="text-destructive">
                  Delete Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  if (swrError) return <div>Failed to load service categories.</div>;

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? 'Loading...' : 'No results.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
} 