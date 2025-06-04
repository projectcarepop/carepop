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
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Assuming this is your Supabase client helper

// Frontend data structure (camelCase)
export interface Clinic {
  id: string;
  name: string;
  fullAddress?: string | null;
  streetAddress?: string | null;
  locality?: string | null;       // e.g., City
  region?: string | null;         // e.g., State/Province
  postalCode?: string | null;
  countryCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  websiteUrl?: string | null;
  operatingHours?: string | null; // Simple string as per new requirement
  servicesOffered?: string[] | null; // Array of strings
  fpopChapterAffiliation?: string | null;
  additionalNotes?: string | null;
  isActive: boolean;
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
}

// Backend data structure (snake_case)
interface BackendClinicData {
  id: string;
  name: string;
  full_address?: string | null;
  street_address?: string | null;
  locality?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  website_url?: string | null;
  operating_hours?: string | null;
  services_offered?: string[] | null;
  fpop_chapter_affiliation?: string | null;
  additional_notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const columns: ColumnDef<Clinic>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => <div>{row.getValue('city') || 'N/A'}</div>,
  },
  {
    accessorKey: 'contactPhone',
    header: 'Phone',
    cell: ({ row }) => <div>{row.getValue('contactPhone') || 'N/A'}</div>,
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
      const clinic = row.original;
      return (
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
              <Link href={`/admin/clinics/${clinic.id}/edit`} className="flex items-center cursor-pointer">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            {/* TODO: Implement View Details link if applicable */}
            {/* <DropdownMenuItem asChild>
              <Link href={`/admin/clinics/${clinic.id}`} className="flex items-center cursor-pointer">
                <ExternalLink className="mr-2 h-4 w-4" /> View Details
              </Link>
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 hover:!text-red-700 flex items-center cursor-pointer"
              onClick={() => {
                // TODO: Implement delete confirmation and API call
                console.warn(`TODO: Implement delete for clinic ID: ${clinic.id}`);
                alert(`TODO: Implement delete for clinic: ${clinic.name}`);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function ClinicTable() {
  const [data, setData] = React.useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({}); // For future use if checkboxes are needed
  
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
          throw new Error(sessionError?.message || 'User not authenticated.');
        }

        const token = sessionData.session.access_token;
        // IMPORTANT: This API endpoint /api/v1/admin/clinics needs to be created in your backend.
        const response = await fetch('/api/v1/admin/clinics', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) throw new Error('Unauthorized: Access token might be invalid or expired.');
          if (response.status === 403) throw new Error('Forbidden: You do not have permission to access this resource.');
          throw new Error(`Failed to fetch clinics: ${response.statusText} (Status: ${response.status})`);
        }
        
        const result = await response.json();
        
        // Transform snake_case from backend to camelCase for frontend
        const transformedData = (result.data || []).map((clinic: BackendClinicData) => ({
          id: clinic.id,
          name: clinic.name,
          fullAddress: clinic.full_address,
          streetAddress: clinic.street_address,
          locality: clinic.locality,
          region: clinic.region,
          postalCode: clinic.postal_code,
          countryCode: clinic.country_code,
          latitude: clinic.latitude,
          longitude: clinic.longitude,
          contactPhone: clinic.contact_phone,
          contactEmail: clinic.contact_email,
          websiteUrl: clinic.website_url,
          operatingHours: clinic.operating_hours,
          servicesOffered: clinic.services_offered,
          fpopChapterAffiliation: clinic.fpop_chapter_affiliation,
          additionalNotes: clinic.additional_notes,
          isActive: clinic.is_active,
          createdAt: clinic.created_at,
          updatedAt: clinic.updated_at,
        }));
        setData(transformedData);
      } catch (e: unknown) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred while fetching clinics.');
        }
        setData([]); // Clear data on error
      }
      setIsLoading(false);
    };
    fetchData();
  }, [supabase]); // Removed sorting and columnFilters from dependency array for now, add back if server-side sorting/filtering is implemented

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // For client-side pagination
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // For client-side filtering
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    // Manual pagination and filtering can be enabled if data fetching is handled server-side per change
    // manualPagination: true, 
    // manualFiltering: true,
  });

  if (isLoading) {
    return <div className="text-center p-4">Loading clinics...</div>;
  }

  if (error) {
    if (error.toLowerCase().includes('unauthorized') || error.toLowerCase().includes('not authenticated')) {
        return <div className="text-red-500 text-center p-4">Error: Authentication failed. Please ensure you are logged in as an admin.</div>;
    }
    if (error.toLowerCase().includes('forbidden')) {
        return <div className="text-red-500 text-center p-4">Error: Access Denied. You do not have the necessary permissions to view clinics.</div>;
    }
    return <div className="text-red-500 text-center p-4">Error fetching clinics: {error}</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by clinic name..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
                    {column.id}
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
                  No clinics found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {/* {table.getFilteredSelectedRowModel().rows.length} of{' '} */}
          {table.getFilteredRowModel().rows.length} row(s) displayed.
          {/* TODO: Add total row count from server if using server-side pagination */}
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