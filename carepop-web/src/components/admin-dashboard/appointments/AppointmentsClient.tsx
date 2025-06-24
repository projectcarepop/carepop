'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon } from "lucide-react";
import { useDebounce } from '@/hooks/useDebounce';

import { type Appointment, type Clinic, type Doctor } from '../page';

// --- Helper: Data Table Component ---
function DataTable<TData, TValue>({ columns, data, onRowClick }: { columns: ColumnDef<TData, TValue>[], data: TData[], onRowClick: (row: TData) => void }) {
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
    return (
        <div className="rounded-md border mt-4">
            <Table>
                <TableHeader>{table.getHeaderGroups().map(hg => (<TableRow key={hg.id}>{hg.headers.map(h => (<TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>))}</TableRow>))}</TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (table.getRowModel().rows.map(row => (<TableRow key={row.id} onClick={() => onRowClick(row.original)} className="cursor-pointer">{row.getVisibleCells().map(cell => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>))) : (<TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell></TableRow>)}
                </TableBody>
            </Table>
        </div>
    );
}

// --- Main Client Component ---
interface AppointmentsClientProps {
    initialAppointments: Appointment[];
    clinics: Clinic[];
    doctors: Doctor[];
}

export function AppointmentsClient({ initialAppointments, clinics, doctors }: AppointmentsClientProps) {
    const router = useRouter();
    const [filters, setFilters] = useState({
        status: '',
        clinicId: '',
        doctorId: '',
        dateRange: undefined as DateRange | undefined,
    });

    const debouncedFilters = useDebounce(filters, 500);

    const queryParams = useMemo(() => {
        const params: Record<string, string> = {};
        if (debouncedFilters.status) params.status = debouncedFilters.status;
        if (debouncedFilters.clinicId) params.clinicId = debouncedFilters.clinicId;
        if (debouncedFilters.doctorId) params.doctorId = debouncedFilters.doctorId;
        if (debouncedFilters.dateRange?.from) params.startDate = format(debouncedFilters.dateRange.from, 'yyyy-MM-dd');
        if (debouncedFilters.dateRange?.to) params.endDate = format(debouncedFilters.dateRange.to, 'yyyy-MM-dd');
        return params;
    }, [debouncedFilters]);

    const { data: appointments = [] } = useQuery<Appointment[]>({
        queryKey: ['adminAppointments', queryParams],
        queryFn: async () => (await apiClient.api.admin.appointments.$get({ query: queryParams })).json().then(res => res.data),
        initialData: initialAppointments,
        enabled: !!debouncedFilters, // Only run query when debounced filters are set
    });

    const columns: ColumnDef<Appointment>[] = [
        { accessorKey: 'patientName', header: 'Patient' },
        { accessorKey: 'doctorName', header: 'Doctor' },
        { accessorKey: 'clinicName', header: 'Clinic' },
        { accessorKey: 'serviceName', header: 'Service' },
        { accessorKey: 'startTime', header: 'Date & Time', cell: ({ row }) => format(new Date(row.original.startTime), 'PPpp')},
        { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'canceled' ? 'destructive' : 'default'}>{row.original.status}</Badge>},
    ];
    
    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div>
            <div className="flex gap-4 items-center mb-4 p-4 border rounded-lg">
                <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}><SelectTrigger><SelectValue placeholder="Filter by Status..." /></SelectTrigger><SelectContent><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="canceled">Canceled</SelectItem></SelectContent></Select>
                <Select value={filters.clinicId} onValueChange={(v) => handleFilterChange('clinicId', v)}><SelectTrigger><SelectValue placeholder="Filter by Clinic..." /></SelectTrigger><SelectContent>{clinics.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                <Select value={filters.doctorId} onValueChange={(v) => handleFilterChange('doctorId', v)}><SelectTrigger><SelectValue placeholder="Filter by Doctor..." /></SelectTrigger><SelectContent>{doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.fullName}</SelectItem>)}</SelectContent></Select>
                <Popover>
                    <PopoverTrigger asChild><Button variant="outline"><CalendarIcon className="mr-2 h-4 w-4" />{filters.dateRange?.from ? (filters.dateRange.to ? `${format(filters.dateRange.from, "LLL dd, y")} - ${format(filters.dateRange.to, "LLL dd, y")}` : format(filters.dateRange.from, "LLL dd, y")) : "Pick a date range"}</Button></PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="range" selected={filters.dateRange} onSelect={(range) => handleFilterChange('dateRange', range)}/></PopoverContent>
                </Popover>
                 <Button onClick={() => setFilters({ status: '', clinicId: '', doctorId: '', dateRange: undefined })} variant="ghost">Clear Filters</Button>
            </div>
            <DataTable columns={columns} data={appointments} onRowClick={(row) => router.push(`/admin-dashboard/appointments/${row.id}`)} />
        </div>
    );
} 