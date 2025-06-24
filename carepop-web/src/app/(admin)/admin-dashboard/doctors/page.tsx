import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { DoctorsClient } from '@/components/admin-dashboard/doctors/DoctorsClient';
import { type Doctor } from '@/types/app'; // Assuming Doctor type exists

async function getDoctors(accessToken: string): Promise<Doctor[]> {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        console.error('FATAL: API URL is not configured.');
        return [];
    }
    
    try {
        const res = await fetch(`${apiUrl}/api/admin/doctors`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            cache: 'no-store',
        });
        if (!res.ok) {
            console.error(`Failed to fetch doctors: ${res.statusText}`);
            return [];
        }
        const data = await res.json();
        return data.data as Doctor[];
    } catch (error) {
        console.error('An unexpected error occurred while fetching doctors:', error);
        return [];
    }
}

export default async function ManageDoctorsPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return null;
    
    const initialDoctors = await getDoctors(session.access_token);
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Doctors</h1>
                <p className="text-muted-foreground">
                    Add, edit, and manage doctor profiles and their associations.
                </p>
            </div>
            <DoctorsClient initialData={initialDoctors} />
        </div>
    );
} 