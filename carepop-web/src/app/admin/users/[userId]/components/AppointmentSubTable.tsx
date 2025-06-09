'use client';

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { fetcher, getErrorMessage } from '@/lib/utils';
import { ColumnDef, useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';

// Mirror the prop from the parent
interface Appointment {
  id: string;
  appointment_datetime: string;
  status: string;
  service?: { name: string };
  clinic?: { name: string };
  provider?: { first_name: string; last_name: string };
}

interface AppointmentSubTableProps {
  userId: string;
  type: 'upcoming' | 'past';
}

const columns: ColumnDef<Appointment>[] = [
    {
        accessorKey: 'service.name',
        header: 'Service',
        cell: ({ row }) => row.original.service?.name || 'N/A'
    },
    {
        accessorKey: 'provider',
        header: 'Provider',
        cell: ({ row }) => {
            const provider = row.original.provider;
            return provider ? `${provider.first_name} ${provider.last_name}` : 'N/A';
        }
    },
    {
        accessorKey: 'appointment_datetime',
        header: 'Date & Time',
        cell: ({ row }) => new Date(row.original.appointment_datetime).toLocaleString()
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <Badge variant={row.original.status === 'Confirmed' ? 'default' : 'secondary'}>{row.original.status}</Badge>
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/appointments/${row.original.id}`}>
                    View Details
                </Link>
            </Button>
        )
    }
];

export function AppointmentSubTable({ userId, type }: AppointmentSubTableProps) {
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [token, setToken] = useState<string | null>(null);

    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

    useEffect(() => {
        const fetchToken = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setToken(session?.access_token || null);
        };
        fetchToken();
    }, [supabase.auth]);

    const apiUrl = useMemo(() => {
        if (!token || !userId) return null;
        const params = new URLSearchParams({
            page: (pagination.pageIndex + 1).toString(),
            limit: pagination.pageSize.toString(),
            userId: userId,
            time_frame: type,
            sortBy: 'appointment_datetime',
            sortOrder: type === 'upcoming' ? 'asc' : 'desc'
        });
        return `${backendUrl}/api/v1/admin/appointments?${params.toString()}`;
    }, [pagination, token, userId, type, backendUrl]);

    const { data: result, error, isLoading } = useSWR(
        apiUrl ? [apiUrl, token] : null,
        fetcher
    );

    const table = useReactTable({
        data: result?.data ?? [],
        columns,
        pageCount: result?.meta?.totalPages ?? 0,
        state: { pagination },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
    });
    
    if (!backendUrl) return <p>Backend API URL is not configured.</p>;

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">Loading...</TableCell></TableRow>
                        ) : error ? (
                             <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-destructive">{getErrorMessage(error)}</TableCell></TableRow>
                        ) : table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No {type} appointments found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    );
} 