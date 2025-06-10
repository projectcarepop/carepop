'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useDebounce } from '@/hooks/useDebounce';
import { fetcher } from '@/lib/utils/fetcher';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface Clinic {
    id: string;
    name: string;
    full_address: string;
    contact_phone: string | null;
    is_active: boolean;
}

export default function ClinicList() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const apiUrl = `/api/v1/admin/clinics?search=${debouncedSearchTerm}`;
  const { data: clinics, error, isLoading } = useSWR<Clinic[]>(apiUrl, fetcher);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by clinic name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
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
              <TableRow><TableCell colSpan={4} className="text-center text-red-500">Failed to load clinics.</TableCell></TableRow>
            )}
            {clinics && clinics.map((clinic) => (
              <TableRow key={clinic.id}>
                <TableCell className="font-medium">{clinic.name}</TableCell>
                <TableCell>{clinic.full_address}</TableCell>
                <TableCell>{clinic.contact_phone || 'N/A'}</TableCell>
                <TableCell>{clinic.is_active ? 'Active' : 'Inactive'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 