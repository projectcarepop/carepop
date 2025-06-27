import ky from 'ky';

const api = ky.create({
    prefixUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787/api',
});

export async function getAdminStats(token: string) {
  return api.get('admin/stats', { headers: { Authorization: `Bearer ${token}` } }).json<any>();
}

export async function getAdminAppointments(token: string, filters: { date_from?: string, date_to?: string } = {}) {
    const searchParams = new URLSearchParams();
    if (filters.date_from) searchParams.set('date_from', filters.date_from);
    if (filters.date_to) searchParams.set('date_to', filters.date_to);

    return api.get('admin/appointments', {
        headers: { Authorization: `Bearer ${token}` },
        searchParams
    }).json<any>();
}

export async function getAppointmentDetails(appointmentId: string, token: string) {
    const response = await api.get(`admin/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const result = await response.json();
    // The backend now correctly wraps the response in 'data'
    return result.data; 
}

export async function addMedicalRecord(appointmentId: string, data: any, token: string) {
    return api.post(`admin/appointments/${appointmentId}/records`, {
        json: data,
        headers: { Authorization: `Bearer ${token}` }
    }).json();
}

export async function uploadDocument(appointmentId: string, documentName: string, file: File, token: string) {
    const formData = new FormData();
    formData.append('documentName', documentName);
    formData.append('file', file);

    return api.post(`admin/appointments/${appointmentId}/documents`, {
        body: formData,
        headers: { Authorization: `Bearer ${token}` }
    }).json();
} 