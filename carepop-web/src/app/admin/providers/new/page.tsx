import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderForm } from '../components/ProviderForm';
import { useRouter } from 'next/navigation';

export default function NewProviderPage() {
  // const router = useRouter(); // Uncomment if using client-side navigation

  const handleSuccess = () => {
    console.log('Provider created successfully, redirecting...');
    // TODO: Implement toast notification
    // toast({ title: "Provider Created", description: "The new provider has been successfully added." });
    // router.push('/admin/providers'); // Client-side redirect
    // For Server Components or if client-side router is not preferred here, 
    // Next.js 13+ App Router might handle redirects differently after Server Actions or form submissions.
    // If this page becomes a client component due to hooks like useRouter, 
    // ensure parent components are structured accordingly.
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/providers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Provider List
          </Link>
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Add New Provider</h1>
      </div>
      
      <ProviderForm onSubmitSuccess={handleSuccess} />

      {/* 
        TODO: Implementation details for ProviderForm:
        - Fields: First Name, Last Name, Email, Phone, Specialization, License, Credentials, Bio, Is Active
        - Validation using Zod
        - API call to POST /api/v1/admin/providers
        - Submission state and feedback (toasts)
      */}
    </div>
  );
} 