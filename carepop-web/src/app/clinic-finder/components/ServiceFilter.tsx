'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from 'react';
import { Service } from '@/lib/types/service';

interface ServiceFilterProps {
  services: Service[];
}

interface SelectedServices {
  [key: string]: boolean;
}

export default function ServiceFilter({ services }: ServiceFilterProps) {
  const [selectedServices, setSelectedServices] = useState<SelectedServices>({});

  const handleCheckboxChange = (serviceId: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
    // TODO: Propagate changes up to parent component or context for actual filtering
  };

  // TODO: Add a "Show More/Less" for long lists
  // TODO: Consider a search/filter input for services if the list becomes very long

  return (
    <div className="space-y-2">
      <h3 className="text-base font-medium">Services Offered</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2"> {/* Added scroll for long lists */}
        {services && services.length > 0 ? (
          services.map((service) => (
            <div key={service.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`service-${service.id}`}
                checked={!!selectedServices[service.id]}
                onCheckedChange={() => handleCheckboxChange(service.id)}
              />
              <Label 
                htmlFor={`service-${service.id}`}
                className="text-sm font-normal cursor-pointer hover:text-pink-600 transition-colors"
              >
                {service.name}
              </Label>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No services available to filter.</p>
        )}
      </div>
    </div>
  );
} 