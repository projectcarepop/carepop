'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Clinic } from '@/lib/types';
import { Globe, MapPin, Phone } from 'lucide-react';

interface ClinicDetailsCardProps {
  clinic: Clinic;
}

export function ClinicDetailsCard({ clinic }: ClinicDetailsCardProps) {
    
    const { name, address, phone, website } = clinic;

    const fullAddress = address 
        ? `${address.street}, ${address.barangay}, ${address.city}, ${address.province} ${address.postal_code || ''}`.trim()
        : 'No address provided.';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
          <span className="text-sm">{fullAddress}</span>
        </div>
        {phone && (
            <div className="flex items-center">
                <Phone className="mr-3 h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{phone}</span>
            </div>
        )}
        {website && (
            <div className="flex items-center">
                <Globe className="mr-3 h-5 w-5 text-muted-foreground" />
                <a href={website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                    {website}
                </a>
            </div>
        )}
      </CardContent>
    </Card>
  );
} 