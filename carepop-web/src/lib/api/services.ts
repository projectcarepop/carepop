const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

export async function getServices() {
    const response = await fetch(`${API_BASE_URL}/public/services`);
    if (!response.ok) {
        throw new Error('Failed to fetch services');
    }
    const result = await response.json();
    return result.data;
}

export async function getProvidersForService(serviceId: string) {
    const response = await fetch(`${API_BASE_URL}/public/services/${serviceId}/providers`);
    if (!response.ok) {
        throw new Error('Failed to fetch providers for service');
    }
    const result = await response.json();
    return result.data;
}

export async function getProviderAvailability(providerId: string, serviceId: string, startDate: string, endDate: string) {
    const query = new URLSearchParams({ serviceId, startDate, endDate }).toString();
    const response = await fetch(`${API_BASE_URL}/public/providers/${providerId}/availability?${query}`);
    if (!response.ok) {
        throw new Error('Failed to fetch provider availability');
    }
    const result = await response.json();
    return result.data;
} 