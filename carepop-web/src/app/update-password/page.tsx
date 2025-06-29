import { Suspense } from 'react';
import { UpdatePasswordForm } from './_components/UpdatePasswordForm';
import { Skeleton } from '@/components/ui/skeleton';

// A simple loading component for the fallback
const UpdatePasswordFormSkeleton = () => {
  return (
    <div className="w-full max-w-md p-8 my-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="text-center space-y-2">
            <Skeleton className="h-8 w-2/3 mx-auto" />
            <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
        </div>
    </div>
  );
};

export default function UpdatePasswordPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Suspense fallback={<UpdatePasswordFormSkeleton />}>
        <UpdatePasswordForm />
      </Suspense>
    </div>
  );
} 