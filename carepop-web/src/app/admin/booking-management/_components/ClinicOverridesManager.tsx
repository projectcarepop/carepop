'use client';

import { useQuery } from '@tanstack/react-query';
import { getClinicOverrides } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns-overrides';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


interface ClinicOverridesManagerProps {
    clinicId: string;
}

export const ClinicOverridesManager: React.FC<ClinicOverridesManagerProps> = ({ clinicId }) => {
    const { session } = useAuth();
    const accessToken = session?.access_token;

    const { data: overrides, isLoading, isError, error } = useQuery({
        queryKey: ['clinicOverrides', clinicId],
        queryFn: () => {
            if (!accessToken) throw new Error("Not authorized");
            return getClinicOverrides(clinicId, accessToken);
        },
        enabled: !!clinicId && !!accessToken,
    });

    if (isLoading) {
        return <Skeleton className="h-48 w-full" />;
    }

    if (isError) {
        return (
             <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error instanceof Error ? error.message : "An unknown error occurred."}
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Clinic-Wide Overrides</CardTitle>
                <CardDescription>
                    Manage clinic-wide holidays, closures, or special events. These rules override all doctor schedules.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DataTable columns={columns} data={overrides || []} />
            </CardContent>
        </Card>
    );
}; 