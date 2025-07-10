'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

type Service = {
  id: string;
  name: string;
};

type Doctor = {
  id:string;
  fullName: string;
};

// This will represent the state of assignments: a map from serviceId to a list of doctorIds
export type Assignments = Record<string, string[]>;

interface ServiceDoctorAssignmentsProps {
  assignedServices: Service[];
  allDoctors: Doctor[];
  initialAssignments: Assignments;
  onAssignmentsChange: (newAssignments: Assignments) => void;
}

export function ServiceDoctorAssignments({ 
    assignedServices, 
    allDoctors,
    initialAssignments,
    onAssignmentsChange,
}: ServiceDoctorAssignmentsProps) {
  const [assignments, setAssignments] = useState<Assignments>(initialAssignments);

  useEffect(() => {
    onAssignmentsChange(assignments);
  }, [assignments, onAssignmentsChange]);

  const handleCheckboxChange = (serviceId: string, doctorId: string, isChecked: boolean) => {
    setAssignments(prev => {
        const currentDoctorIds = prev[serviceId] || [];
        const newDoctorIds = isChecked
            ? [...currentDoctorIds, doctorId]
            : currentDoctorIds.filter(id => id !== doctorId);
        
        return { ...prev, [serviceId]: newDoctorIds };
    });
  };

  if (!assignedServices || assignedServices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service & Doctor Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">This clinic has no services assigned to it yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Service & Doctor Assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            {assignedServices.map(service => (
                <div key={service.id} className="p-4 border rounded-md">
                    <h3 className="font-semibold mb-3">{service.name}</h3>
                    <div className="space-y-2">
                        <Label>Assigned Doctors:</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allDoctors.map(doctor => (
                                <div key={doctor.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`${service.id}-${doctor.id}`}
                                        checked={assignments[service.id]?.includes(doctor.id) || false}
                                        onCheckedChange={(checked) => handleCheckboxChange(service.id, doctor.id, !!checked)}
                                    />
                                    <Label htmlFor={`${service.id}-${doctor.id}`} className="font-normal">
                                        {doctor.fullName}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
  );
} 