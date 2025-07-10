'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type Doctor = {
  id: string;
  fullName: string;
  specialization?: string;
};

type Service = {
  id: string;
  name: string;
  description?: string;
};

interface ManageDoctorAssignmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  availableDoctors: Doctor[];
  currentAssignments: string[]; // Array of doctor IDs currently assigned to this service
  onSave: (serviceId: string, assignedDoctorIds: string[]) => void;
  isLoading: boolean;
}

export function ManageDoctorAssignmentsModal({
  isOpen,
  onClose,
  service,
  availableDoctors,
  currentAssignments,
  onSave,
  isLoading,
}: ManageDoctorAssignmentsModalProps) {
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>(currentAssignments);

  const handleDoctorToggle = (doctorId: string) => {
    setSelectedDoctors(prev => 
      prev.includes(doctorId) 
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    );
  };

  const handleSave = () => {
    if (service) {
      onSave(service.id, selectedDoctors);
    }
  };

  const handleClose = () => {
    setSelectedDoctors(currentAssignments); // Reset to original state
    onClose();
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Doctors for {service.name}</DialogTitle>
          <DialogDescription>
            Select which doctors should be able to provide this service at this clinic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{service.name}</Badge>
            {service.description && (
              <span className="text-sm text-muted-foreground">
                {service.description}
              </span>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Available Doctors</h4>
            <ScrollArea className="h-64 border rounded-md p-3">
              <div className="space-y-3">
                {availableDoctors.map((doctor) => (
                  <div key={doctor.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={doctor.id}
                      checked={selectedDoctors.includes(doctor.id)}
                      onCheckedChange={() => handleDoctorToggle(doctor.id)}
                    />
                    <label
                      htmlFor={doctor.id}
                      className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <div>
                        <div>{doctor.fullName}</div>
                        {doctor.specialization && (
                          <div className="text-xs text-muted-foreground">
                            {doctor.specialization}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedDoctors.length} doctor(s) selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 