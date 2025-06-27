import { PlusCircle } from 'lucide-react';
import { cookies } from 'next/headers';

import { Button } from '@/components/ui/button';
import ClinicsClient from './_components/ClinicsClient';
import { createClient } from '@/lib/supabase/server';

// This is a server component that fetches initial data
export default async function ManageClinicsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Fetch initial data on the server
  const { data: clinics, error } = await supabase
    .from('clinics')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    // A basic error handling mechanism. In a real app, you might use error.tsx
    return (
      <div className="text-red-500">
        Failed to load clinics: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Clinics</h1>
          <p className="text-muted-foreground">
            A list of all clinics in the system.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Clinic
        </Button>
      </div>
      <div className="mt-6">
        <ClinicsClient data={clinics || []} />
      </div>
    </div>
  );
}