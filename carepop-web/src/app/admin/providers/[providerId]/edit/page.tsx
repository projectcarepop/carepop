import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProviderForm } from '../../components/ProviderForm';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cookies } from 'next/headers';

async function fetchProviderById(id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: providerData, error } = await supabase
    .from('providers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching provider:', error);
    // This will trigger the not-found page in Next.js
    return notFound();
  }

  return providerData;
}

interface EditProviderPageProps {
    params: {
        providerId: string;
    };
}

export default async function EditProviderPage({ params }: EditProviderPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const providerData = await fetchProviderById(resolvedParams.providerId);
  
  // Transform snake_case to camelCase for the form
  const initialData = {
    id: providerData.id,
    firstName: providerData.first_name,
    lastName: providerData.last_name,
    email: providerData.email,
    phoneNumber: providerData.contact_number,
    specialization: providerData.specialization,
    licenseNumber: providerData.license_number,
    credentials: providerData.credentials,
    isActive: providerData.is_active,
    avatarUrl: providerData.avatar_url,
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/providers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Providers
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Edit Provider</CardTitle>
          <CardDescription>
            Update the details for {initialData.firstName} {initialData.lastName}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderForm initialData={initialData} />
        </CardContent>
      </Card>
    </div>
  );
} 