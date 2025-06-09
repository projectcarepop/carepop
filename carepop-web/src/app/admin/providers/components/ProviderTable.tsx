'use client';

import * as React from 'react';
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
import { AppError } from '@/lib/utils';
import { useImperativeHandle, forwardRef } from 'react';

export interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialization?: string | null;
  licenseNumber?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendProviderData {
  id: string;
  first_name: string;
  last_name: string;
  contact_email: string;
  specialization?: string | null;
  license_number?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderTableHandle {
  refreshData: () => void;
}

const ProviderTable = forwardRef<ProviderTableHandle>((props, ref) => {
  const [data, setData] = React.useState<Provider[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [limit] = React.useState(10);
  const [search, setSearch] = React.useState('');
  
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not authenticated.');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);

      const response = await fetch(`/api/v1/admin/providers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch providers.');
      }

      const result = await response.json();
      const mappedData = result.data.map((p: BackendProviderData) => ({
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        email: p.contact_email,
        specialization: p.specialization,
        licenseNumber: p.license_number,
        isActive: p.is_active,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      setData(mappedData);
      setTotalPages(result.meta.totalPages);
    } catch (e) {
      const error = e as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, supabase.auth]);

  useImperativeHandle(ref, () => ({
    refreshData: fetchData,
  }));

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this provider? This action cannot be undone.')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new AppError("Not authenticated");
      
      const response = await fetch(`/api/v1/admin/providers/${providerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new AppError(errorData.message || 'Failed to delete provider.');
      }
      
      toast({
        title: "Success",
        description: "Provider deleted successfully."
      });
      fetchData();

    } catch (err) {
      const error = err as AppError | Error;
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<Provider>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const provider = row.original;
        return <div className="font-medium">{`${provider.firstName} ${provider.lastName}`}</div>;
      },
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'specialization',
      header: 'Specialization',
      cell: ({ row }) => row.getValue('specialization') || 'N/A',
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
        const provider = row.original;
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
                <DropdownMenuItem asChild>
                  <Link href={`/admin/providers/${provider.id}/edit`}>Edit Provider</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href={`/admin/providers/${provider.id}/services`}>
                      Manage Services
                   </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(provider.id)} className="text-destructive">
                  Delete Provider
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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    manualPagination: true,
    pageCount: totalPages,
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by name, email, specialization..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-destructive">{error}</TableCell>
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span className="text-sm">Page {page} of {totalPages}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>
    </div>
  );
});

ProviderTable.displayName = 'ProviderTable';

export { ProviderTable }; 