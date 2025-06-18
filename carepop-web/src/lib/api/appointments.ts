const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

// This is a placeholder for how you might get the auth token.
// In a real app, this would come from your auth context or a session store.
const getAuthToken = () => {
    // This needs to be implemented based on your auth solution (e.g., Supabase session)
    // For now, I'm returning a placeholder. In a real scenario, you'd get this 
    // from the Supabase client-side session.
    return 'your-auth-token'; 
}

export async function createAppointment(details: { providerId: string, serviceId: string, startTime: string }) {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/public/appointments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(details),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book appointment');
    }

    const result = await response.json();
    return result.data;
} 