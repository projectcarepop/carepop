'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Clinic {
  id: string;
  name: string;
}

interface ClinicSelectorProps {
  clinics: Clinic[];
  selectedClinicId: string | null;
  onClinicSelect: (clinicId: string) => void;
  isLoading: boolean;
}

export function ClinicSelector({
  clinics,
  selectedClinicId,
  onClinicSelect,
  isLoading,
}: ClinicSelectorProps) {
  return (
    <Select
      onValueChange={onClinicSelect}
      value={selectedClinicId ?? ''}
      disabled={isLoading || clinics.length === 0}
    >
      <SelectTrigger className="w-full md:w-72">
        <SelectValue placeholder={isLoading ? "Loading clinics..." : "Select a clinic"} />
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