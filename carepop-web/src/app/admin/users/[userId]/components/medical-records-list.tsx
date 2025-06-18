'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useDebounce } from '@/hooks/useDebounce';
import { useFetcher } from '@/lib/utils/fetcher';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

interface MedicalRecord {
  id: string;
  record_title: string;
  record_details: string | null;
  record_file_url: string;
  created_at: string;
}

interface MedicalRecordsListProps {
  userId: string;
}

export function MedicalRecordsList({ userId }: MedicalRecordsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const fetcher = useFetcher();

  const apiUrl = `/api/v1/admin/users/${userId}/medical-records?search=${debouncedSearchTerm}`;
  const { data: records, error, isLoading } = useSWR<MedicalRecord[]>(apiUrl, fetcher);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search by record title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button asChild>
          <Link href={`/admin/users/${userId}/upload-medical-record`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload Record
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Date Added</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              if (isLoading) {
                return Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={3}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ));
              }

              if (error) {
                return (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-destructive">
                      Failed to load medical records.
                    </TableCell>
                  </TableRow>
                );
              }

              if (!records || records.length === 0) {
                return (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No medical records found.
                    </TableCell>
                  </TableRow>
                );
              }

              return records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.record_title}</TableCell>
                  <TableCell>{new Date(record.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <a href={record.record_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View
                    </a>
                  </TableCell>
                </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 