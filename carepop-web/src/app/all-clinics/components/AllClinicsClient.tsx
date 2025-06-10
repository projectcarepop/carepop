'use client';

import { useState, useMemo } from 'react';
import { Clinic } from '@/lib/types/clinic';
import { Service } from '@/lib/types/service';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import ClinicList from '@/app/clinic-finder/components/ClinicList';
import { Card } from '@/components/ui/card';

interface AllClinicsClientProps {
  initialClinics: Clinic[];
  allServices: Service[];
}

export default function AllClinicsClient({ initialClinics, allServices }: AllClinicsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Memoize the filtered clinics to avoid re-calculating on every render
  const filteredClinics = useMemo(() => {
    return initialClinics.filter(clinic => {
      const matchesSearchTerm = clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              clinic.full_address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesServices = selectedServices.length === 0 || 
                              selectedServices.every(serviceId => 
                                (clinic.services_offered || []).includes(serviceId)
                              );

      return matchesSearchTerm && matchesServices;
    });
  }, [initialClinics, searchTerm, selectedServices]);
  
  const handleServiceSelect = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId) 
        : [...prev, serviceId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            placeholder="Search by clinic name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
              >
                {selectedServices.length > 0
                  ? `${selectedServices.length} service(s) selected`
                  : "Filter by services..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search services..." />
                <CommandList>
                  <CommandEmpty>No services found.</CommandEmpty>
                  <CommandGroup>
                    {allServices.map((service) => (
                      <CommandItem
                        key={service.id}
                        value={service.name}
                        onSelect={() => handleServiceSelect(service.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedServices.includes(service.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {service.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </Card>
      
      {/* Clinic list */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{filteredClinics.length} Clinics Found</h2>
        {/* We need a location for the directions button, which we don't have on this page. */}
        {/* So we pass null to disable the button. */}
        <ClinicList clinics={filteredClinics} userLocation={null} onViewDetails={() => {}} />
      </div>
    </div>
  );
} 