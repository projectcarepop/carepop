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
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';

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

// Frontend data structure (camelCase)
export interface Clinic {
  id: string;
  name: string;
  fullAddress?: string | null;
  locality?: string | null;
  region?: string | null;
  contactPhone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Type for the raw clinic data from the API
interface RawClinicData {
  id: string;
  name: string;
  full_address?: string | null;
  locality?: string | null;
  region?: string | null;
  contact_phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function ClinicTable() {
  const [data, setData] = React.useState<Clinic[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  
  const [pagination, setPagination] = React.useState({
    pageIndex: 0, // tanstack-table uses 0-indexed pages
    pageSize: 10,
  });
  const [totalPages, setTotalPages] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500); // 500ms delay
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
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    return `/api/v1/admin/clinics?${params.toString()}`;
  }, [pagination, debouncedSearchTerm]);

  const { data: result, error: swrError, isLoading, mutate } = useSWR(
    token ? [apiUrl, token] : null, 
    fetcher
  );

  React.useEffect(() => {
    if (result) {
      const mappedData = result.data.map((c: RawClinicData) => ({
        id: c.id,
        name: c.name,
        fullAddress: c.full_address,
        locality: c.locality,
        region: c.region,
        contactPhone: c.contact_phone,
        isActive: c.is_active,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
      setData(mappedData);
      setTotalPages(result.meta.totalPages);
    }
  }, [result]);
  
  const handleDelete = async (clinicId: string) => {
    if (!confirm('Are you sure you want to delete this clinic? This action cannot be undone.')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new AppError("Not authenticated", {} as Response);
      
      const response = await fetch(`/api/v1/admin/clinics/${clinicId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new AppError(errorData.message || 'Failed to delete clinic.', response);
      }
      
      toast({
        title: "Success",
        description: "Clinic deleted successfully."
      });
      mutate(); // Revalidate data after delete

    } catch (err: unknown) {
      const error = err as AppError | Error;
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const columns: ColumnDef<Clinic>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'locality',
      header: 'Location',
      cell: ({ row }) => {
        const clinic = row.original;
        return `${clinic.locality || 'N/A'}, ${clinic.region || 'N/A'}`;
      },
    },
    {
      accessorKey: 'contactPhone',
      header: 'Contact Phone',
      cell: ({ row }) => row.getValue('contactPhone') || 'N/A',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive');
        return <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</Badge>;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const clinic = row.original;
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
                  <Link href={`/admin/clinics/${clinic.id}/edit`}>Edit Clinic</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(clinic.id)} className="text-destructive">
                  Delete Clinic
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
          placeholder="Filter clinics by name, location..."
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : swrError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-destructive">
                  {swrError.message}
                </TableCell>
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
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