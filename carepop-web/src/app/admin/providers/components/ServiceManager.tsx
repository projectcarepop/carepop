'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import { UseFormReturn } from 'react-hook-form';
import { 
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetcher } from '@/lib/utils';
import { ProviderFormValues } from './providerForm-types';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface Service {
    id: string;
    name: string;
    category: {
        id: string;
        name: string;
    };
}

interface ServiceCategory {
    id: string;
    name: string;
}

interface ServiceManagerProps {
    form: UseFormReturn<ProviderFormValues>;
}

export function ServiceManager({ form }: ServiceManagerProps) {
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setAccessToken(session?.access_token || null);
        };
        getSession();
    }, [supabase]);

    const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

    // Fetch categories
    const categoriesUrl = accessToken ? `${apiUrl}/api/v1/admin/service-categories` : null;
    const { data: categoriesData } = useSWR(
        categoriesUrl ? [categoriesUrl, accessToken] : null,
        fetcher
    );

    useEffect(() => {
        if (categoriesData) setCategories(categoriesData.data);
    }, [categoriesData]);

    // Fetch services
    const servicesUrl = useMemo(() => {
        if (!accessToken) return null;
        const params = new URLSearchParams({
            page: (pagination.pageIndex + 1).toString(),
            limit: pagination.pageSize.toString(),
            search: debouncedSearchTerm,
        });
        if (selectedCategory !== 'all') {
            params.append('categoryId', selectedCategory);
        }
        return `${apiUrl}/api/v1/admin/services?${params.toString()}`;
    }, [pagination, debouncedSearchTerm, selectedCategory, accessToken, apiUrl]);

    const { data: servicesData, isLoading } = useSWR(
        servicesUrl ? [servicesUrl, accessToken] : null,
        fetcher
    );

    const pageCount = servicesData?.meta?.totalPages ?? 0;

    const columns = useMemo<ColumnDef<Service>[]>(() => [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: 'Service',
        },
        {
            accessorKey: 'category.name',
            header: 'Category',
        },
    ], []);

    const table = useReactTable({
        data: servicesData?.data ?? [],
        columns,
        pageCount,
        state: {
            pagination,
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        onPaginationChange: setPagination,
    });
    
    useEffect(() => {
        const initialServiceIds = form.getValues('serviceIds') || [];
        const initialSelection = initialServiceIds.reduce((acc, id) => {
            acc[id] = true;
            return acc;
        }, {} as Record<string, boolean>);
        setRowSelection(initialSelection);
    }, []);

    useEffect(() => {
        const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
        form.setValue('serviceIds', selectedIds, { shouldDirty: true });
    }, [rowSelection, form]);

    if (!apiUrl) return <p>Backend URL not configured.</p>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Offered Services</CardTitle>
                <CardDescription>Select the services this provider will offer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <Input 
                        placeholder="Search services..." 
                        className="max-w-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={columns.length} className="text-center h-24">Loading...</TableCell></TableRow>
                            ) : table.getRowModel().rows.length === 0 ? (
                                <TableRow><TableCell colSpan={columns.length} className="text-center h-24">No services found.</TableCell></TableRow>
                            ) : (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                 <DataTablePagination table={table} />
            </CardContent>
        </Card>
    );
} 