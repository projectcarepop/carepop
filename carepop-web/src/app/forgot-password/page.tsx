import { Suspense } from 'react';
import { ForgotPasswordForm } from './_components/ForgotPasswordForm';
import { Skeleton } from '@/components/ui/skeleton';

const ForgotPasswordSkeleton = () => {
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
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Suspense fallback={<ForgotPasswordSkeleton />}>
            <ForgotPasswordForm />
        </Suspense>
    </div>
  );
} 