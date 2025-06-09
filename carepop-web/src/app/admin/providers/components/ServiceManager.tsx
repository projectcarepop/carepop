'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetcher } from '@/lib/utils';
import { ProviderFormValues } from './providerForm-types';
import { Table as TanstackTable } from '@tanstack/react-table';

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
    const [selectedServices, setSelectedServices] = useState<string[]>(form.getValues('serviceIds') || []);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

    // Fetch categories
    const { data: categoriesData } = useSWR('/api/v1/admin/service-categories', fetcher);
    useEffect(() => {
        if (categoriesData) setCategories(categoriesData.data);
    }, [categoriesData]);

    // Fetch services
    const servicesUrl = useMemo(() => {
        const params = new URLSearchParams({
            page: (pagination.pageIndex + 1).toString(),
            limit: pagination.pageSize.toString(),
            search: debouncedSearchTerm,
        });
        if (selectedCategory !== 'all') {
            params.append('categoryId', selectedCategory);
        }
        return `/api/v1/admin/services?${params.toString()}`;
    }, [pagination, debouncedSearchTerm, selectedCategory]);

    const { data: servicesData, isLoading } = useSWR(servicesUrl, fetcher);

    const handleSelectService = (serviceId: string) => {
        const newSelectedServices = selectedServices.includes(serviceId)
            ? selectedServices.filter(id => id !== serviceId)
            : [...selectedServices, serviceId];
        setSelectedServices(newSelectedServices);
        form.setValue('serviceIds', newSelectedServices, { shouldDirty: true });
    };
    
    const pageCount = servicesData?.totalPages ?? 0;

    const table = {
        getState: () => ({ pagination }),
        setPageIndex: (updater: number | ((old: number) => number)) => {
            const newPageIndex = typeof updater === 'function' ? updater(pagination.pageIndex) : updater;
            setPagination(prev => ({ ...prev, pageIndex: newPageIndex }));
        },
        getPageCount: () => pageCount,
        getCanPreviousPage: () => pagination.pageIndex > 0,
        getCanNextPage: () => pagination.pageIndex < pageCount - 1,
        previousPage: () => setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 })),
        nextPage: () => setPagination(prev => ({...prev, pageIndex: prev.pageIndex + 1})),
        setPageSize: (updater: number | ((old: number) => number)) => {
            const newPageSize = typeof updater === 'function' ? updater(pagination.pageSize) : updater;
            setPagination({ pageIndex: 0, pageSize: newPageSize});
        },
    }

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
                           <TableRow>
                                <TableHead className="w-[50px]">Select</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Category</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={3} className="text-center h-24">Loading...</TableCell></TableRow>
                            ) : servicesData?.data.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="text-center h-24">No services found.</TableCell></TableRow>
                            ) : (
                                servicesData?.data.map((service: Service) => (
                                    <TableRow key={service.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedServices.includes(service.id)}
                                                onCheckedChange={() => handleSelectService(service.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{service.name}</TableCell>
                                        <TableCell>{service.category?.name || 'N/A'}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                 <DataTablePagination table={table as TanstackTable<Service>} />
            </CardContent>
        </Card>
    );
} 