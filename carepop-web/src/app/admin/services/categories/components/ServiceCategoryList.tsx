'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useDebounce } from '@/hooks/useDebounce';
import { fetcherWithAuth } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceCategory {
    id: string;
    name: string;
    description: string;
}

export default function ServiceCategoryList() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const apiUrl = useMemo(() => {
    return `/api/v1/admin/service-categories?search=${debouncedSearchTerm}`;
  }, [debouncedSearchTerm]);

  const { data: result, error, isLoading } = useSWR(apiUrl, fetcherWithAuth);

  const categories: ServiceCategory[] | undefined = result?.data?.data;

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by category name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
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
            {isLoading && (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                </TableRow>
              ))
            )}
            {error && (
              <TableRow><TableCell colSpan={2} className="text-center text-red-500">Failed to load categories: {error.message}</TableCell></TableRow>
            )}
            {categories && categories.length === 0 && !isLoading && (
                <TableRow><TableCell colSpan={2} className="text-center">No categories found.</TableCell></TableRow>
            )}
            {categories && categories.map((category) => (
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