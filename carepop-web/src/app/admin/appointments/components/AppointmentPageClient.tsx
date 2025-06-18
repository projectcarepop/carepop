'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Loader2 } from 'lucide-react';
import useSWR from 'swr';
import { AppointmentTableClient, Appointment } from './AppointmentTableClient';
import { Skeleton } from '@/components/ui/skeleton';

interface Clinic {
  id: string;
  name: string;
}

interface AppointmentPageClientProps {
  clinics: Clinic[];
  initialClinicId: string | null;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AppointmentPageClient({ clinics, initialClinicId }: AppointmentPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const clinicId = searchParams.get('clinicId') ?? initialClinicId;
  const page = searchParams.get('page') ?? '1';
  const per_page = searchParams.get('per_page') ?? '10';
  const sort = searchParams.get('sort') ?? 'appointment_datetime.desc';
  const search = searchParams.get('search') ?? '';

  const apiParams = useMemo(() => {
    const params = new URLSearchParams();
    if (clinicId) params.set('clinicId', clinicId);
    params.set('page', page);
    params.set('per_page', per_page);
    params.set('sort', sort);
    if(search) params.set('searchTerm', search);
    return params;
  }, [clinicId, page, per_page, sort, search]);

  const { data, error, isLoading } = useSWR(`/api/admin/appointments?${apiParams.toString()}`, fetcher);

  const handleClinicChange = (newClinicId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('clinicId', newClinicId);
    params.set('page', '1');
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Select Clinic</CardTitle>
          <CardDescription>Filter appointments by a specific clinic location.</CardDescription>
        </div>
        <Button asChild className="ml-auto">
          <Link href="/admin/appointments/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Select value={clinicId ?? ''} onValueChange={handleClinicChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a clinic to view appointments" />
          </SelectTrigger>
          <SelectContent>
            {clinics.map((clinic) => (
              <SelectItem key={clinic.id} value={clinic.id}>
                {clinic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
      <div className="p-6 pt-0">
        {isLoading && <Skeleton className="h-[400px] w-full" />}
        {error && <div className="text-red-500">Failed to load appointments. Please try refreshing.</div>}
        {data && <AppointmentTableClient data={data.appointments} totalRecords={data.totalRecords} error={data.error} />}
      </div>
    </Card>
  );
} 