'use client';

import React from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { ConfirmAppointmentDialog } from './ConfirmAppointmentDialog';
import { CancelAppointmentDialog } from './CancelAppointmentDialog';
import { DeleteAppointmentDialog } from './DeleteAppointmentDialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from 'use-debounce';

export interface Appointment {
  id: string;
  status: string;
  appointment_datetime: string;
  cancellation_reason?: string | null;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  service: {
    name: string;
  } | null;
  provider: {
    first_name: string;
    last_name: string;
  } | null;
}

export const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Appt. ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="truncate w-24">{row.getValue("id")}</div>
    },
    {
      id: 'patientName',
      header: 'Patient Name',
      cell: ({ row }) => {
        const user = row.original.user;
        return user ? `${user.first_name} ${user.last_name}` : 'N/A';
      },
    },
    {
      id: 'patientEmail',
      header: 'Email',
      cell: ({ row }) => row.original.user?.email ?? 'N/A',
    },
    {
      id: 'service',
      header: 'Service',
      cell: ({ row }) => row.original.service?.name ?? 'N/A',
    },
    {
      id: 'provider',
      header: 'Provider',
      cell: ({ row }) => {
          const provider = row.original.provider;
          return provider ? `${provider.first_name} ${provider.last_name}` : 'N/A';
      }
    },
    {
      accessorKey: "appointment_datetime",
      header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4"
            >
              Date/Time
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      cell: ({ row }) => new Date(row.getValue("appointment_datetime")).toLocaleString(),
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const appointment = row.original
   
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
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(appointment.id)}
              >
                Copy Appt. ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <ConfirmAppointmentDialog appointmentId={appointment.id} currentStatus={appointment.status} />
              <CancelAppointmentDialog appointmentId={appointment.id} currentStatus={appointment.status} />
              <DropdownMenuItem asChild>
                <Link href={`/admin/appointments/${appointment.id}/report`}>
                  View/Create Report
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteAppointmentDialog appointmentId={appointment.id} />
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
]

interface AppointmentTableClientProps {
  data: Appointment[];
  totalRecords: number;
  error: string | null;
}

export function AppointmentTableClient({ data, totalRecords, error }: AppointmentTableClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = React.useState(false);

  // Pagination and Sorting State from URL
  const page = searchParams.get('page') ?? '1';
  const per_page = searchParams.get('per_page') ?? '10';
  const sort = searchParams.get('sort') ?? 'appointment_datetime.desc';

  const [sorting, setSorting] = React.useState<SortingState>(() => {
    const [id, order] = sort.split('.');
    return [{ id, desc: order === 'desc' }];
  });

  const [pagination, setPagination] = React.useState({
    pageIndex: Number(page) - 1,
    pageSize: Number(per_page),
  });
  
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('search') || '');
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  // Effect to handle navigation changes for search, sort, and pagination
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams);
    // Set loading state to true whenever we are about to navigate
    setIsLoading(true);

    params.set('page', String(pagination.pageIndex + 1));
    params.set('per_page', String(pagination.pageSize));
    
    if (sorting.length > 0) {
      params.set('sort', `${sorting[0].id}.${sorting[0].desc ? 'desc' : 'asc'}`);
    } else {
        params.delete('sort');
    }

    if(debouncedSearch) {
        params.set('search', debouncedSearch);
        // Reset to first page on a new search
        if (String(pagination.pageIndex + 1) !== '1') {
            params.set('page', '1');
            // This state update will trigger another re-render, but it's necessary
            // to keep the table's state in sync with the URL.
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }
    } else {
        params.delete('search');
    }
    
    router.replace(`${pathname}?${params.toString()}`);

    // We can't know exactly when the server will respond, but we can turn off loading
    // after a short delay to give feedback. The suspense boundary handles initial load.
    const timer = setTimeout(() => setIsLoading(false), 300); // Adjust delay as needed
    return () => clearTimeout(timer);

  }, [pagination, sorting, debouncedSearch, router, pathname, searchParams]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    pageCount: Math.ceil(totalRecords / pagination.pageSize),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  if (error) {
    return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
    )
  }

  return (
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder="Search by name, email, service..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border overflow-x-auto relative">
          {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <p>Loading...</p>
              </div>
          )}
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
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
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
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="py-4">
          <DataTablePagination table={table} />
        </div>
      </div>
  )
}