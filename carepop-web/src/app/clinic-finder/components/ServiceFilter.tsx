'use client';

import { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Service } from '@/lib/types/service';

interface ServiceFilterProps {
  services: Service[];
  selectedServices: string[];
  onServiceChange: (serviceIds: string[]) => void;
}

export default function ServiceFilter({ services, selectedServices, onServiceChange }: ServiceFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleCheckboxChange = (serviceId: string) => {
    const newSelectedServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    onServiceChange(newSelectedServices);
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // TODO: Add a "Show More/Less" for long lists
  // TODO: Consider a search/filter input for services if the list becomes very long

  return (
    <div className="space-y-3">
      <Input 
        type="text"
        placeholder="Search services..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="h-9"
      />
      <div className="space-y-1 max-h-28 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {filteredServices.length > 0 ? (
          filteredServices.map((service) => (
            <Label 
              key={service.id} 
              htmlFor={`service-${service.id}`}
              className="flex items-center space-x-3 p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <Checkbox 
                id={`service-${service.id}`}
                checked={selectedServices.includes(service.id)}
                onCheckedChange={() => handleCheckboxChange(service.id)}
              />
              <span className="text-sm font-normal">
                {service.name}
              </span>
            </Label>
          ))
        ) : (
          <p className="text-sm text-center text-gray-500 py-4">No services match your search.</p>
        )}
      </div>
    </div>
  );
} 