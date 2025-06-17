import { Suspense } from 'react';
import { ProviderTable as ProviderTableServer, GetProvidersParams } from './ProviderTable.server';
import { Skeleton } from '@/components/ui/skeleton';

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-64" />
            </div>
            <div className="rounded-md border">
                <div className="space-y-2 p-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
             <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-48" />
            </div>
        </div>
    )
}

export function ProviderTable(props: GetProvidersParams) {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ProviderTableServer {...props} />
    </Suspense>
  );
} 