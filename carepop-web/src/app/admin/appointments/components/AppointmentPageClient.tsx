'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

interface Clinic {
  id: string;
  name: string;
}

interface AppointmentPageClientProps {
  clinics: Clinic[];
  initialClinicId: string | null;
  table: React.ReactNode;
}

export default function AppointmentPageClient({ clinics, initialClinicId, table }: AppointmentPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedClinicId = searchParams.get('clinicId') ?? initialClinicId;

  const handleClinicChange = (clinicId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('clinicId', clinicId);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedClinicId ?? ''} onValueChange={handleClinicChange}>
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
      {selectedClinicId && <div className="p-6 pt-0">{table}</div>}
    </Card>
  );
} 