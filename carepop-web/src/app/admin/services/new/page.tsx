import { auth } from '@clerk/nextjs/server';
import NewServiceClient from './NewServiceClient';
import { Specialization } from '../components/ServiceForm';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

async function getSpecializations(): Promise<Specialization[]> {
    const { getToken } = await auth();
    const token = await getToken();
    if (!token) return [];

    try {
        const response = await fetch(`${API_URL}/api/v1/specializations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch specializations:", error);
        return [];
    }
}

export default async function NewServicePage() {
  const specializations = await getSpecializations();

  return (
    <div className="flex flex-col w-full gap-4">
      <NewServiceClient specializations={specializations} />
    </div>
  );
} 