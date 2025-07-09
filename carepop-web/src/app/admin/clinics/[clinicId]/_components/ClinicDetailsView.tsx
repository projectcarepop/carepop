'use client';

import { Clinic, Service } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MapPin, Phone } from 'lucide-react';

interface ClinicDetailsViewProps {
  clinic: Clinic & { services: Service[] };
}

export default function ClinicDetailsView({ clinic }: ClinicDetailsViewProps) {
  if (!clinic) {
    return null;
  }

  const formatAddress = (address: any) => {
    if (typeof address !== 'object' || address === null) return 'N/A';
    return `${address.street}, ${address.city}, ${address.province} ${address.postal_code || ''}`.trim();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{clinic.name}</CardTitle>
          <CardDescription>
            Viewing full details for this clinic.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Status:</span>
            <Badge variant={clinic.isActive ? 'default' : 'destructive'}>
                {clinic.isActive ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                {clinic.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{clinic.phoneNumber || 'N/A'}</span>
          </div>
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
            <span className="text-muted-foreground">{formatAddress(clinic.address)}</span>
          </div>
           <div className="flex items-start space-x-2">
            <span className="font-semibold mt-1">Location (Lat, Lon):</span>
            <span className="text-muted-foreground mt-1">{`(${clinic.latitude}, ${clinic.longitude})`}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Services Offered</CardTitle>
          <CardDescription>
            A list of all services assigned to this clinic.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clinic.services && clinic.services.length > 0 ? (
            <div className="space-y-2">
              {clinic.services.map((service) => (
                <div key={service.id} className="p-3 border rounded-md">
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    <p className="text-sm font-mono mt-1">${service.price}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No services are currently assigned to this clinic.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 