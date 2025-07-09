'use client';

import React from 'react';
import { Doctor, Service } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelect } from '@/components/ui/MultiSelect';

// This will represent the state of assignments: a map from serviceId to a list of doctorIds
export type Assignments = Record<string, string[]>;

interface ServiceDoctorAssignmentsProps {
  services: Service[];
  doctors: Doctor[];
  initialAssignments: Assignments;
  onAssignmentsChange: (newAssignments: Assignments) => void;
  isLoading: boolean;
}

export function ServiceDoctorAssignments({
  services,
  doctors,
  initialAssignments,
  onAssignmentsChange,
  isLoading,
}: ServiceDoctorAssignmentsProps) {
  
  const doctorOptions = doctors.map(doc => ({
    value: doc.id,
    label: doc.fullName || 'Unnamed Doctor',
  }));

  const handleSelectionChange = (serviceId: string, selectedDoctorIds: string[]) => {
    const newAssignments = {
      ...initialAssignments,
      [serviceId]: selectedDoctorIds,
    };
    onAssignmentsChange(newAssignments);
  };

  if (services.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        There are no services assigned to this clinic yet. You can assign services by editing the clinic&apos;s details.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {services.map(service => (
        <Card key={service.id}>
          <CardHeader>
            <CardTitle>{service.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiSelect
              options={doctorOptions}
              selected={initialAssignments[service.id] || []}
              onChange={(selectedIds) => handleSelectionChange(service.id, selectedIds)}
              placeholder="Assign doctors to this service..."
              disabled={isLoading}
              className="w-full"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 