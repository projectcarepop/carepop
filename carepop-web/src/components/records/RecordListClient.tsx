'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyEnrichedRecords } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { type MedicalRecordWithRelations } from '@/lib/types';
import RecordCard from './RecordCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText } from 'lucide-react';
import Link from 'next/link';

interface RecordListClientProps {
  initialRecords: MedicalRecordWithRelations[];
}

export default function RecordListClient({ initialRecords }: RecordListClientProps) {
  const { session } = useAuth();
  
  const { data: records, isLoading, isError, error } = useQuery<MedicalRecordWithRelations[]>({
    queryKey: ['myMedicalRecords'],
    queryFn: () => {
        if (!session?.access_token) {
            // This should ideally not happen if the server page redirects, but it's a good safeguard.
            return Promise.reject(new Error('Not authenticated'));
        }
        return getMyEnrichedRecords(session.access_token);
    },
    initialData: initialRecords,
    enabled: !!session, // Only run the query client-side if a session exists
  });

  if (isLoading) {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
            ))}
        </div>
    );
  }

  if (isError) {
    return (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message || "Could not fetch your medical records."}</AlertDescription>
        </Alert>
    );
  }

  if (!records || records.length === 0) {
      return (
        <Alert>
            <FileText className="h-4 w-4" />
            <AlertTitle>No Records Found</AlertTitle>
            <AlertDescription>You do not have any medical records yet. They will appear here after your appointments.</AlertDescription>
        </Alert>
      );
  }

  return (
    <div className="space-y-6">
      {records.map((record) => (
        <Link key={record.recordId} href={`/records/${record.recordId}?from=records`} className="block">
          <RecordCard record={record} />
        </Link>
      ))}
    </div>
  );
}
