import { auth } from '@clerk/nextjs/server';
import EditServiceClient from './EditServiceClient';
import { Service, ServiceCategory } from '@/lib/types/service.types';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

async function getServiceCategories(token: string): Promise<ServiceCategory[]> {
    try {
        const response = await fetch(`${API_URL}/api/v1/service-categories`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch service categories:", error);
        return [];
    }
}

async function getService(id: string, token: string): Promise<Service | null> {
    try {
        const response = await fetch(`${API_URL}/api/v1/services/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch service:", error);
        return null;
    }
}

export default async function EditServicePage({ params }: { params: { id: string }}) {
  const { getToken } = await auth();
  const token = await getToken();
  if (!token) return <div>Unauthorized</div>;

  const [service, serviceCategories] = await Promise.all([
    getService(params.id, token),
    getServiceCategories(token)
  ]);

  if (!service) {
    return <div>Service not found or failed to load.</div>;
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <EditServiceClient service={service} serviceCategories={serviceCategories} />
    </div>
  );
}