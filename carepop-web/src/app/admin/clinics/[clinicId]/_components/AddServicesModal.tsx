'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Service = {
  id: string;
  name: string;
  description?: string;
  serviceCategory?: {
    name: string;
  };
};

interface AddServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableServices: Service[];
  currentServiceIds: string[];
  onSave: (selectedServiceIds: string[]) => void;
  isLoading: boolean;
}

export function AddServicesModal({
  isOpen,
  onClose,
  availableServices,
  currentServiceIds,
  onSave,
  isLoading,
}: AddServicesModalProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter out services that are already assigned to this clinic
  const unassignedServices = availableServices.filter(
    service => !currentServiceIds.includes(service.id)
  );

  const filteredServices = unassignedServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.serviceCategory?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = () => {
    onSave(selectedServices);
  };

  const handleClose = () => {
    setSelectedServices([]);
    setSearchQuery('');
    onClose();
  };

  const selectAll = () => {
    setSelectedServices(filteredServices.map(s => s.id));
  };

  const clearSelection = () => {
    setSelectedServices([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Services to Clinic</DialogTitle>
          <DialogDescription>
            Select services that should be available at this clinic. You can assign doctors to these services afterward.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Clear
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">Available Services</h4>
              <span className="text-xs text-muted-foreground">
                {filteredServices.length} service(s) available
              </span>
            </div>
            
            <ScrollArea className="h-80 border rounded-md p-3">
              <div className="space-y-3">
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <div key={service.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/50">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                        className="mt-1"
                      />
                      <label
                        htmlFor={service.id}
                        className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="font-medium">{service.name}</div>
                          {service.description && (
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {service.description}
                            </div>
                          )}
                          {service.serviceCategory && (
                            <Badge variant="secondary" className="text-xs">
                              {service.serviceCategory.name}
                            </Badge>
                          )}
                        </div>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No services found matching your search.' : 'All services are already assigned to this clinic.'}
                  </div>
                )}
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
              <Button 
                onClick={handleSave} 
                disabled={isLoading || selectedServices.length === 0}
              >
                {isLoading ? 'Adding...' : `Add ${selectedServices.length} Service(s)`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 