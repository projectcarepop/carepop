'use client';

import { useState, useMemo } from 'react';
import { Clinic, Service } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

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
      const c = clinic as any;
      const address = c.full_address || c.street_address || c.locality || 'unknown';
      const matchesSearchTerm = clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesServices = selectedServices.length === 0 || 
                              selectedServices.every(serviceId => 
                                (clinic.services?.map(s => s.id) || []).includes(serviceId)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClinics.map((clinic) => (
            <Card key={clinic.id} className="cursor-pointer hover:bg-gray-100 transition-colors">
              <CardHeader className="pb-2 px-4 pt-3">
                <CardTitle className="text-base font-semibold leading-tight">{clinic.name}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3 pt-0">
                <p className="text-sm text-gray-600 leading-snug">
                  {(() => {
                    // Check if clinic has any address property (cast to any to access all possible fields)
                    const c = clinic as any;
                    
                    // Option 1: Use full_address if available (Supabase format)
                    if (c.full_address) {
                      return c.full_address;
                    }
                    
                    // Option 2: Build from individual Supabase fields
                    if (c.street_address || c.locality || c.region) {
                      const parts = [c.street_address, c.locality, c.region].filter(Boolean);
                      return parts.length > 0 ? parts.join(', ') : 'Address not available';
                    }
                    
                    // Option 3: Handle address as JSONB object (Drizzle format)
                    if (c.address && typeof c.address === 'object') {
                      const addr = c.address;
                      const parts = [addr.street, addr.city || addr.cityMunicipality, addr.province].filter(Boolean);
                      return parts.length > 0 ? parts.join(', ') : 'Address not available';
                    }
                    
                    // Option 4: Handle individual address fields (legacy format)
                    if (c.street || c.cityMunicipality) {
                      const cityName = typeof c.cityMunicipality === 'string' 
                        ? c.cityMunicipality 
                        : c.cityMunicipality?.name;
                      return [c.street, cityName].filter(Boolean).join(', ');
                    }
                    
                    return 'Address not available';
                  })()}
                </p>
                <div className="mt-3">
                  <Link href={`/clinic/${clinic.id}`} className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Details <ExternalLink className="h-4 w-4 ml-1"/>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 