'use client';

import React from 'react';
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetcher } from '@/lib/utils';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import Link from 'next/link';
import { ConfirmAppointmentDialog } from './ConfirmAppointmentDialog';
import { CancelAppointmentDialog } from './CancelAppointmentDialog';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export interface Appointment {
  id: string;
  status: string;
  appointment_datetime: string;
  cancellation_reason?: string | null;
  users: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  services: {
    name: string;
  } | null;
  providers: {
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
      const user = row.original.users;
      return user ? `${user.first_name} ${user.last_name}` : 'N/A';
    },
  },
  {
    id: 'patientEmail',
    header: 'Email',
    cell: ({ row }) => row.original.users?.email ?? 'N/A',
  },
  {
    id: 'service',
    header: 'Service',
    cell: ({ row }) => row.original.services?.name ?? 'N/A',
  },
  {
    id: 'provider',
    header: 'Provider',
    cell: ({ row }) => {
        const provider = row.original.providers;
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
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function AppointmentTable({ clinicId }: { clinicId: string }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [accessToken, setAccessToken] = React.useState<string | null>(null);
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  React.useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAccessToken(session?.access_token || null);
    };
    getSession();
  }, [supabase]);

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

  const url = clinicId && accessToken ? 
    `${apiUrl}/api/v1/admin/appointments?clinicId=${clinicId}&page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}&search=${debouncedSearch}` 
    : null;
  
  const { data, error, isLoading } = useSWR(
    url ? [url, accessToken] : null, 
    fetcher
  );

  const tableData = React.useMemo(() => data?.data || [], [data]);
  const totalRecords = React.useMemo(() => data?.total || 0, [data]);

  const table = useReactTable({
    data: tableData,
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
    manualSorting: false,
    manualFiltering: true,
  });

  if (!apiUrl) return <div>Backend API URL not configured.</div>
  if (error && url) return <div>Failed to load appointments. Please try again.</div>;

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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-left px-6 py-3">
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
                      <TableCell key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {isLoading ? "Loading appointments..." : "No results found."}
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
  );
} 