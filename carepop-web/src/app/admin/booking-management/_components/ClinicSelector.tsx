'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

// This is a placeholder type. We will replace this with a real fetch from the API.
type Clinic = {
  id: string;
  name: string;
};

interface ClinicSelectorProps {
  selectedClinicId: string | null;
  onClinicChange: (clinicId: string) => void;
  clinics: Clinic[]; // This will be populated by a fetch
  isLoading: boolean;
}

export const ClinicSelector: React.FC<ClinicSelectorProps> = ({
  selectedClinicId,
  onClinicChange,
  clinics,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label htmlFor="clinic-selector">Select a Clinic to Manage</Label>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="clinic-selector">Select a Clinic to Manage</Label>
      <Select onValueChange={onClinicChange} value={selectedClinicId ?? undefined}>
        <SelectTrigger id="clinic-selector">
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
    </div>
  );
}; 