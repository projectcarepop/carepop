'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Clinic {
  id: string;
  name: string;
}

interface ClinicSelectorProps {
  clinics: Clinic[];
  selectedClinicId: string;
}

export default function ClinicSelector({ clinics, selectedClinicId }: ClinicSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleClinicChange = (newClinicId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('clinicId', newClinicId);
    params.set('page', '1'); // Reset to first page when clinic changes
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={selectedClinicId} onValueChange={handleClinicChange}>
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select a clinic..." />
      </SelectTrigger>
      <SelectContent>
        {clinics.map((clinic) => (
          <SelectItem key={clinic.id} value={clinic.id}>
            {clinic.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 