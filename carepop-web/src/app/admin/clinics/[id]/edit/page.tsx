import EditClinicClient from './EditClinicClient';
import { auth } from '@clerk/nextjs/server';
import { Clinic } from '@/lib/types/clinic.types';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

async function getClinic(id: string): Promise<Clinic | null> {
    const { getToken, userId } = await auth();
    if (!userId) return null;
    
    const token = await getToken();

    try {
        const response = await fetch(`${API_URL}/api/v1/clinics/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch clinic:", error);
        return null;
    }
}

interface EditClinicPageProps {
  params: {
    id: string;
  };
}

// This needs to be a server component to fetch data
export default async function EditClinicPage({ params }: EditClinicPageProps) {
  const clinic = await getClinic(params.id);

  if (!clinic) {
    return <div>Clinic not found or failed to load.</div>;
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <EditClinicClient clinic={clinic} />
    </div>
  );
} 