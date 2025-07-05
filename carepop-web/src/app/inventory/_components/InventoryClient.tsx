'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import { getInventoryStats, getAdminClinics } from '@/services/api';
import { ClinicSelector } from './ClinicSelector';
import { InventoryDashboard } from './InventoryDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function InventoryClient() {
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedClinicId = searchParams.get('clinicId');

  const { data: inventoryStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['inventory-stats', selectedClinicId],
    queryFn: () => {
        if (!selectedClinicId || !accessToken) return Promise.resolve({ data: null });
        return getInventoryStats(selectedClinicId, accessToken);
    },
    enabled: !!accessToken && !!selectedClinicId,
    select: (data) => data.data,
  });

  const { data: clinics, isLoading: isLoadingClinics } = useQuery({
    queryKey: ['admin-clinics'],
    queryFn: () => getAdminClinics(accessToken!),
    enabled: !!accessToken,
    select: (data) => data.data,
  });

  const handleClinicSelect = (clinicId: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (clinicId) {
          params.set('clinicId', clinicId);
      } else {
          params.delete('clinicId');
      }
      router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Inventory Dashboard</h1>
          <ClinicSelector 
            clinics={clinics || []}
            selectedClinicId={selectedClinicId}
            onClinicSelect={handleClinicSelect}
            isLoading={isLoadingClinics || !accessToken}
          />
      </div>

      {!selectedClinicId ? (
        <Card className="flex items-center justify-center h-48">
            <CardContent className="pt-6">
                <p className="text-muted-foreground">Please select a clinic to view its dashboard.</p>
            </CardContent>
        </Card>
      ) : (
        <InventoryDashboard stats={inventoryStats} isLoading={isLoadingStats} />
      )}
    </div>
  );
}