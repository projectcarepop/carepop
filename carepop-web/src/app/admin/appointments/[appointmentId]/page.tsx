import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { AppointmentDetailsClient } from './_components/AppointmentDetailsClient';

interface AppointmentDetailsPageProps {
    params: {
        appointmentId: string;
    };
}

export default async function AppointmentDetailsPage({ params }: AppointmentDetailsPageProps) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        redirect(`/sign-in?redirect=/admin/appointments/${params.appointmentId}`);
    }

    return <AppointmentDetailsClient appointmentId={params.appointmentId} />;
} 