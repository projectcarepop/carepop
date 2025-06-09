'use client';

import { useEffect, useState, useMemo } from 'react';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { AppError, getErrorMessage, fetcher } from '@/lib/utils';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { ColumnDef, useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';

// Define the structure for a Provider
interface IProvider {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    contact_number: string | null;
    is_active: boolean;
    user_id: string;
}

export function ProviderTable() {
    const [data, setData] = useState<IProvider[]>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [token, setToken] = useState<string | null>(null);

    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const { toast } = useToast();

    useEffect(() => {
        const fetchToken = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setToken(session?.access_token || null);
        };
        fetchToken();
    }, [supabase.auth]);

    const apiUrl = useMemo(() => {
        const params = new URLSearchParams({
            page: (pagination.pageIndex + 1).toString(),
            limit: pagination.pageSize.toString(),
        });
        if (debouncedSearchTerm) {
            params.append('search', debouncedSearchTerm);
        }
        return `/api/v1/admin/providers?${params.toString()}`;
    }, [pagination, debouncedSearchTerm]);

    const { data: result, error: swrError, isLoading, mutate } = useSWR(
        token ? [apiUrl, token] : null,
        fetcher
    );

    useEffect(() => {
        if (result?.data) {
            setData(result.data.providers || result.data || []);
            setTotalPages(result.data.totalPages || 0);
        }
    }, [result]);

    const handleDelete = async (providerId: string) => {
        if (!confirm('Are you sure you want to delete this provider? This action cannot be undone.')) return;

        try {
            if (!token) throw new AppError("Not authenticated", {} as Response);
            
            const response = await fetch(`/api/v1/admin/providers/${providerId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new AppError(errorData.message || 'Failed to delete provider.', response);
            }

            toast({
                title: 'Success',
                description: 'Provider deleted successfully.',
            });
            mutate();
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        }
    };

    const columns = useMemo<ColumnDef<IProvider>[]>(() => [
        {
            accessorKey: 'first_name',
            header: 'Name',
            cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`
        },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'contact_number', header: 'Phone' },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {row.original.is_active ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
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
                                <Link href={`/admin/providers/${row.original.id}/edit`}>Edit Details</Link>
                            </DropdownMenuItem>
                             <DropdownMenuItem asChild>
                                <Link href={`/admin/providers/${row.original.id}/services`}>Manage Services</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-destructive">
                                Delete Provider
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ], [handleDelete]);
    
    const table = useReactTable({
        data,
        columns,
        pageCount: totalPages,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
    });

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex gap-2">
                    <Input
                        placeholder="Search by name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </div>
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
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">Loading...</TableCell>
                            </TableRow>
                        ) : swrError ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-destructive">{swrError.message}</TableCell>
                            </TableRow>
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
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">No providers found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    );
} 