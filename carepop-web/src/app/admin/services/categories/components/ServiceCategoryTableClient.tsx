'use client';

import { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ServiceCategory {
    id: string;
    name: string;
    description: string;
}

interface ServiceCategoryTableClientProps {
    data: ServiceCategory[];
    error: string | null;
}

export function ServiceCategoryTableClient({ data, error }: ServiceCategoryTableClientProps) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <div className="space-y-4">
            <Input
                placeholder="Search by category name..."
                defaultValue={searchParams.get('search')?.toString()}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-sm"
            />
            
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {error && (
                            <TableRow><TableCell colSpan={2} className="text-center text-red-500">{error}</TableCell></TableRow>
                         )}
                        {data && data.length === 0 && !error && (
                            <TableRow><TableCell colSpan={2} className="text-center">No categories found.</TableCell></TableRow>
                        )}
                        {data && data.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell>{category.description}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}