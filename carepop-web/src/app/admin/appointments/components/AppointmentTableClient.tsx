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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export interface Appointment {
  id: string;
  startTime: string;
  status: string;
  notes: string | null;
  cancellation_reason?: string | null;
  patient: {
    fullName: string;
    email: string;
    contactNo: string | null;
  } | null;
  service: {
    name: string;
    price: number | null;
    durationMinutes: number | null;
  } | null;
  provider: {
    fullName: string;
  } | null;
}

const StatusBadge = ({ status }: { status: string }) => {
    const statusVariant = {
      pending_confirmation: 'secondary',
      confirmed: 'default',
      cancelled_by_user: 'destructive',
      cancelled_by_clinic: 'destructive',
      completed: 'success',
      no_show: 'outline',
    }[status] || 'secondary';
  
    return <Badge variant={statusVariant as any}>{status.replace(/_/g, ' ')}</Badge>;
};

export const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
          Appt. ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="truncate w-24">{row.getValue("id")}</div>
    },
    {
      header: 'Patient Name',
      accessorKey: 'patient.fullName',
      cell: ({ row }) => row.original.patient?.fullName ?? 'N/A',
    },
    {
      header: 'Contact No.',
      accessorKey: 'patient.contactNo',
      cell: ({ row }) => row.original.patient?.contactNo ?? 'N/A',
    },
    {
      header: 'Email',
      accessorKey: 'patient.email',
      cell: ({ row }) => row.original.patient?.email ?? 'N/A',
    },
    {
      header: 'Service',
      accessorKey: 'service.name',
      cell: ({ row }) => row.original.service?.name ?? 'N/A',
    },
    {
      header: 'Price',
      accessorKey: 'service.price',
      cell: ({ row }) => {
        const price = row.original.service?.price;
        return price ? `₱${Number(price).toFixed(2)}` : 'N/A';
      }
    },
    {
      header: 'Provider',
      accessorKey: 'provider.fullName',
       cell: ({ row }) => row.original.provider?.fullName ?? 'N/A',
    },
    {
      accessorKey: "startTime",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="-ml-4">
          Date/Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => new Date(row.getValue("startTime")).toLocaleString(),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      header: 'Notes',
      accessorKey: 'notes',
      cell: ({ row }) => {
        const notes = row.original.notes;
        return <div className="truncate w-32" title={notes ?? ''}>{notes ?? 'N/A'}</div>
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const appointment = row.original
          //
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
                onClick={() => {
                  navigator.clipboard.writeText(appointment.id);
                  toast.success("Appointment ID copied to clipboard!");
                }}
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

  // Pagination and Sorting State from URL
  const page = searchParams.get('page') ?? '1';
  const per_page = searchParams.get('per_page') ?? '10';
  const sort = searchParams.get('sort') ?? 'startTime.desc';

  const [sorting, setSorting] = React.useState<SortingState>(() => {
    const [id, order] = sort.split('.');
    return [{ id, desc: order === 'desc' }];
  });

  const [pagination, setPagination] = React.useState({
    pageIndex: Number(page) - 1,
    pageSize: Number(per_page),
  });
  
  const [searchTerm, setSearchTerm] = React.useState(searchParams.get('searchTerm') || '');
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  // Effect to handle navigation changes for search, sort, and pagination
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    params.set('page', String(pagination.pageIndex + 1));
    params.set('per_page', String(pagination.pageSize));
    
    if (sorting.length > 0) {
      params.set('sort', `${sorting[0].id}.${sorting[0].desc ? 'desc' : 'asc'}`);
    } else {
        params.delete('sort');
    }

    if(debouncedSearch) {
        params.set('searchTerm', debouncedSearch);
        if (String(pagination.pageIndex + 1) !== '1') {
            params.set('page', '1');
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }
    } else {
        params.delete('searchTerm');
    }
    
    // The router replaces the URL, which will cause Next.js to re-render the page
    // on the server with the new search params.
    router.replace(`${pathname}?${params.toString()}`);

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Input
            placeholder="Search by patient, service, or status..."
            value={searchTerm}
            onChange={(event) => handleSearchChange(event)}
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
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
        <DataTablePagination table={table} />
    </div>
  )
}