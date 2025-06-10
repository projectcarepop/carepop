'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useDebounce } from '@/hooks/useDebounce';
import { fetcher } from '@/lib/utils/fetcher';

import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

// Define a type for the provider data we expect from the API
interface Provider {
    id: string;
    full_name: string;
    email: string;
    contact_number: string | null;
    is_active: boolean;
    accepting_new_patients: boolean;
    created_at: string;
}

export default function ProviderList() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // The SWR key is an array; it will be passed as arguments to the fetcher.
  // SWR automatically re-fetches when the key changes.
  const apiUrl = `/api/v1/admin/providers?search=${debouncedSearchTerm}`;
  const { data: providers, error, isLoading } = useSWR<Provider[]>(apiUrl, fetcher);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by provider name..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="max-w-sm"
      />
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact Number</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              // Show skeleton loaders while data is being fetched
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                </TableRow>
              ))
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-red-500">
                  Failed to load providers.
                </TableCell>
              </TableRow>
            )}
            {providers && providers.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No providers found.
                </TableCell>
              </TableRow>
            )}
            {providers && providers.map((provider) => (
              <TableRow key={provider.id}>
                <TableCell className="font-medium">{provider.full_name}</TableCell>
                <TableCell>{provider.email}</TableCell>
                <TableCell>{provider.contact_number || 'N/A'}</TableCell>
                <TableCell>{provider.is_active ? 'Active' : 'Inactive'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
