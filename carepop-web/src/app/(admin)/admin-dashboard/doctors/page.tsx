import { getAdminDoctors } from '@/services/api';
import { DoctorsClient } from '@/components/admin-dashboard/doctors/DoctorsClient';

export default async function ManageDoctorsPage() {
    const initialDoctors = await getAdminDoctors();
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Doctors</h1>
                <p className="text-muted-foreground">
                    Add, edit, and manage doctor profiles and their associations.
                </p>
            </div>
            <DoctorsClient initialData={initialDoctors || []} />
        </div>
    );
} 