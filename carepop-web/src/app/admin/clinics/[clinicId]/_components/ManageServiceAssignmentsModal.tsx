'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type Service = {
  id: string;
  name: string;
  description?: string;
};

type Doctor = {
  id: string;
  fullName: string;
  specialization?: string;
};

interface ManageServiceAssignmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  availableServices: Service[];
  currentAssignments: string[]; // Array of service IDs currently assigned to this doctor
  onSave: (doctorId: string, assignedServiceIds: string[]) => void;
  isLoading: boolean;
}

export function ManageServiceAssignmentsModal({
  isOpen,
  onClose,
  doctor,
  availableServices,
  currentAssignments,
  onSave,
  isLoading,
}: ManageServiceAssignmentsModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(currentAssignments);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = () => {
    if (doctor) {
      onSave(doctor.id, selectedServices);
    }
  };

  const handleClose = () => {
    setSelectedServices(currentAssignments); // Reset to original state
    onClose();
  };

  if (!doctor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Services for {doctor.fullName}</DialogTitle>
          <DialogDescription>
            Select which services this doctor should be able to provide at this clinic.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{doctor.fullName}</Badge>
            {doctor.specialization && (
              <span className="text-sm text-muted-foreground">
                {doctor.specialization}
              </span>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3">Available Services</h4>
            <ScrollArea className="h-64 border rounded-md p-3">
              <div className="space-y-3">
                {availableServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={service.id}
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <label
                      htmlFor={service.id}
                      className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <div>
                        <div>{service.name}</div>
                        {service.description && (
                          <div className="text-xs text-muted-foreground">
                            {service.description}
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
              {selectedServices.length} service(s) selected
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