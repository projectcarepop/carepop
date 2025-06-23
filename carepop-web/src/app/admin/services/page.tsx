import { auth } from '@clerk/nextjs/server';
import { ServiceTableClient } from './components/ServiceTableClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Toaster } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

async function getServices(): Promise<any[]> {
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) {
        console.error("Authentication token not found.");
        return [];
    }

    try {
        const response = await fetch(`${API_URL}/api/v1/services`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error(`Failed to fetch services: ${response.status} ${response.statusText}`);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error("An error occurred while fetching services:", error);
        return [];
    }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="w-full p-4 md:p-6">
        <Toaster richColors />
        <div className="flex items-center justify-between space-y-2 mb-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Services</h2>
                <p className="text-muted-foreground">
                    Manage the clinical services offered on the platform.
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <Button asChild>
                    <Link href="/admin/services/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add New Service
                    </Link>
                </Button>
            </div>
        </div>
        <ServiceTableClient data={services} />
    </div>
  );
} 