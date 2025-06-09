'use client';

import * as React from 'react';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
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
} from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AppError, fetcher } from '@/lib/utils';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

// Frontend data structure (camelCase) for a Service
export interface Service {
  id: string;
  name: string;
  description?: string | null;
  cost?: number | null;
  typicalDurationMinutes?: number | null;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
}

// Raw data type from API (snake_case)
interface RawServiceData {
  id: string;
  name: string;
  description?: string | null;
  cost?: number | null;
  typical_duration_minutes?: number | null;
  is_active: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
}

export function ServiceTable() {
  const [data, setData] = React.useState<Service[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  
  const [pagination, setPagination] = React.useState({
    pageIndex: 0, // DANT-TABLE USES 0-INDEXED PAGES
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
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
    const params = new URLSearchParams({
      page: (pagination.pageIndex + 1).toString(),
      limit: pagination.pageSize.toString(),
    });
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    return `/api/v1/admin/services?${params.toString()}`;
  }, [pagination, debouncedSearchTerm]);

  const { data: result, error: swrError, isLoading, mutate } = useSWR(
    token ? [apiUrl, token] : null,
    fetcher
  );

  React.useEffect(() => {
    if (result) {
      const mappedData = result.data.map((s: RawServiceData) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        cost: s.cost,
        typicalDurationMinutes: s.typical_duration_minutes,
        isActive: s.is_active,
        category: s.category,
      }));

      setData(mappedData);
      setTotalPages(result.meta?.totalPages || 0);
    }
  }, [result]);

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new AppError("Not authenticated", {} as Response);
      
      const response = await fetch(`/api/v1/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new AppError(errorData.message || 'Failed to delete service.', response);
      }
      
      toast({
        title: "Success",
        description: "Service deleted successfully."
      });
      mutate();
    } catch (err) {
      const error = err as AppError | Error;
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
  };

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: 'name',
      header: 'Service Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'category.name',
      header: 'Category',
      cell: ({ row }) => row.original.category?.name || 'N/A',
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      cell: ({ row }) => formatCurrency(row.getValue('cost')),
    },
    {
      accessorKey: 'typicalDurationMinutes',
      header: 'Duration (Mins)',
      cell: ({ row }) => row.getValue('typicalDurationMinutes') || 'N/A',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('isActive') ? 'default' : 'secondary'}>
          {row.getValue('isActive') ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const service = row.original;
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
                  <Link href={`/admin/services/${service.id}/edit`}>Edit Service</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(service.id)} className="text-destructive">
                  Delete Service
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
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by service name..."
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
            ) : swrError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-destructive">{swrError.message}</TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'} className="hover:bg-muted/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
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