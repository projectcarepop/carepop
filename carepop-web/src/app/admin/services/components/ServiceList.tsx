'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useDebounce } from '@/hooks/useDebounce';
import { fetcherWithAuth } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface Service {
    id: string;
    name: string;
    description: string;
    cost: number;
    category: { name: string };
    is_active: boolean;
}

export default function ServiceList() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const apiUrl = useMemo(() => {
    return `/api/v1/admin/services?search=${debouncedSearchTerm}`;
  }, [debouncedSearchTerm]);

  const { data: result, error, isLoading } = useSWR(apiUrl, fetcherWithAuth);
  
  const services: Service[] | undefined = result?.data?.data;

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by service name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                </TableRow>
              ))
            )}
            {error && (
              <TableRow><TableCell colSpan={4} className="text-center text-red-500">Failed to load services: {error.message}</TableCell></TableRow>
            )}
            {services && services.length === 0 && !isLoading && (
              <TableRow><TableCell colSpan={4} className="text-center">No services found.</TableCell></TableRow>
            )}
            {services && services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>{service.category?.name || 'N/A'}</TableCell>
                <TableCell>{service.cost}</TableCell>
                <TableCell>{service.is_active ? 'Active' : 'Inactive'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 