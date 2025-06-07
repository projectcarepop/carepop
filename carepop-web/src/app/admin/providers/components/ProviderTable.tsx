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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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

// Define an interface for the raw backend data structure (snake_case)
interface BackendProviderData {
  id: string;
  user_id?: string | null;
  first_name: string;
  last_name: string;
  contact_email: string; // Assuming email comes as contact_email from backend based on common patterns
  email?: string; // Keep if backend might send 'email' too
  specialization?: string | null;
  license_number?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Add any other fields that come from the backend in snake_case
}

export const columns: ColumnDef<Provider>[] = [
  {
    accessorKey: 'firstName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        First Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Last Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div>{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'specialization',
    header: 'Specialization',
    cell: ({ row }) => <div>{row.getValue('specialization') || 'N/A'}</div>,
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('isActive') ? 'default' : 'secondary'}>
        {row.getValue('isActive') ? 'Active' : 'Inactive'}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      if (Array.isArray(value)) {
        return value.includes(row.getValue(id)?.toString() || '');
      }
      return (row.getValue(id)?.toString() || '') === value;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const provider = row.original;
      return (
        <>
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
                 <Link href={`/admin/providers/${provider.id}/edit`} className="flex items-center">
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 hover:!text-red-700 flex items-center cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete (TODO)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];

export function ProviderTable() {
  const [data, setData] = React.useState<Provider[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'lastName', desc: false },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      // Maps frontend camelCase sort IDs to backend snake_case column names
      const sortColumnMap: { [key: string]: string } = {
        firstName: 'first_name',
        lastName: 'last_name',
        email: 'email',
        createdAt: 'created_at',
      };

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          throw new Error(sessionError?.message || 'User not authenticated.');
        }

        const token = sessionData.session.access_token;

        // Build query params from table state
        const params = new URLSearchParams();
        if (sorting.length > 0) {
          const sort = sorting[0];
          const backendSortKey = sortColumnMap[sort.id] || 'created_at';
          params.append('sortBy', backendSortKey);
          params.append('sortOrder', sort.desc ? 'desc' : 'asc');
        } else {
          // Default sort if none is selected
          params.append('sortBy', 'created_at');
          params.append('sortOrder', 'desc');
        }

        const queryString = params.toString();
        const apiUrl = `/api/v1/admin/providers${queryString ? `?${queryString}` : ''}`;
        
        console.log(`[ProviderTable] Fetching data from: ${apiUrl}`);

        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }); 
        if (!response.ok) {
          if (response.status === 401) throw new Error('Unauthorized: Access token might be invalid or expired.');
          if (response.status === 403) throw new Error('Forbidden: You do not have permission to access this resource.');
          throw new Error(`Failed to fetch providers: ${response.statusText} (Status: ${response.status})`);
        }
        const result = await response.json();
        // Transform snake_case to camelCase for specified fields
        const transformedData = (result.data || []).map((provider: BackendProviderData) => ({
          ...provider, // Spread first to carry over fields like id, specialization, etc.
          firstName: provider.first_name,
          lastName: provider.last_name,
          email: provider.contact_email || provider.email, // Use contact_email or fallback to email
          isActive: provider.is_active,
          createdAt: provider.created_at,
          updatedAt: provider.updated_at,
          licenseNumber: provider.license_number,
          // user_id is not in Provider interface, so it will be omitted unless added to Provider
        }));
        setData(transformedData);
      } catch (e: unknown) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred');
        }
        setData([]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [sorting, columnFilters, supabase]);

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (isLoading) {
    return <div>Loading providers...</div>;
  }

  if (error) {
    if (error.toLowerCase().includes('unauthorized') || error.toLowerCase().includes('not authenticated')) {
        return <div className="text-red-500">Error: Authentication failed. Please ensure you are logged in as an admin.</div>;
    }
    if (error.toLowerCase().includes('forbidden')) {
        return <div className="text-red-500">Error: Access Denied. You do not have the necessary permissions.</div>;
    }
    return <div className="text-red-500">Error fetching providers: {error}</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Filter by name/specialization..."
          value={(table.getColumn('firstName')?.getFilterValue() as string) ?? ''}
          onChange={(event) => {
            table.getColumn('firstName')?.setFilterValue(event.target.value);
          }}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
                key="all-status"
                checked={!table.getColumn('isActive')?.getFilterValue()}
                onCheckedChange={() => table.getColumn('isActive')?.setFilterValue(undefined)}
            >
                All Statuses
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
                key="active-status"
                checked={table.getColumn('isActive')?.getFilterValue() === 'true'}
                onCheckedChange={() => table.getColumn('isActive')?.setFilterValue('true')}
            >
                Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
                key="inactive-status"
                checked={table.getColumn('isActive')?.getFilterValue() === 'false'}
                onCheckedChange={() => table.getColumn('isActive')?.setFilterValue('false')}
            >
                Inactive
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.replace(/_/g, ' ')}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
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
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Page {table.getState().pagination?.pageIndex !== undefined ? table.getState().pagination.pageIndex + 1 : 1} of{" "}
          {table.getPageCount() > 0 ? table.getPageCount() : 1} 
          (Total: {table.getFilteredRowModel().rows.length} rows)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
} 